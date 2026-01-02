---
category: csharp
description: 'Autofac egyik képessége, hogy magától tudja a decorator osztályokat kezelni. Az említett verzió viszont rendelkezik egy hibával.'
slug: autofac-5-1-x-es-decorator-problema
pubDatetime: 2020-12-13
featured: false
draft: false
author: Szigi
tags:
  - csharp
  - ioc
  - Autofac
title: Autofac 5.1.X és decorator probléma
---

Autofac egyik képessége, hogy magától tudja a decorator osztályokat kezelni.

```csharp
builder.RegisterDecorator<LogDecorator, INotificationSender>();
```

A decorator pattern-ről részletesebben itt lehet olvasni: [https://refactoring.guru/design-patterns/decorator](https://refactoring.guru/design-patterns/decorator)

Amikor egy olyan példányt kérünk az autofac-tól, amihez tartozik dekorátor, akkor azt automatikusan "elé" teszi. Természetesen itt is működik az a megoldás, hogy ha több megvalósítást regisztrálunk majd, amikor gyűjteményt kérünk, akkor az összes megvalósítást egy-egy hozzá tartozó dekorátor példánnyal kapjuk meg.

```csharp
builder.RegisterType<EmailSender>().As<INotificationSender>().InstancePerRequest();
builder.RegisterType<SmsSender>().As<INotificationSender>().InstancePerRequest();
```

```csharp
public class Operation : IOperation
{
   public Operation(IEnumerable<INotificationSender> senderCollection)
   {
    ...
   }
}
```

Egy módosítás miatt, viszont Az autofac 5.1.x verzióknál minden megvalósítás egy közös dekorátor példányt kap egy scope-on belül. Ez páldául akkor tudd kellemetlen meglepetést okozni, amikor a dekorálandó osztály bármelyik tulajdonságát magának a dekorátornak is beállítjuk (maga az interfész megköveteli). Ilyenkor ugyanis az először elkészített osztályhoz tartozó értékkel példányosított dekorátort kapja meg mindegyik megvalósítás.

Nézzük az alábbi példát:

```csharp
public enum NotificationType
{
    Email,
    SMS
}

public interface INotificationSender
{
    NotificationType NotificationType { get; }

    void Send(SendNotificationDto sendNotificationDto);
}

public class NotificationDecorator : INotificationSender
{
    private readonly INotificationSender _notificationSender;

    public NotificationType NotificationType { get; }

    public NotificationDecorator(INotificationSender notificationSender)
    {
        _notificationSender = notificationSender;
        NotificationType = notificationSender.NotificationType;
    }

    public void Send(SendNotificationDto sendNotificationDto)
    {
        ...
        _notificationSender.Send(sendNotificationDto);
        ...
    }
}
```

Ebben az esetben minden megvalósítás az email tulajdonsággal rendelkező dekorátort fogja kapni.

Szerencsére ez az Autofac 5.2.0. verziótól ismét a megszokott módon működik.
