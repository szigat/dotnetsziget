---
title: "Attól, hogy console még lehet szép! Spectre Console"
description: 'A console alkalmazások továbbra is a hétköznapjaink részét képezik. Ezek különböző feladatot látnak el és megjelenítésük is lehet esztétikus.'
slug: attol-hogy-console-meg-lehet-szep
pubDatetime: 2021-09-13
featured: false
draft: false
author: Szigi
category: 'csharp'
tags: ["csharp","console","spectre"]
---

A console alkalmazások továbbra is a hétköznapjaink részét képezik. Ezek különböző feladatot látnak el (pl. fejlesztést, telepítést, vagy tesztelést támogató eszközök). Én az utóbbi időben egyszerűbb interakciót nem igénylő command line toolokat fejlesztettem. Néha szükség lenne egy kicsit vizuálisabb, barátibb felületre, még ha console alkalmazásról is van szó. Erre kerestem valamilyen megoldást és megtaláltam a Spectre Console nevű csomagot. Egy-két olyan funkcióját szeretném megmutatni, ami nekem a leginkább tetszett.

## Vágjunk is bele

Egy látványos filget hello world banner az alábbi módon lehet készíteni:

``` csharp
static void Main(string[] args)
{
    AnsiConsole.Render(
        new FigletText("Hello world")
        .LeftAligned()
        .Color(Color.Red));
}
```

![figlet hello world](https://dotnetsziget.wordpress.com/wp-content/uploads/2021/09/image.png?w=798)

Az AnsiConsole osztály fogjuk a legtöbbször használni. Ezen keresztül érhető el minden, amire szükségünk van. Példának nézzük meg, hogy egy egyszerű szöveg egy részének a formázása mennyire egyszerű. Ehhez csak szögletes zárójelben meg kell jelölni a kívánt formázást majd a formázást zárni kel, ott ahol szeretnénk a "\[/\]" karakterekkel (a dokumentáció alapján könnyen elsajátítható).

```
AnsiConsole.MarkupLine("[underline red]Hello[/] Installer!");
```

![spectre markup line "hello installer" example](https://dotnetsziget.wordpress.com/wp-content/uploads/2021/09/image-3.png?w=596)

## Csak egyet szeretnék

Készítsünk most egy olyan megoldást, ahol több objektum közül lehet választani. A következő képen látható az envoironment osztály. A példa környezetek DEV1-től négyig vannak és utána még jön a DEV\_TEST, UAT és a PROD.

![example environment class ](https://dotnetsziget.wordpress.com/wp-content/uploads/2021/09/image-2.png?w=710)

Az alábbi kóddal jeleníthetjük meg console-on választható formában őket:

``` csharp
Environment selectedEnvironment = AnsiConsole.Prompt(
        new SelectionPrompt<Environment>()
        .UseConverter(e => e.Name)
        .Title("Choose an [green]environment[/]?")
        .PageSize(5)
        .MoreChoicesText("[grey](Move up and down to reveal more environment)[/]")
        .AddChoices<Environment>(Environment.GetEnvironments())
    );
```

![spectre selection prompt result](https://dotnetsziget.wordpress.com/wp-content/uploads/2021/09/image-4.png?w=1024)

Generikusban megadtam a típust, majd a UseConverterben egy olyan functiont, ami stringet ad vissza (jelen esetben a nevét). Ez fog majd megjelenni a felületen. Utána beállítottam egy lap méretet, ami megadja, hogy egyszerre hány választható elem látszódjon és milyen szöveg jelenjen meg az alján. Végül a választható elemek átadása látható.

## Táblázatos megjelenítés

Következő, amit szeretnék megmutatni az a táblázatos megjelenítés. A korábban mutatott osztályt használtam fel ehhez, annyi módosítással, hogy hozzáadtam még egy Status enumot. A táblázat összerakás pontosan úgy működik mint, ahogyan azt elvárnánk. Megadjuk az oszlopokat és utána feltöltjük sorokkal. Igazításra is van lehetőség, ezt a TableColumn osztályon tudjuk beállítani.

``` csharp
var table = new Table();
table.AddColumn(new TableColumn("Id").Centered());
table.AddColumn(new TableColumn("Name").LeftAligned());
table.AddColumn(new TableColumn("Status").Centered());
Environment.GetEnvironments().ToList()
.ForEach(e =>
{
    table.AddRow(e.Id.ToString(), e.Name, e.Status.ToString());
});
AnsiConsole.Render(table);
```

![spectre table result](https://dotnetsziget.wordpress.com/wp-content/uploads/2021/09/image-5.png?w=367)

## Exception string másképpen

Eljutottunk az utolsó olyan képességéhez, amit mindenképpen szerettem volna bemutatni, ez pedig az exception megjelenítés. Lent látható módon előidézünk egy ArgumentNullException-t. Alatta lévő kódban az összes lehetséges kiíratási beállítást meghívtam, hogy látható legyen a különbség közöttük és egy exception ToString metódushívás által adott szöveg között.

``` csharp
private static void HandleEnvironment(Environment environment)
{
    if (environment is null)
    {
        throw new ArgumentNullException(nameof(environment));
    }
    Console.WriteLine($"Selected env id:{environment.Id} name: {environment.Name}");
}
```

``` csharp
try
{
    HandleEnvironment(null);
}
catch(Exception ex)
{
    Console.WriteLine("------ ex.ToString()");
    Console.WriteLine(ex.ToString());
    Console.WriteLine("------ Default");
    AnsiConsole.WriteException(ex);
    Console.WriteLine("------ ShortenEverything");
    AnsiConsole.WriteException(ex,ExceptionFormats.ShortenEverything);
    Console.WriteLine("------ ShortenMethods");
    AnsiConsole.WriteException(ex,ExceptionFormats.ShortenMethods);
    Console.WriteLine("------ ShortenPaths");
    AnsiConsole.WriteException(ex,ExceptionFormats.ShortenPaths);
    Console.WriteLine("------ ShortenTypes");
    AnsiConsole.WriteException(ex,ExceptionFormats.ShortenTypes);
    Console.WriteLine("------ ShowLinks");
    AnsiConsole.WriteException(ex,ExceptionFormats.ShowLinks);
}
```

![spectre exception output results](https://dotnetsziget.wordpress.com/wp-content/uploads/2021/09/image-6.png?w=1024)

Az első különbség, ami feltűnik, az a színezés. Kiemeli a hibaüzenetet és azt is, hogy milyen metódusban és hol dobódott a kivétel. Utána láthatóak a különböző ExceptionFormat beállítások hatásai. Ezek között mindenféle rövidítési lehetőség van (metódus rövidítés, típus rövidítés, útvonal rövidítés és ezek kombinációja), ami által még olvashatóbb lehet egy hibaüzenet.

## Ami kimaradt

A Spectre dokumentációjában megtalálható minden, ami kimaradt. A teljesség igénye nélkül pár példa: bar chart, calendar, progress, tree, stb. Van még a megjelenítéshez nem kapcsolódó része a csomagnak, ez pedig a CLI commandok készítése. Ezt majd egy külön bejegyzésben tervezem bemutatni. A dokumentáció pedig az alábbi linken érhető el: [https://spectreconsole.net/](https://spectreconsole.net/)
