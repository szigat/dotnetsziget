---
title: "Local LLM környezet kialakítása"
slug: local-llm-kornyezet-kialakitasa
description: 'Local LLM környezetet építek egy HP EliteBookon Docker, Ollama és Caddy segítségével, majd C#-ból a Microsoft Agent Frameworkkel próbálom ki a lokálisan futó modelleket.'
pubDatetime: 2026-09-20T16:10:00
featured: false
draft: false
author: Szigi
tags: 
  - "Docker"
  - "LLM"
  - "AI"
  - "csharp"
  - "C#"
  - "Ollama"
  - "Caddy"
---

## Local LLM környezet kialakítása

### Háttértörténet

Úgy alakult, hogy hozzám került egy HP EliteBook 840 G7 i5-10310U processzorral és 32 GB memóriával.
Ez a gép kicsi és nem fogyaszt sokat, ezért arra gondoltam, megpróbálok valamilyen lokális LLM-futtatókörnyezetet összerakni rajta, hogy legyen egy kis játszóterem a különböző AI-os kísérletekhez.

### A kezdetek

Mivel a jövőben még változhat, hogy pontosan mit szeretnék használni, egy Docker-alapú környezet mellett döntöttem.

Telepítettem a Docker Desktopot, majd összeállítottam az alábbi Docker Compose fájlt. Két konténert indítok: az egyikben az Ollama fut, elé pedig egy Caddy reverse proxy kerül, amely az API-kulcs ellenőrzését végzi. Ehhez a feladathoz a Caddy konfigurációja mindössze néhány sorból áll, de más reverse proxyval sem lenne bonyolultabb a megvalósítás.

``` yaml
name: local-llm
services:
  ollama:
    image: ollama/ollama:latest
    container_name: local-ollama
    restart: unless-stopped
    environment:
      OLLAMA_NO_CLOUD: "1"
      OLLAMA_CONTEXT_LENGTH: "8192"
      OLLAMA_MAX_LOADED_MODELS: "2"
      OLLAMA_KEEP_ALIVE: "30m"
    volumes:
      - type: bind
        source: C:/dev/local-llm/ollama
        target: /root/.ollama
    networks:
      - ollama_net

  caddy:
    image: caddy:latest
    container_name: ollama-proxy
    restart: unless-stopped
    ports:
      - "11434:8080"
    volumes:
      - type: bind
        source: C:/dev/local-llm/caddy/
        target: /etc/caddy/
    depends_on:
      - ollama
    networks:
      - ollama_net
    env_file: "caddy.env"

networks:
  ollama_net:
    driver: bridge
    internal: false
```

Az Ollama működését az alábbi környezeti változókat használva állítottam be (majd kiderül mennyire jó ez):

* `OLLAMA_NO_CLOUD=1`
  Kikapcsolja az Ollama felhős funkcióit.

* `OLLAMA_CONTEXT_LENGTH=8192`
  Az alapértelmezett kontextusméretet 8192 tokenre állítja. A kontextusba a system prompt, a beszélgetési előzmény, az aktuális prompt és a generált válasz is beleszámít. Ha ez a keret nem elegendő, az Ollama a használt API és beállítások függvényében levághat a bemenetből, vagy hibával jelezheti, hogy az nem fér bele a kontextusablakba.

* `OLLAMA_MAX_LOADED_MODELS=2`
  Meghatározza, hogy legfeljebb hány modell lehet egyszerre betöltve a memóriába. Nálam ez az érték kettő, így két különböző modell is memóriában maradhat, ha az erőforrások ezt lehetővé teszik.

* `OLLAMA_KEEP_ALIVE=30m`
  Azt szabályozza, hogy egy modell az utolsó használat után mennyi ideig maradjon betöltve a memóriába. A 30 perces értékkel csökkenthető annak az esélye, hogy két egymáshoz közeli kérés között újra be kelljen tölteni a modellt.

A Caddy számára az API-kulcsot egy külön `caddy.env` fájlban adom át:
```
OLLAMA_API_KEY=api-key
```

A `C:/dev/local-llm/caddy/Caddyfile` tartalma:
```
:8080 {
    @authorized header Authorization "Bearer {$OLLAMA_API_KEY}"

    handle @authorized {
        reverse_proxy ollama:11434
    }

    handle {
        respond "Unauthorized" 401
    }
}
```
Így az Ollama közvetlenül nincs publikálva a hoston, csak a Caddyn keresztül érhető el.

Fontos, hogy ez az API-kulcs csak egy egyszerű hitelesítési réteg. A fenti konfiguráció HTTP-t használ, szóval nem biztosít titkosított kommunikációt. Én ezt csak helyi hálózaton használom; internet felé nem engedem ki.

A Windows tűzfalon is engedélyezni kell a használt portot:
``` powershell
New-NetFirewallRule `                              
   -DisplayName "Ollama proxy - helyi hálózat" `
   -Direction Inbound `
   -Action Allow `
   -Protocol TCP `
   -LocalPort 11434 `
   -Profile Private `
   -RemoteAddress LocalSubnet
