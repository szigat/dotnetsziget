---
title: "ILogger scope és Serilog kapcsolata"
slug: ilogger-scope-serilog-kapcsolata
description: 'Megnézzük, hogyan kezeli a Serilog az ILogger scope-okat: megjelenítés konzolon, mentés SQL Serverbe, és a BeginScope() state típusainak hatása a log eventre.'
pubDatetime: 2026-02-21T14:00:00
featured: false
draft: false
author: Szigi
tags: 
  - "ASP .NET Core"
  - "logging"
  - "serilog"
  - "sql"
  - "csharp"
---

## Serilog és az ILogger Scope

Nemrég megkérdezték tőlem, mi történik, ha egy `ILogger` scope-ot használunk Seriloggal, hogyan jeleníthető meg a scope információ a naplóbejegyzésekben, akár MS SQL Szerverbe történő naplózáskor. Nézzük meg, hogyan működik ez a gyakorlatban.

A korábbi naplózási [példából](https://dotnetsziget.dev/posts/naplozas-adatbazisba-serilog-hasznalataval) indulok ki, ahol egy egyszerű ASP.NET Core Web API példában Serilogot használtunk naplózásra. Ehhez adtam hozzá scope-okat (rögtön kettőt), hogy azonnal lássuk, milyen hatása van az egymásba ágyazott hatóköröknek.

``` csharp
Log.Logger = new LoggerConfiguration()
        .ReadFrom.Configuration(builder.Configuration)
        .CreateLogger();

app.MapGet("/weatherforecast", (ILogger<Program> logger) =>
{
    var forecast = Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();

    using IDisposable? loggerScope = logger.BeginScope("WeatherForecastScope");
    logger.LogDebug("First log message");

    using IDisposable? innerLoggerScope = logger.BeginScope("InnerWeatherForecastScope");
    logger.LogInformation("Loaded weather forecast count: {count}", forecast.Length);

    return forecast;
})
.WithName("GetWeatherForecast");
```

### Console kimenet

Először nézzük meg a konzol kimenetet. Ehhez szükség van egy módosításra a Serilog konfigurációban, hogy megjelenítse a scope információt a naplóbejegyzésekben:

``` json
 "WriteTo": [
    {
      "Name": "Console",
      "Args": {
        "outputTemplate": "[{Timestamp:HH:mm:ss} {Level:u3}] {Scope} - {Message}{NewLine}{Exception}"
      }
    },
 ]
```

A konzol kimenetben látható, hogy a scope információ megjelenik a naplóbejegyzésekben. Az első log üzenet csak a "WeatherForecastScope" scope-ot tartalmazza, míg a második log üzenet mindkét scope-ot ("WeatherForecastScope" és "InnerWeatherForecastScope") megjeleníti.

![console output with scope](consoleoutputwithscope.png)

### Adatbázis kimenet

Külön beállítás nélkül a scope információ a `Properties` sql oszlopben található meg. Mutatom is, hogyan néz ki:

``` xml
<properties>
<!-- ... -->
    <property key='Scope'>
        <sequence>
            <item>WeatherForecastScope</item>
        </sequence>
    </property>
<!-- ... -->
</properties>
```

``` xml
<properties>
<!-- ... -->
    <property key='Scope'>
        <sequence>
            <item>WeatherForecastScope</item>
            <item>InnerWeatherForecastScope</item>
        </sequence>
    </property>
<!-- ... -->
</properties>
```

Ez nehezen szűrhető és olvasható, de a korábbi példámban megmutattam hogyan lehet JSON formátumban is tárolni a Serilog által naplózott adatokat. Ilyenkor ebbe a mezőbe is bekerül a Scope információ, ami egy JSON tömbként jelenik meg.

``` json
{
  "TimeStamp": "2026-02-15T18:51:25.0577241",
  "Level": "Information",
  "Message": "Loaded weather forecast count: 5",
  "MessageTemplate": "Loaded weather forecast count: {count}",
  "Properties": {
    "count": 5,
    "SourceContext": "Program",
    "RequestId": "0HNJCNB84BNEC:00000003",
    "RequestPath": "/weatherforecast",
    "ConnectionId": "0HNJCNB84BNEC",
    "Scope": [
      "WeatherForecastScope",
      "InnerWeatherForecastScope"
    ]
  }
}
```

Természetesen a Scope információt külön oszlopban is tárolhatjuk, ehhez szükséges egy új oszlop hozzáadása a Log táblához.

``` sql
ALTER TABLE dbo.Logs 
ADD Scope nvarchar(MAX) NULL
```

Ezután a Serilog konfigurációban meg kell adni, hogy a Scope információ külön oszlopba kerüljön. Ehhez az additionalColumns beállításban helyezzük el az alábbi konfigurációt.

``` json
{
  "ColumnName": "Scope",
  "DataType": "nvarchar",
  "DataLength": -1
}
```

A beállítás után a Scope információ külön oszlopban jelenik meg az adatbázisban, ami könnyebben szűrhető és olvasható.

![log table rows](log-table-rows.png)

``` json
[
  "WeatherForecastScope",
  "InnerWeatherForecastScope"
]
```

### A teljes konfiguráció

``` json
"Serilog": {
  "Using": [
    "Serilog.Sinks.Console",
    "Serilog.Sinks.MSSqlServer"
  ],
  "MinimumLevel": {
    "Default": "Debug",
    "Override": {
      "Microsoft.AspNetCore": "Warning",
      "System": "Warning"
    }
  },
  "WriteTo": [
    {
      "Name": "Console",
      "Args": {
        "outputTemplate": "[{Timestamp:HH:mm:ss} {Level:u3}] {Scope} - {Message}{NewLine}{Exception}"
      }
    },
    {
      "Name": "MSSqlServer",
      "Args": {
        "connectionString": "LogDbConnectionString",
        "sinkOptionsSection": {
          "tableName": "Logs"
        },
        "columnOptionsSection": {
          "addStandardColumns": [
            "LogEvent"
          ],
          "additionalColumns": [
            {
              "ColumnName": "RequestId",
              "DataType": "nvarchar",
              "DataLength": 36
            },
            {
              "ColumnName": "Scope",
              "DataType": "nvarchar",
              "DataLength": -1
            }
          ]
        }
      }
    }
  ]
}
```

### Kulcs-érték és egyéb típusok

Amennyiben a `BeginScope` paraméter `Dictionary<string, object>`, `IEnumerable<KeyValuePair<string, object>>`, `ValueTuple<string, object>`, vagy `ITuple` (ha támogatott és két tulajdonságot tartalmaz, ahol az első string) típusú, akkor nem jön létre Scope tulajdonság (üres értéket látunk majd). Ilyenkor a szöveges kulccsal kerül be a Properties gyűjteménybe és az objektum lesz az érték. Bármilyen más típus esetén a paramétert a Serilog a saját `PropertyValueConverter` osztálya segítségével alakítja át és az így kapott érték kerül a Scope mezőbe.

Módosítsuk az egyik BeginScope hívást

``` csharp
using IDisposable? loggerScope = logger.BeginScope(new Dictionary<string, object> {
    { "ExampleKey1",new ExampleRecord("Joe",22)},
    { "ExampleKey2","Value2"}
});

public sealed record ExampleRecord(string name, int age);
```

Ebben az esetben az alábbi Log event lesz látható az adatbázisban:

``` json
{
  "TimeStamp": "2026-02-21T12:17:17.0714813",
  "Level": "Debug",
  "Message": "First log message",
  "MessageTemplate": "First log message",
  "Properties": {
    "SourceContext": "Program",
    "ExampleKey1": "ExampleRecord { name = Joe, age = 22 }",
    "ExampleKey2": "Value2",
    "RequestId": "0HNJH62EB061D:00000008",
    "RequestPath": "/weatherforecast",
    "ConnectionId": "0HNJH62EB061D"
  }
}
```

Innentől kezdve, ha külön szeretnénk látni bármelyiket csak vegyük fel az additionalColumns gyűjteménybe vagy akár az outputTemplate-be és kész.
