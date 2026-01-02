---
title: "Fluent Assertions - Assertion Scope használata"
description: 'Bizonyos teszteknél előfordul, hogy sok állítás/ellenőrzés található ezeknek a végén és probléma esetén ilyenkor nem látjuk valójában mennyit rontottunk. Ebben segíthet az Assertion Scope használata'
slug: fluent-assertions-assertion-scope-hasznalata
pubDatetime: 2021-01-10
featured: false
draft: false
author: Szigi
category: "test"
tags: ["fluent-assertion","csharp"]
---

## Assertion Scope

Bizonyos teszteknél előfordul, hogy sok állítás/ellenőrzés található ezeknek a végén és probléma esetén ilyenkor nem látjuk valójában mennyit rontottunk. Az alapvető működés az, hogy a teszt az első hibára futó ellenőrzés után megáll és ebből fakadóan nem látjuk a következő problémát, ha van ilyen. Amennyiben ezt elkerülnénk lehetőségünk van bizonyos eszközök esetén úgynevezett scope-ba rakni ezeket az ellenőrző részeket. Ennek az az előnye, hogy nem fog megállni a teszt futása az első bukott ellenőrzéskor, hanem folytatja a többivel és a végén megkapunk minden információt. A lényeg, hogy ezzel a módszerrel elkerülhetjük azt, hogy a teszt finomítása, javítása után látjuk csak a következő üzenetet. Ehhez én a Fluent Assertion csomagot szoktam használni, de ez a funkcionalitás megtalálható másikban is (pl. NUnit). Nekem ez leginkább integrációs teszteknél szokott jól jönni.

_Annak, aki nem ismeri a Fluent Assertions-t és az ehhez hasonló csomagokat annak röviden a lényegük az, hogy ezek használatával informatívabb hibaüzenetekhez lehet jutni bukott tesztek esetén._

Nézzük meg az alábbi példát:

``` csharp
public class User
{
    public int Id { get; set; }

    public string FullName { get; set; }

    public IEnumerable<Address> Addresses { get; set; }
}
```

A teszten belül pedig ez látható:

``` csharp
// ACT
User user = GetUserById(1);

// ASSERT
using (var scope = new AssertionScope())
{
    user.Should().NotBeNull();
    user.Id.Should().Be(1);
    user.FullName.Should().Be("Teszt Elek");
    user.Addresses.Should().NotBeNull();
    user.Addresses.Should().HaveCount(3);
}
```

```powershell
Expected user.FullName to be 
"Teszt Elek" with a length of 10, but 
"Munka Pál" has a length of 9, differs near "Mun" (index 0).
Expected user.Addresses not to be <null>.
Expected user.Addresses to contain 3 item(s), but found <null>.
```

Anélkül, hogy látnánk a kódot pontosan meg tudjuk mondani, hogy mi is a probléma és azonnal nem csak azt kezdhetjük nézni, hogy miért is lett más a felhasználó neve, hanem azt is, hogy a címek között miért nincs egyetlen elem sem. Persze ez csak egy kicsi példa, ahol nem nagy probléma ha az egyik hiba kijavítása után szembesülnénk a következővel.

## További lehetőségek

### Plusz információ hozzáadása a AssertionScope-hoz

Bukott tesztek esetén van lehetőség a scope által adott eredménynek a végéhez további információkat hozzátenni az AddReportable metódust használva. Ebben az esetben egy kulcsot és egy értéket vár.

``` csharp
scope.AddReportable("Additional information","User test");
scope.AddReportable("Another information", "User test 2");
```

Ebben az esetben a kimenet az alábbi lesz:

```
Message: 
  Expected user.FullName to be 
  "Teszt Elek" with a length of 10, but 
  "Munka Pál" has a length of 9, differs near "Mun" (index 0).
  ...

  With Additional information:
  User test
  With Another information:
  User test2
```

Ezeket inkább integrációs teszteknél találtam hasznosnak, mert olyankor jött jól, hogy bukott teszt esetén ezzel hozzá tudtam tenni valami plusz információt. Természetesen a test outputra bármikor lehet írni, de az mindig kiíródik, az AddReportable-ben megadottakkal ellentétben.

