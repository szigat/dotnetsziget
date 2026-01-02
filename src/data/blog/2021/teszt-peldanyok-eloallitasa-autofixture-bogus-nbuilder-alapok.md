---
title: "Teszt példányok előállítása (AutoFixture, Bogus, NBuilder) alapok"
description: 'Minden fejlesztő eljut oda, hogy egy funkció tesztelésekor jól jönne egy adag példány egy, vagy több osztályból.'
slug: teszt-peldanyok-eloallitasa-autofixture-bogus-nbuilder-alapok
pubDatetime: 2021-01-02
featured: false
draft: false
author: Szigi
category: "unit test"
tags: 
  - "autofixture"
  - "bogus"
  - "nbuilder"
  - "test"
  - "unit test"
---

Minden fejlesztő eljut oda, hogy egy funkció tesztelésekor jól jönne egy adag példány egy, vagy több osztályból. Ezen felül van amikor azt sem feltétlenül bánjuk ha ezeknek a tulajdonságai már rendelkeznek valamilyen alapértelmezettől eltérő értékkel (legyenek azok bármennyire is életszerűek). Három általam ismert library-t mutatok be erre, amik mind ugyanazt a célt szolgálják. Abc sorrendben az alábbiakról lesz szó: AutoFixture, Bogus és az NBuilder.

Példákban az alábbi osztályokat vesszük alapul:

```csharp
public enum SubscriptionPeriod
{
    None,
    Weekly,
    Monthly,
    Yearly
}

public class Address
{
    public string Country { get; set; }

    public string PostalCode { get; set; }

    public string City { get; set; }

    public string Street { get; set; }

}

public class User
{
    public int Id { get; set; }

    public string FullName { get; set; }

    public string UserName { get; set; }

    public string Email { get; set; }

    public DateTime Birthdate { get; set; }

    public SubscriptionPeriod SubscriptionPeriod { get; set; }

    public IEnumerable<Address> Addresses { get; set; }
}
```

## **AutoFixture**

Többihez képest talán kicsit egyszerűbb. Egyik előnye, hogy vannak a NUnit és XUnit tesztekkel együttműködő attribútumai (külön csomagban találhatóak). Automatikusan add értékeket a generált példánynak, de ez a fajta működés könnyen kikapcsolható akár property szinten is.

```csharp
Fixture fixture = new Fixture();
IEnumerable<User> userCollection = fixture.Build<User>()
    .CreateMany(3);
```

