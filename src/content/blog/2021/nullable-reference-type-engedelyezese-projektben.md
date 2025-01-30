---
category: csharp
description: 'C# 8 óta van lehetőség nullable reference type-ok használatára. Először is engedélyeznünk kell a projekten ezt a lehetőséget.'
slug: nullable-reference-type-engedelyezese-projektben
pubDatetime: 2021-07-06T00:00:00.000Z
featured: false
draft: false
author: Szigi
tags:
  - csharp
  - visual-studio
title: Nullable reference type engedélyezése projekten
---

C# 8 óta van lehetőség nullable reference type-ok használatára. Először is engedélyeznünk kell a projekten ezt a lehetőséget. Ezt úgy tudjuk megtenni, hogy a csproj-t megnyitjuk szerkesztésre és a \<Nullable>enable\</Nullable> sort beletesszük, ahogyan az alábbi példában látható:

```xml
 <PropertyGroup>
    <TargetFramework>net5.0</TargetFramework>
    <Nullable>enable</Nullable>
 </PropertyGroup>
```

A következő példát alapul véve a Visual Studio jelzi, hogy null hozzárendelés történhet.

```csharp
public class ClassA
{
    public string? Name { get; set; }
}

public class ClassB
{
    private readonly ClassA _c;

    public ClassB(ClassA? c)
    {
        _c = c;
    }
}
```

<figure>
  ![](https://dotnetsziget.wordpress.com/wp-content/uploads/2021/07/image.png?w=696)

  <figcaption>
    Possible null reference warning
  </figcaption>
</figure>

A Visual Studio Error List fülén jelzi warninggal, sőt alá is húzza nekünk a veszélyes részt, de az öröm valahogy mégsem teljes, mert a kód fordul és futtatható. Kicsit szigorítsunk a dolgon.

A legegyszerűbb megoldás, hogy beállítjuk azt, hogy tekintse hibának tekintse a nullable típusú warningokat. Ehhez az alábbi sorral kel kiegészíteni a projekt fájlunkat:

```xml
<PropertyGroup>
  <TargetFramework>net5.0</TargetFramework>
<Nullable>enable</Nullable>
<WarningsAsErrors>nullable</WarningsAsErrors>
</PropertyGroup>
```

Látszólag sok változás nem történik ezután, ennek ellenére, ha megpróbáljuk buildelni, akkor hibát fog jelezni az output ablakban és ki is írja, hogy mi a gond.

<figure>
  ![](https://dotnetsziget.wordpress.com/wp-content/uploads/2021/07/image-1.png?w=1024)

  <figcaption>
    Build failed result
  </figcaption>
</figure>

Így már kicsit hasznosabb ez a funkció. Az még mindig zavar, hogy továbbra sem jelzi hibának fordítás nélkül és az Error List fülön is warning marad.

A végére egy kis érdekesség. Amennyiben nem szeretnénk egy egész projekten engedélyezni csak egy fájlon, vagy területen, akkor a #nullable enable és a #nullable disable/restore párost lehet használni (az utóbbi csak akkor kell, ha területet szeretnénk megadni).

```csharp
 #nullable enable
 string? a = null;
 #nullable restore
```
