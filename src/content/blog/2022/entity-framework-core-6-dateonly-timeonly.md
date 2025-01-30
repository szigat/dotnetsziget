---
title: "Entity Framework Core 6 - DateOnly, TimeOnly"
description: 'Entity Framework Core 6 - DateOnly, TimeOnly tárolása SQL Serveren'
slug: entity-framework-core-6-dateonly-timeonly
pubDatetime: 2022-02-23
featured: false
draft: false
author: Szigi
category: "entity framework"
tags: 
  - "C#"
  - "Entity Framework Core"
---

## Bevezetés

Az Entity Framework Core 6 remek támogatást nyújt ahhoz, hogy meghatározzuk az objektumaink egy-egy tulajdonsága milyen formában kerüljön tárolásra. Lehetőségünk van felülírni a konvenciókat és akár kontextus szinten is konfigurálhatjuk, hogy egy-egy típust hogyan is kezeljen.

A "régi" entity framework verzióban az első esetben trükközni kellett (elég az enum szöveges mezőbe történő mentésre gondolni). A második esetet nevezték egyedi konvenciónak (custom convention) és a Convention ősosztályból származtatott egyedi osztályba helyeztük a kódot. Természetesen egyszerűen a ModelBuilderen is beállíthattuk ezeket, de ez idővel az alkalmazás növekedésével egyre nagyobb átláthatatlanságot eredményezett.

## Entity Framework Core 6 - Példa

```csharp
// EmployeeDbContext.cs
public class EmployeeDbContext : DbContext
{
    public DbSet<Employee> Employees => Set<Employee>();

    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer(Configuration.ConnectionString);
}
public class Employee
{
    public int Id { get; set; }
    public string? Name { get; set; }
    public DateOnly Birthdate { get; set; }
    public TimeOnly ShiftStartTime { get; set; }
}

// Program.cs
using var context = new EmployeeDbContext();

context.Database.EnsureDeleted();
context.Database.EnsureCreated();

await context.Employees.AddAsync(new Employee
{
    Name = "Teszt Elek",
    Birthdate = new DateOnly(1987, 01, 07),
    ShiftStartTime = new TimeOnly(10, 0)
});
await context.SaveChangesAsync();
```

Amennyiben ezt így megpróbálnánk futtatni egyből kapnánk a hibaüzenetet, ami azt tartalmazná, hogy a DateOnly tulajdonsággal nem tudd mit kezdeni. A feladat az lesz, hogy a Birthdate tulajdonságot egy datetime mezőbe a ShiftStartTime tulajdonságot pedig egy nvarchar mezőbe mentsük. Azt fontos megemlíteni, hogy az Sql szerver használata esetén jelentkezik ez a probléma, de a SQLite esetén már van rá támogatás.

## Property alapú megoldás

Amire szükségünk lesz az a DbContext osztályunkban OnModelCreating metódus felülírása. A kapott modelBuilder paraméteren az alább látható módon kiválasztjuk a tulajdonságot.

```csharp
 modelBuilder.Entity<Employee>().Property(e => e.Birthdate)
```

És akkor most van szükségünk a HasConversion metódusra. Ennek többféle paraméterezése is lehetséges. Az egyik, hogy megadunk két expressiont. Ebben az esetben az első paraméter meghatározza, hogy hogyan lesz az eredeti típusból a céltípus. A második paraméter, pedig a fordított irányt írja le.

Az említett példánkat alapul véve az alábbi kódot rakhatjuk össze:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);
    modelBuilder.Entity<Employee>().Property(e => e.Birthdate)
        .HasConversion(dateOnly => dateOnly.ToDateTime(TimeOnly.MinValue), dateTime => DateOnly.FromDateTime(dateTime));

    modelBuilder.Entity<Employee>().Property(e => e.ShiftStartTime)
        .HasConversion(timeOnly => timeOnly.ToString(), str => TimeOnly.Parse(str))
        .HasMaxLength(5);
}
```

A célunk ennyivel is elértük, de nézzük meg a további lehetőségeinket. Jó lenne ha a kifejezések nem lennének beágyazva a fluent konfigurációs részbe. A ValueConverter osztályt használva különválaszthatjuk az alábbi módon:

```csharp
var converter = new ValueConverter<DateOnly, DateTime>(
    dateOnly => dateOnly.ToDateTime(TimeOnly.MinValue),
    dateTime => DateOnly.FromDateTime(dateTime));

modelBuilder.Entity<Employee>().Property(e => e.Birthdate)
    .HasConversion(converter);
```

Innen már csak egy lépés, hogy külön osztályba szervezzük az egészet.

```csharp
public class DateOnlyConverter : ValueConverter<DateOnly, DateTime>
{
    public DateOnlyConverter() 
        : base(
              dateOnly => dateOnly.ToDateTime(TimeOnly.MinValue),
              dateTime => DateOnly.FromDateTime(dateTime))
    {
    }
}

// használata
modelBuilder.Entity<Employee>().Property(e => e.Birthdate)
                .HasConversion<DateOnlyConverter>();
```

Ugyanezt a refaktorálást végig lehet vinni a TimeOnly konvertálással is.

```csharp
 public class TimeOnlyToStringConverter : ValueConverter<TimeOnly, string>
    {
        public TimeOnlyToStringConverter() 
            : base(
                  timeOnly => timeOnly.ToString(),
                  stringTime => TimeOnly.Parse(stringTime))
        {
        }
    }
```

## Konvenció

Nézzük meg, hogyan oldható meg, hogy az egész contextusunkban a fenti konverzió legyen érvényes alapértelmezetten. Ehhez a ConfigureConventions metódus felülírása szükséges és benne a konvertáló osztály megadása az adott típus esetén.

```csharp
protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
{
    base.ConfigureConventions(configurationBuilder);
    configurationBuilder.Properties<DateOnly>().HaveConversion<DateOnlyConverter>();
}
```

## Végeredmény

Végül a DbContextünk az alábbi módon néz ki:

```csharp
public class EmployeeDbContext : DbContext
{
    public DbSet<Employee> Employees => Set<Employee>();

    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer(Configuration.ConnectionString);

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<Employee>().Property(e => e.ShiftStartTime)
           .HasConversion<TimeOnlyToStringConverter>()
           .HasMaxLength(5);
    }

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        base.ConfigureConventions(configurationBuilder);
        configurationBuilder.Properties<DateOnly>().HaveConversion<DateOnlyConverter>();
    }
}
```

Természetesen a ValueConverter osztály használatával más/saját típusok megadott formában történő mentése is lehetséges.