```json
// JSON-ben a generált eredmény
[
  {
    "Id": 146,
    "FullName": "FullName5f02ab90-c955-4d90-a238-6bc191390366",
    "UserName": "UserNamefbc08afd-5f89-49cd-a307-dd575eb905ae",
    "Email": "Emaile80ef51e-5d54-4762-a353-20cd9f92222f",
    "Birthdate": "2022-11-07T00:25:43.9984172",
    "SubscriptionPeriod": 0,
    "Addresses": [
      {
        "Country": "Countrya258285b-e7fb-4e67-906b-f00aaf0f5b53",
        "PostalCode": "PostalCode73b233f6-fc98-4648-9109-b92848f0476b",
        "City": "City4abbcfda-34bd-49c1-873f-f1a47d9ad622",
        "Street": "Streete675247c-e8bc-4564-b7d1-98205f5455a2"
      },
      {
        "Country": "Countryd7ba8a11-dd22-47ba-95c1-46f10c015680",
        "PostalCode": "PostalCodecea921f7-2cf6-4ca7-bd18-d35c2748d6f5",
        "City": "City926407de-b564-439d-980e-eb6f89b91555",
        "Street": "Street59d16081-9d7a-44e3-ab17-7bd6569dcfe8"
      },
      {
        "Country": "Country3ed16f85-82cd-4185-b8b6-30c9a8d4e245",
        "PostalCode": "PostalCode5a0ed3ab-5e41-40d1-802a-2f80efa36d1d",
        "City": "City4ad33560-b378-42d3-a563-3ce3227c6382",
        "Street": "Street673b4cd3-d5b8-4666-b7b2-2c0cce53a1cc"
      }
    ]
  },
  {
    "Id": 223,
    "FullName": "FullNamef6f4a328-1272-45bb-a159-793a6749d3c9",
    "UserName": "UserName3ef19352-78b5-49c0-80ec-1bc2ccc6f7ce",
    "Email": "Email315ec89b-e50b-4995-b618-de57b69f9e01",
    "Birthdate": "2022-03-15T08:55:17.8209881",
    "SubscriptionPeriod": 1,
    "Addresses": [
      {
        "Country": "Country451a48c6-64f7-4580-ab3e-11944dd2dde4",
        "PostalCode": "PostalCodea809955d-36af-4824-851f-af80d2cc9eb4",
        "City": "Cityfd67495d-c262-44d3-aba9-e190e36b5d09",
        "Street": "Street57c3af82-ecdf-4794-a6c2-f2c4cc5b1a3e"
      },
      {
        "Country": "Countrya7bf65d0-f549-4746-b471-e13f3a929a25",
        "PostalCode": "PostalCode0f873e63-8a7c-42ec-bf4b-8300be16bf23",
        "City": "City83d28fdb-35c3-4dc0-ae51-c3b20dc4f06d",
        "Street": "Streeta88c9b87-e1cb-4a84-898e-85244bfee446"
      },
      {
        "Country": "Country4db6f84e-b3cd-462a-9fb9-9f868ad8a6f0",
        "PostalCode": "PostalCodee425e2b6-c259-475c-b026-3ae1da3129c4",
        "City": "City1799f34b-d248-4033-a232-a45cc38a4348",
        "Street": "Streetfe41c151-5e14-4213-b4a8-8518837c593b"
      }
    ]
  },
  {
    "Id": 79,
    "FullName": "FullName721620a0-b371-4651-a522-c3c62a820266",
    "UserName": "UserNameadccc22e-e31a-44d7-9199-ba6b13c3405a",
    "Email": "Email88a54b8a-8e27-4bec-a90f-6a67fc8146e9",
    "Birthdate": "2020-11-09T11:44:35.8102392",
    "SubscriptionPeriod": 2,
    "Addresses": [
      {
        "Country": "Country067ab81c-842f-4dec-a9eb-2a6ab1cc63e7",
        "PostalCode": "PostalCoded9290954-1fae-403d-9610-005780491216",
        "City": "City4586ad45-3d24-4a25-a1de-ca111d400c16",
        "Street": "Streetcbfe151a-82af-4f01-9576-c7d0d91a0e54"
      },
      {
        "Country": "Countryb145f6e3-b32d-4908-811a-0de6e4a2b955",
        "PostalCode": "PostalCode3114b389-a354-497e-bbf0-0e894c638e08",
        "City": "Citye07efb8f-6959-4a2e-b568-34ccba07d329",
        "Street": "Streete24c41f0-eae4-48e0-b2c8-efdc4db802d7"
      },
      {
        "Country": "Country0a03a72a-8303-460d-b792-54c432ecee29",
        "PostalCode": "PostalCodee38a9c65-6d05-4885-b240-c151fd8cea67",
        "City": "City6ae66deb-e220-4c8a-8885-6ff1b8b373b6",
        "Street": "Street042d42e4-24ef-4e3b-be8d-f455d674ec39"
      }
    ]
  }
]
```

Fent látható, hogy minden beállítás nélkül mit generált. Egészszám és dátum típusnak véletlenszerűen, a karakterláncoknak a tulajdonság nevét adja és hozzáfűz egy guid-ot szövegként. Az enumokat sorban adja hozzá, továbbá objektum típusoknál is kitölt mindent.

A működést befolyásolhatjuk metódusok segítségével, hogy minek adjon automatikusan értéket, vagy megadhatjuk azt is akár, hogy mit kapjon konkrétan, továbbá lehetőségünk van saját logikát is írni. Pl:

```csharp
IEnumerable<User> userCollection = fixture.Build<User>()
    .With(u => u.Email, "test@test.hu")
    .Without(u => u.FullName)
    .With(x => x.Birthdate, () => new DateTime(2020, 12, 10).AddYears(-16))
    // .OmitAutoProperties() // Ezzel ki lehet kapcsolni teljesen az automatikus generálást
    .CreateMany(3);
```

## **Bogus**

Alapértelmezetten nem tölti fel a példányokat értékekkel (ez egy másik csomag segítségével megoldható). Szabályokkal (Rule) adható meg, hogy mi alapján kapjon értéket egy tulajdonság. Ez tudatosabb teszt írást tesz lehetővé, viszont ebben az esetben nekünk kell gondoskodnunk minden szabályról.

