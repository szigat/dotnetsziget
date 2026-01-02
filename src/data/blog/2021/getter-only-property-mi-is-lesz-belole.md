---
title: "Getter only property - Mi lesz belőle?"
description: ''
pubDatetime: 2021-02-09
slug: getter-only-property-mi-is-lesz-belole
featured: false
draft: false
author: Szigi
category: 'csharp'
tags: ["csharp"]
---

A C# nyelv fejlődésével egyre könnyebb, rövidebb a propertyk felvétele és értékadása. Ezeket előszeretettel használjuk is. A csak olvasható propertyk alapértelmezett értékeinek megadására is több lehetőség van. Lejjebb három példát mutatok és lehet mindegyik helyesnek tűnik azonban az egyik másképpen viselkedik.

``` csharp
public class Test1
{
    public Test1()
    {
        Id = Guid.NewGuid();
    }
    
    public Guid Id {get;}
}

public class Test2
{
    public Guid Id {get;} = Guid.NewGuid();
}

public class Test3
{
    public Guid Id => Guid.NewGuid();
}
```

```csharp
Code:
var test1 = new Test1();
var test2 = new Test2();
var test3 = new Test3();

Console.WriteLine(test1.Id);
Console.WriteLine(test2.Id);
Console.WriteLine(test3.Id);
Console.WriteLine("-------");
Console.WriteLine(test1.Id);
Console.WriteLine(test2.Id);
Console.WriteLine(test3.Id);

Output:
e961edb7-eff9-44ed-9fd4-a375de18fd86
34a03af1-bdd6-4868-ac9d-a1f3e9227588
c6aacb45-9f4a-4983-b0f2-8ce62c466daa
-------
e961edb7-eff9-44ed-9fd4-a375de18fd86
34a03af1-bdd6-4868-ac9d-a1f3e9227588
53b973d5-e5d5-4295-a0fd-28c10bbe0aa4
```

A Test3 esetén egy nem várt eredményt kaptunk. Nézzük is meg, hogy mi történik a motorháztető alatt:

```csharp
public class Test1
{
    [CompilerGenerated]
    [DebuggerBrowsable(DebuggerBrowsableState.Never)]
    private readonly Guid <Id>k__BackingField;

    public Guid Id
    {
        [CompilerGenerated]
        get
        {
            return <Id>k__BackingField;
        }
    }

    public Test1()
    {
        <Id>k__BackingField = Guid.NewGuid();
    }
}

public class Test2
{
    [CompilerGenerated]
    [DebuggerBrowsable(DebuggerBrowsableState.Never)]
    private readonly Guid <Id>k__BackingField = Guid.NewGuid();

    public Guid Id
    {
        [CompilerGenerated]
        get
        {
            return <Id>k__BackingField;
        }
    }
}

public class Test3
{
    public Guid Id
    {
        get
        {
            return Guid.NewGuid();
        }
    }
}
```

Jól látható, hogy amíg a Test1 és Test2 osztályokban egy readonly property generálódik, addig a Test3 esetén egy gettert készít neki. Ez azt eredményezi, hogy amikor valaki ráhív a propertyre, akkor egy új guidot fog kapni.

Ez egy fontos eltérés, ami akkor okozhat még problémát ha egy példányosítás (, vagy olyan hívás, ami osztályok létrehozását váltja ki) van megadva a lambda kifejezés után. Ilyenkor annak ellenére, hogy nem szeretnénk több példányt, mégis minden híváskor létrejön majd egy, vagy több. Továbbá ha a mennyiséget figyelmen kívül hagyjuk, akkor is fenn állhat az a veszély, hogy nem azon az objektumot dolgozunk, amin szeretnénk.

Amennyiben bárkit érdekel, hogy egy kódból mit is generál valójában a compiler az ennek az oldalnak a használatával könnyen meg tudja nézni: [https://sharplab.io/](https://sharplab.io/)
