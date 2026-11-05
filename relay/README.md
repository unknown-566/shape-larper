# Relay pro Shape Larper v0.4.8

Tento adresář je **připravený k nasazení, veřejný server zatím neběží**. Oba hráči se připojují ven přes WSS (TLS, obvykle port 443). Nepotřebují příchozí spojení, UDP broadcast ani přesměrování portů na svých počítačích. Pokud síť blokuje i WebSocket nebo doménu hostingu, připojení stále nemusí fungovat.

## Nasazení na Render

1. Vlastník repozitáře se přihlásí na Render a vytvoří **New → Blueprint** z `unknown-566/shape-larper`, větev `main`.
2. Použije kořenový `render.yaml`. Ten definuje jednu webovou službu, Node.js službu z `relay/`, plán `free`, health check `/health` a náhodný `RELAY_KEY`. Zkontroluj plán a limity v dashboardu před potvrzením. Žádná databáze není potřeba.
3. Po nasazení otevři `https://ADRESA-SLUZBY/health`; musí vrátit `ok: true`.
4. V nastavení prostředí služby zjisti hodnotu `RELAY_KEY`. Sdílej ji pouze se spoluhráčem, nikdy ji necommituj.
5. Ve hře: **LAN co-op → Online · room code**. Oba vyplní `wss://ADRESA-SLUZBY/ws` a stejný access key.
6. Host nechá kód prázdný a připojí se. V lobby dostane 12znakový kód. Druhý hráč ho vyplní. Host poté stiskne **Launch co-op**.

Free hosting může usnout a první spojení potřebuje probuzení. Pokud se připojení nezdaří, otevři health URL, chvíli počkej a opakuj připojení. Provoz podléhá limitům hostingu; nepřepínej na placený plán automaticky. Restart/deploy serveru ukončí rozehranou relaci.

Ověřené zdroje: [Render WebSockets](https://render.com/docs/websocket), [Blueprint reference](https://render.com/docs/blueprint-spec), [omezení free instancí](https://render.com/docs/free). Čisté WebRTC P2P nemá zaručenou dostupnost bez [TURN relay](https://webrtc.org/getting-started/turn-server); proto tento transport používá přímo WSS relay.

## Vlastní server / Docker

Z adresáře `relay`:

```sh
npm ci --omit=dev
RELAY_KEY=VASE_NAHODNE_HESLO PORT=10000 npm start
```

PowerShell:

```powershell
npm ci --omit=dev
$env:RELAY_KEY = 'VASE_NAHODNE_HESLO'
$env:PORT = '10000'
npm start
```

Docker:

```sh
docker build -t shape-larper-relay .
docker run --rm -p 10000:10000 -e RELAY_KEY=VASE_NAHODNE_HESLO shape-larper-relay
```

Pro veřejný provoz dej službu za HTTPS reverse proxy s podporou WebSocket Upgrade, certifikátem a portem 443. Pro lokální test může hra použít `ws://127.0.0.1:10000/ws`; nezabezpečené vzdálené `ws://` adresy odmítne. Spusť pouze jednu repliku služby: místnosti jsou v paměti daného procesu.

## Provoz

- Dva hráči na místnost; náhodný neveřejný kód. Žádný seznam místností ani ukládání herních dat na disk.
- Přístupový klíč je volitelný při lokálním startu; v Render konfiguraci se generuje automaticky.
- Max. 50 místností, maximální velikost zprávy 512 KiB, limit zpráv/dat a zpětný tlak pro pomalé klienty.
- Heartbeat odstraňuje mrtvá spojení. Prázdná lobby expiruje po 10 minutách, relace po 6 hodinách.
- Výpadek jednoho hráče ukončí místnost. Obnova rozehraného světa ani migrace hostitele zatím nejsou podporované.
- Relay provozovatel může číst přeposílaná herní data; WSS šifruje přenos klient–server, nejde o end-to-end šifrování mezi hráči.

Testy z kořene repozitáře: `node tests/relay.js` a `node tests/relay-game.js` (druhý potřebuje Playwright + Chrome). Docker/cloud nasazení musí ověřit vlastník hostingu po nasazení; lokální integrační test není testem konkrétní školní sítě.