Egyik nagy előnye, ami miatt Bogus nagyon kedvelt az, hogy könnyen lehet vele életszerű fake adatokat generálni. Rendelkezik például név, felhasználónév, ország, utca, stb. gyűjteményekkel, amiket könnyen lehet a szabályaink közé integrálni.

```csharp
Faker<Address> addressFaker = new Faker<Address>()
    .RuleFor(a => a.Country, f => f.Address.Country())
    .RuleFor(a => a.PostalCode, f => f.Address.ZipCode())
    .RuleFor(a => a.Street, f => f.Address.StreetAddress())
    .RuleFor(a => a.City, f => f.Address.City());

var userIds = 0;
List<User> userCollection = new Faker<User>()
    .RuleFor(u => u.Id, _ => ++userIds)
    .RuleFor(u => u.FullName, f => f.Name.FullName())
    .RuleFor(u => u.UserName, (f, u) => f.Internet.UserName(u.FullName))
    .RuleFor(u => u.Birthdate, f => f.Date.Between(new DateTime(1980, 1, 1), new DateTime(2006, 1, 1)))
    .RuleFor(u => u.Email, (f, u) => f.Internet.Email(u.UserName))
    .RuleFor(u => u.Addresses, _ => addressFaker.Generate(3))
    .Generate(3);
```

```json
[
  {
    "Id": 1,
    "FullName": "Jamie Muller",
    "UserName": "JamieMuller95",
    "Email": "JamieMuller9573@gmail.com",
    "Birthdate": "1989-04-19T23:02:39.3475684",
    "SubscriptionPeriod": 0,
    "Addresses": [
      {
        "Country": "Niue",
        "PostalCode": "57945-0784",
        "City": "Mikelville",
        "Street": "11484 Perry Extensions"
      },
      {
        "Country": "Congo",
        "PostalCode": "66780-1579",
        "City": "West Otiliaview",
        "Street": "994 Lynch Pine"
      },
      {
        "Country": "Mali",
        "PostalCode": "07092-2983",
        "City": "New Jorgestad",
        "Street": "88303 Spinka Junction"
      }
    ]
  },
  {
    "Id": 2,
    "FullName": "Roel Veum",
    "UserName": "RoelVeum58",
    "Email": "RoelVeum58.Johns@hotmail.com",
    "Birthdate": "1994-05-18T11:59:27.1090297",
    "SubscriptionPeriod": 0,
    "Addresses": [
      {
        "Country": "Peru",
        "PostalCode": "09134-0239",
        "City": "West Dorotheaport",
        "Street": "207 Kali Pine"
      },
      {
        "Country": "Cape Verde",
        "PostalCode": "03772-5166",
        "City": "East Macie",
        "Street": "681 Upton Crossroad"
      },
      {
        "Country": "Barbados",
        "PostalCode": "79626",
        "City": "Port Norbert",
        "Street": "94096 Kassulke Drive"
      }
    ]
  },
  {
    "Id": 3,
    "FullName": "Rosalee Davis",
    "UserName": "RosaleeDavis_Zieme37",
    "Email": "RosaleeDavis_Zieme3731@hotmail.com",
    "Birthdate": "2001-09-24T02:26:22.4029814",
    "SubscriptionPeriod": 0,
    "Addresses": [
      {
        "Country": "Sudan",
        "PostalCode": "54057",
        "City": "Langton",
        "Street": "975 Lang Hills"
      },
      {
        "Country": "Reunion",
        "PostalCode": "84482",
        "City": "New Rupert",
        "Street": "750 Rahsaan Valley"
      },
      {
        "Country": "Italy",
        "PostalCode": "03920-8352",
        "City": "Dasiaberg",
        "Street": "30538 Sarah Trail"
      }
    ]
  }
]
```

Itt már látható, hogy mennyit is kell írni egy hasonló eredményért mint korábban, de a generált értékeink kevésbé tűnnek mesterségesnek.

Mindegyik bemutatott csomaghoz találhatunk továbbiakat, amik hozzáadnak a funkcionalitáshoz. Itt most kiemelném az _**AutoBogus**_t és az _**AutoBogusConvention**_t. Az első segítségével elérhető, hogy ne kelljen minden értékfeltöltéshez Rule-t írni. Az AutoBogusConvention az aminek a segítségével beállítható, hogy a builder property név alapján magától próbáljon hozzáillő értéket adni.