#### Objektumok hozzáadása a AssertionScope-hoz

Ezt csak említés szintjén hozom fel, mert ez egy olyan funkció amit sosem használtam és nem is éreztem úgy, hogy szükségem lenne rá. Van lehetőség objektumokat hozzáadni a scope-hoz az AddNonReportable metódus használatával (string key, object value paraméterezéssel), amihez tartozik egy Get\<T\>(key) metódus az objektum kinyeréséhez (hatóköre az adott és a hozzá tartozó beágyazott scope-ok).

### AssertionScope állapota

Az alábbi kóddal lehetőség van lekérdezni egy scope állapotát. Ennek segítségével könnyen egyedi kóddal kiegészíthetjük a tesztünkben az ellenőrzési részt, aminek lefutása függ az állapottól.

``` csharp
bool hasFailures = scope.HasFailures();
```

### Scope elnevezése és a WithExpectation metódus

A létrehozott scope-nak adhatunk nevet. Ez történhet a konstruktor paraméterével, vagy a scope Context változója használatával. Ebben az esetben minden üzenetnek a scope-on belül a megadott név fog szerepelni a változó neve helyén. Ezzel nekem személy szerint az volt a problémám, hogy ilyenkor elveszítem pont azt az értékes információt, hogy mivel is van gond.

``` csharp
var scope = new AssertionScope("User test")
```

Az első üzenetet ha megnézzük látható hogy _User test_ lett a _user.FullName_ helyett.

```
Expected User test to be 
    "Teszt Elek" with a length of 10, but 
    "Munka Pál" has a length of 9, differs near "Mun" (index 0).
```

A fenti elnevezés helyett ajánlom inkább a WithExpectation metódust aminek string paramétere minden üzenet elé oda fog kerülni. Tartozik hozzá egy ClearExpectation metódus is, ami ahogyan neve is sugallja az Expectationt törli a scope-ról így a további üzenetek esetén nem fog már megjelenni.

``` csharp
scope.WithExpectation("Addresses expectations: ");
user.Addresses.Should().NotBeNull();
scope.ClearExpectation();
user.Addresses.Should().HaveCount(3);
```

```
Addresses expectations: Expected user.Addresses not to be <null>.
Expected user.Addresses to contain 3 item(s), but found <null>.
```

## Több scope és nested scope

A Fluent Assertions tudja kezelni a több scope és a scope a scope-ban helyzetet is. A lenti példa eredménye ugyanaz mint eddig lesz mint eddig.

``` csharp
using (var scope = new AssertionScope())
{
    user.Should().NotBeNull();
    user.Id.Should().Be(1);
    user.FullName.Should().Be("Teszt Elek");

    using (var nestedScope = new AssertionScope())
    {
        user.Addresses.Should().NotBeNull();
        user.Addresses.Should().HaveCount(3);
    }
}
```

Módosítsuk meg ezt egy kicsit:

```csharp
using (var scope = new AssertionScope())
{
    user.Should().NotBeNull();
    user.Id.Should().Be(1);
    user.FullName.Should().Be("Teszt Elek");

    using (var nestedScope = new AssertionScope().WithExpectation("Addresses count should be 3: "))
    {
        user.Addresses.Should().NotBeNull();
        user.Addresses.Should().HaveCount(3);
    }
}
```

A WithExpectation metódus használatával például el lehet különíteni a scope-on belüli üzeneteket. Ebben az esetben a kimeneten az alábbi lesz látható:

```
Message: 
    Expected user.FullName to be 
    "Teszt Elek" with a length of 10, but 
    "Munka Pál" has a length of 9, differs near "Mun" (index 0).
    Addresses count should be 3: Expected user.Addresses not to be <null>.
    Addresses count should be 3: Expected user.Addresses to contain 3 item(s), but found <null>.
```

## Végezetül

Talán sikerült körbejárni ezt a funkcióját a Fluent Assertions csomagnak. Mindenképpen szeretném megemlíteni, hogy a weboldalukon található dokumentáció nem túl részletgazdag. Talán ez valamennyire érthető is annak fényében, hogy az alap működése is teljesen megfelel az AssertionScope-nak. Nagyon ritkán kell ennél több.