```

A WSL számára elérhető memóriát 24 GB-ra emeltem, mert alapértelmezetten a gép számára rendelkezésre álló memória felét állítja be.

Ezzel az alap környezet készen is van.

### Modellválasztás

A RAG-kísérletekhez szükségem lesz egy embedding modellre is. Erre az EmbeddingGemmát választottam.

A szöveggeneráláshoz használt modell kiválasztása már nehezebb kérdés. A magyar nyelv és a laptop korlátozott erőforrásai miatt az alábbi modelleket próbáltam ki:

* `qwen3.5:2b` és `qwen3.5:4b`
* `phi4-mini`
* `gemma4:e4b-it-qat`

A modellek a vártnál valamivel lassabban reagáltak, de kezdésnek szerintem használhatók.

A kisebb tesztem során a qwen3.5:2b teljesített a leggyorsabban, nagyjából 10–14 token/s generálási sebességgel.

A nagyobb modellek jellemzően 3–7 token/s körüli sebességet értek el. A phi4-mini néha ennél valamivel gyorsabb volt, körülbelül 5–8 token/s értékkel.

A magyar szöveggenerálás minőségét és egy rövid chatpéldát nézve nálam eddig a Gemma 4 teljesített a legjobban. Később azért lehet, hogy megnézem majd a többit is, mire képesek egy-egy szituációban.

A modelleket a futó Ollama-konténerben egyszerűen le lehet tölteni az alábbi parancsokkal:

```
docker exec local-ollama ollama pull embeddinggemma
docker exec local-ollama ollama pull gemma4:e4b-it-qat
```

### Local LLM próba

Nem maradt más hátra, mint tesztelni. C# kóddal fogom kipróbálni és a Microsoft Agent Framework és az OllamaSharp csomagot fogom használni. A teszt kedvéért limitálom a válasz maximális méretét, és kikapcsolom a thinking módot is.

Az alábbi NuGet csomagokat használtam:
``` xml 
<PackageReference Include="Microsoft.Agents.AI" Version="1.22.0" />
<PackageReference Include="OllamaSharp" Version="5.4.30" />
```

Mivel ezen a hardveren a válaszgenerálás lassabb lehet, az alapértelmezettnél hosszabb timeoutot állítok be a saját HttpClient példányon. 
A konfigurációhoz két környezeti változót használok:

- `LOCAL_OLLAMA_ENDPOINT`
- `LOCAL_OLLAMA_API_KEY`

``` csharp
using Microsoft.Agents.AI;
using Microsoft.Extensions.AI;
using OllamaSharp;
using OllamaSharp.Models;
using System.Net.Http.Headers;

var endpoint = Environment.GetEnvironmentVariable("LOCAL_OLLAMA_ENDPOINT") 
    ?? throw new InvalidOperationException("LOCAL_OLLAMA_ENDPOINT is missing.");

var apiKey = Environment.GetEnvironmentVariable("LOCAL_OLLAMA_API_KEY")
    ?? throw new InvalidOperationException("LOCAL_OLLAMA_API_KEY is missing.");

var modelName = "gemma4:e4b-it-qat";

var httpClient = new HttpClient
{
    BaseAddress = new Uri(endpoint),
    Timeout = TimeSpan.FromMinutes(5)
};
httpClient.DefaultRequestHeaders.Authorization =
    new AuthenticationHeaderValue("Bearer", apiKey);

AIAgent agent = new OllamaApiClient(httpClient, modelName).AsAIAgent(new ChatClientAgentOptions()
{
    ChatOptions = new ChatOptions
    {
        MaxOutputTokens = 500
    }
    .AddOllamaOption(OllamaOption.Think, false)
});

// Console.WriteLine(await agent.RunAsync("Mit lehet tudni a gemma4:e4b-it-qat modellről?"));

await foreach (var answerChunk in agent.RunStreamingAsync(
    "Könnyen érthetően definiáld, hogy mi a gemma4:e4b-it-qat modell. Röviden és tömören, 1-2 mondatban válaszolj!"))
{
    Console.Write(answerChunk.Text);
}
```

A `RunAsync` helyett szándékosan a `RunStreamingAsync` metódust használom. Lassabb generálásnál így nem kell megvárni a teljes választ, hanem folyamatosan ki tudom írni az érkező részleteket.

Erre meg is kaptam az alábbi választ:
`Ez egy az eredeti Gemma 4 alapú, utasítás-követéshez speciálisan trainált modellek hatékony verziója. A "QAT" technológia lehetővé teszi, hogy a modell kevés számú információs pontot (quantization) használva is maximalizálja sebességét és minimalizálja mérete, így gyorsan futtathető erőforrástípusokon.`

_A teszt szempontjából a válasz megérkezett, ugyanakkor maga a tartalma nem teljesen pontos. Ez rögtön egy jó példa arra is, hogy az LLM-ek által generált technikai állításokat érdemes ellenőrizni._

A technikai teszt ezzel sikeresen lezajlott, jöhet a használat. 
Ami miatt még aggódom, hogy a gyakorlatban mire lesz elég ez a 3-7 token/s körüli generálási sebesség. Ez majd később és akár egy másik bejegyzésben fog kiderülni.