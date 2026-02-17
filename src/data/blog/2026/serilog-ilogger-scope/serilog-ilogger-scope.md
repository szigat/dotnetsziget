---
title: "Serilog és az ILogger Scope"
slug: serilog-es-az-ilogger-scope
description: ''
pubDatetime: 2026-02-15T22:00:00
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

Nemrégen megkérdezték tőlem, mi történik, ha egy ILogger scope-ot használunk Seriloggal, hogyan jeleníthető meg a scope információ a naplóbejegyzésekben és MS SQL Server adatbázisban. Nézzük meg, hogyan működik ez a gyakorlatban.

A korábbi naplózási [példából](./naplozas-adatbazisba-serilog-hasznalataval) indulok ki, ahol egy egyszerű ASP.NET Core web API projektben Serilogot használtunk naplózásra. Ehhez adtam hozzá scope-okat (azonnal kettőt), hogy lássuk egyből milyen hatással van a naplóbejegyzésekre.

``` csharp
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

Először nézzük meg a konzol kimenetet. Ehhez szükséges még egy módosítás a Serilog konfigurációban, hogy megjelenítse a scope információt a naplóbejegyzésekben:

``` json
 /// ...
 "WriteTo": [
    {
      "Name": "Console",
      "Args": {
        "outputTemplate": "[{Timestamp:HH:mm:ss} {Level:u3}] {Scope} - {Message}{NewLine}{Exception}"
      }
    },
    // ...
```

A konzol kimenetben látható, hogy a scope információ megjelenik a naplóbejegyzésekben. Az első log üzenet csak a "WeatherForecastScope" scope-ot tartalmazza, míg a második log üzenet mindkét scope-ot ("WeatherForecastScope" és "InnerWeatherForecastScope") megjeleníti.

![console output with scope](consoleoutputwithscope.png)

### Adatbázis kimenet

Mindenféle beállítás nélkül a scope információ a Properties sql oszlopben található meg. Mutatom is, hogyan néz ki:

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

Ez nehezen szűrhető és olvasható, de a korábbi példámban megmutattam hogyan lehet json formátumban is tárolni a serilog által naplózott adatokat. Ilyenkor ebbe a mezőbe is bekerül a Scope információ, ami egy json tömbként jelenik meg.

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

### Amit még érdemes megemlíteni

Csak a paraméterezéskor használt érték kerül át a Scope információba.
Amennyiben a `state` paraméternek komplex ért