```csharp
AutoFaker.Configure(builder =>
{
    builder.WithConventions();
});

var userCollection = AutoFaker.Generate<User>(3);
```

```json
[
  {
    "Id": -1797174012,
    "FullName": "Vada Little",
    "UserName": "Wava96",
    "Email": "Carley.Flatley@yahoo.com",
    "Birthdate": "2021-01-02T10:28:01.6509041+01:00",
    "SubscriptionPeriod": 3,
    "Addresses": [
      {
        "Country": "Trinidad and Tobago",
        "PostalCode": "navigating",
        "City": "South Nikko",
        "Street": "primary"
      },
      {
        "Country": "Cyprus",
        "PostalCode": "Producer",
        "City": "North Joey",
        "Street": "CSS"
      },
      {
        "Country": "Estonia",
        "PostalCode": "Metrics",
        "City": "North Bruceview",
        "Street": "Dynamic"
      }
    ]
  },
  {
    "Id": 1154044965,
    "FullName": "Lea Lesch",
    "UserName": "Fausto.Muller",
    "Email": "Karl_Langworth18@yahoo.com",
    "Birthdate": "2021-01-02T00:01:15.6103696+01:00",
    "SubscriptionPeriod": 3,
    "Addresses": [
      {
        "Country": "Democratic People\u0027s Republic of Korea",
        "PostalCode": "Italy",
        "City": "Hudsonville",
        "Street": "virtual"
      },
      {
        "Country": "Namibia",
        "PostalCode": "Pataca",
        "City": "Larsonfurt",
        "Street": "payment"
      },
      {
        "Country": "Bahamas",
        "PostalCode": "Namibia",
        "City": "Tryciafurt",
        "Street": "Electronics, Music \u0026 Music"
      }
    ]
  },
  {
    "Id": 471368329,
    "FullName": "Hilbert Blanda",
    "UserName": "Barbara.Waters82",
    "Email": "Joel_Denesik95@yahoo.com",
    "Birthdate": "2021-01-02T11:16:59.3483346+01:00",
    "SubscriptionPeriod": 0,
    "Addresses": [
      {
        "Country": "Libyan Arab Jamahiriya",
        "PostalCode": "Investment Account",
        "City": "Josianeview",
        "Street": "CSS"
      },
      {
        "Country": "Iceland",
        "PostalCode": "Multi-layered",
        "City": "Mayerfort",
        "Street": "IB"
      },
      {
        "Country": "Congo",
        "PostalCode": "Buckinghamshire",
        "City": "Port Donavontown",
        "Street": "Unbranded"
      }
    ]
  }
]
```

## **NBuilder**

Gyorsan lehet vele példányokat generálni és mindenféle beállítás nélkül tölti fel értékekkel. Azonban ahhoz, hogy jól tudjuk használni itt is tisztában kell lennünk azzal, hogy melyik típusú tulajdonság milyen értéket is kap alapértelmezetten és ezzel számolni kell a teszt írásakor. Könnyen lehet csoportokba szervezni és így beállítani, hogy az előállított gyűjtemény egy része milyen értékeket kapjon.

```csharp
var addressCollection = Builder<Address>.CreateListOfSize(10).Build();
IList<User> userCollection = Builder<User>.CreateListOfSize(3)
    .All()
    .With(u => u.Addresses = Pick<Address>.UniqueRandomList(3).From(addressCollection))
    .Build();
```

```json
[
  {
    "Id": 1,
    "FullName": "FullName1",
    "UserName": "UserName1",
    "Email": "Email1",
    "Birthdate": "2021-01-02T00:00:00",
    "SubscriptionPeriod": 0,
    "Addresses": [
      {
        "Country": "Country1",
        "PostalCode": "PostalCode1",
        "City": "City1",
        "Street": "Street1"
      },
      {
        "Country": "Country2",
        "PostalCode": "PostalCode2",
        "City": "City2",
        "Street": "Street2"
      },
      {
        "Country": "Country5",
        "PostalCode": "PostalCode5",
        "City": "City5",
        "Street": "Street5"
      }
    ]
  },
  {
    "Id": 2,
    "FullName": "FullName2",
    "UserName": "UserName2",
    "Email": "Email2",
    "Birthdate": "2021-01-03T00:00:00",
    "SubscriptionPeriod": 1,
    "Addresses": [
      {
        "Country": "Country3",
        "PostalCode": "PostalCode3",
        "City": "City3",
        "Street": "Street3"
      },
      {
        "Country": "Country10",
        "PostalCode": "PostalCode10",
        "City": "City10",
        "Street": "Street10"
      },
      {
        "Country": "Country4",
        "PostalCode": "PostalCode4",
        "City": "City4",
        "Street": "Street4"
      }
    ]
  },
  {
    "Id": 3,
    "FullName": "FullName3",
    "UserName": "UserName3",
    "Email": "Email3",
    "Birthdate": "2021-01-04T00:00:00",
    "SubscriptionPeriod": 2,
    "Addresses": [
      {
        "Country": "Country6",
        "PostalCode": "PostalCode6",
        "City": "City6",
        "Street": "Street6"
      },
      {
        "Country": "Country8",
        "PostalCode": "PostalCode8",
        "City": "City8",
        "Street": "Street8"
      },
      {
        "Country": "Country1",
        "PostalCode": "PostalCode1",
        "City": "City1",
        "Street": "Street1"
      }
    ]
  }
]
```

