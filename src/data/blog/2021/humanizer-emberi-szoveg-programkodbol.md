---
title: "Humanizer - emberi szöveg programkódból"
description: 'A humanizer egy olyan csomag, amivel könnyedén manipulálhatjuk bizonyos értékeinket, illetve azok megjelenítését.'
slug: humanizer-emberi-szoveg-programkodbol
pubDatetime: 2021-06-10
featured: false
draft: false
author: Szigi
category: 'csharp'
tags: 
  - "csharp"
  - "humanizer"
---

A humanizer egy olyan csomag, amivel könnyedén manipulálhatjuk bizonyos értékeinket, illetve azok megjelenítését. Használatához csak a Humanizer.Core nuget csomagra van szükség és még nyelvi csomagok közül válogathatunk. (Például a magyar csomagot Humanizer.Core.hu néven találjuk.) Egy másik lehetőség a Humanizer csomag telepítése ebben benne van a core és az összes nyelvi csomag.

## Nézzük mire is jó a Humanizer

Lényegében egy adag extension methodról beszélünk, amit különböző típusokra aggathatunk rá, hogy ezzel valamilyen emberi formát adjunk neki. Nézzük mit is jelent ez a gyakorlatban.

### Stringek esetén

Stringek esetén lehetőségünk van rendes, emberbarát, olvasható szöveggé alakítani, míg ennek ellenkezőjére is nyújt támogatást. Szóval inkább a számítógépek, vagy programozóknak kedvezőbb formára is tudunk alakítani szövegeket. Jól jöhet ha változó, vagy metódus neveket kell olvashatóbbá tenni.

```csharp
"test-of-the-email_title".Humanize(),
"test-of-the-email_title".Humanize(LetterCasing.Sentence),
"test of the email title".Transform(To.UpperCase),

"Test title of mail".Dehumanize(),
"Test title of mail".Underscore(),
"Test title of mail".Kebaberize(),
```

Eredménye:

```
test of the email title
Test of the email title
TEST OF THE EMAIL TITLE

TestTitleOfMail
test_title_of_mail
test-title-of-mail
```

Truncate függvény segítségével megvághatjuk szövegeinket ugyanolyan hosszúságúra. Paraméterezésének köszönhetően mi adhatjuk meg, mennyi és milyen karaktersorozat legyen a karakterláncvégén.

```csharp
"Lorem ipsum dolor sit amet, consectetur adipiscing elit.".Truncate(10)
"Lorem ipsum dolor sit amet, consectetur adipiscing elit.".Truncate(10,"...")
```

Eredménye:

```
Lorem ips.
Lorem i...
```

### Dátumokkal kapcsolatos lehetőségek

Számomra az egyik kedvenc képessége a szöveges idő megjelenítés. Az hogy kellemesen olvasható módon ki tudjuk írni, hogy mennyi idő is telt el az jól tudd mutatni a felületen és néha hasznosabb is mint a dátum megjelítése. Valamint itt már előkerül a nyelvi csomag által nyújtott előny is.

```csharp
DateTime.UtcNow.AddHours(-30).Humanize()
DateTime.UtcNow.AddHours(-30).Humanize(culture: new CultureInfo("hu-HU"))
DateTime.UtcNow.AddMinutes(-30).Humanize(culture: new CultureInfo("hu-HU"))
DateTime.UtcNow.AddMinutes(71).Humanize(culture: new CultureInfo("hu-HU"))

TimeSpan.FromDays(2).Humanize(culture: new CultureInfo("hu-HU"))
TimeSpan.FromDays(486).Humanize(maxUnit: TimeUnit.Month, precision: 2,culture: new CultureInfo("hu-HU"))

(DateTime.Now + 2.Days() + 3.Hours() - 5.Minutes()).ToString()
```

Eredménye:

```
yesterday
tegnap
30 perce
egy óra múlva

2 nap
15 hónap, 29 nap

2021. 06. 11. 0:16:21
```

### Azok a számok...

Gondolom itt már senkit nem lepek meg azzal, hogy a számokat is át tudja alakítani. Itt sajnos előjön a magyar csomag hiányossága, méghozzá az, hogy nem tudja kiírni magyar szavakkal a számok értékét. Ilyenkor az angol szavakat használja. Amennyiben ezen túllépünk, azért találhatunk magunknak hasznos funkciókat még akkor is, ha a magyar nyelvet szeretnénk használni. Ilyen például a római számokra való alakítást és tárolókapacitás-mértékegységek megjelenítése, kezelése.

```csharp
123456.ToMetric()
1999.ToRoman()
10.Megabytes().Kilobytes.ToString()
10.Megabytes().Humanize()
1024.Kilobytes().Humanize()

3501.ToWords( new CultureInfo("hu-HU"))
11.ToOrdinalWords( new CultureInfo("hu-HU"))
```

Eredménye:

```
123,456k
MCMXCIX
10240
10 MB
1 MB

three thousand five hundred and one
eleventh
```

Igyekeztem bemutatni egyes részeit ennek a csomagnak, amennyiben többet szeretnél róla megtudni ajánlom a github oldalukat: [https://github.com/MehdiK/Humanizer](https://github.com/MehdiK/Humanizer)