Egyszerűen felismerhető, hogy milyen tulajdonságokat, hogyan is tölt fel. Egész számokat egyesével növel, dátumokat a jelenlegi naptól indítva egyesével növeli és a karakterláncoknál is talán kicsit barátságosabb ez a tulajdonság név plusz szám. Enumok esetén sorban kapják meg a lehetséges értékeket. Az NBuilder magától nem készít objektum hierarchiát úgy mint az AutoFixture, ezért erről nekünk kell gondoskodni.

Idáig majdnem ugyanaz a működés, de tegyük fel, hogy szeretnénk egy nagyobb gyűjteményt befolyásolni. Az NBuilder beépített módon nyújt támogatást arra, hogy csoportokban lehessen egyedi értéket adni.

A példa kedvéért nézzük meg azt, hogy 1000 felhasználóból azt szeretnénk ha az első 10 éves előfizetéses lenne, a következő 600 rendelkezne havi előfizetéssel és a maradék meg nem.

```csharp
IList<User> userCollection = Builder<User>.CreateListOfSize(1000)
   .TheFirst(10)
   .With(u => u.SubscriptionPeriod = SubscriptionPeriod.Yearly)
   .TheNext(600)
   .With(u => u.SubscriptionPeriod = SubscriptionPeriod.Monthly)
   .TheRest()
   .With(u => u.SubscriptionPeriod = SubscriptionPeriod.None)
   .Build();
```

## **Ezek kombinációja**

A Bogus legnagyobb előnyét (az életszerű teszt adatok) senki sem engedné el szívesen, de ennek ellenére lehet, hogy szimpatikusabb valamelyik másik generáló. Szerencsére a Bogus úgy van megírva, hogy fel tudjuk használni ezt a részét.

Példának megmutatom az NBuilder-t használva hogyan is néz ez ki:

```csharp
var faker = new Faker();
IList<User> userCollection2 = Builder<User>.CreateListOfSize(3)
   .All()
   .With(u => u.FullName = faker.Name.FullName())
   .With(u => u.UserName = faker.Internet.UserName(u.FullName))
   .With(u => u.Email = faker.Internet.Email(u.FullName))
   .Build();
```

```json
[
  {
    "Id": 1,
    "FullName": "Herman Orn",
    "UserName": "HermanOrn.Hills",
    "Email": "HermanOrn4@hotmail.com",
    "Birthdate": "2021-01-02T00:00:00",
    "SubscriptionPeriod": 0,
    "Addresses": null
  },
  {
    "Id": 2,
    "FullName": "Raina Okuneva",
    "UserName": "RainaOkuneva10",
    "Email": "RainaOkuneva81@yahoo.com",
    "Birthdate": "2021-01-03T00:00:00",
    "SubscriptionPeriod": 1,
    "Addresses": null
  },
  {
    "Id": 3,
    "FullName": "Owen Steuber",
    "UserName": "OwenSteuber_Hauck31",
    "Email": "OwenSteuber_Gusikowski@hotmail.com",
    "Birthdate": "2021-01-04T00:00:00",
    "SubscriptionPeriod": 2,
    "Addresses": null
  }
]
```

## **Végezetül**

Kezdésnek bármelyiket is választja az ember hatalmas segítséget nyújtanak. Érdemes megnézni a dokumentációkat és a GitHub oldalakat, hogy milyen további csomagok léteznek hozzájuk és kipróbálásuk után választani közülük.
