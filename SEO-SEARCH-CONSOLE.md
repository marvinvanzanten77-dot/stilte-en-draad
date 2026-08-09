# SEO en Google Search Console

## Technische basis

- Canonieke website: `https://www.stilte-en-draad.nl/`
- Sitemap: `https://www.stilte-en-draad.nl/sitemap.xml`
- Robots: `https://www.stilte-en-draad.nl/robots.txt`
- Iedere publieke route wordt tijdens de productiebuild als betekenisvolle HTML voorgerenderd.
- Checkout, betaalstatus, herroeping en werkcertificaten bevatten `noindex, nofollow` en staan niet in de sitemap.
- Onbekende routes worden door Vercel met de statische `404.html` als HTTP 404 afgehandeld.

## Audit vóór deze wijziging

Op 9 augustus 2026 gaven homepage, webshop, productroutes, checkout en een onbekende URL allemaal HTTP 200 met dezelfde server-side title en description. Routegebonden metadata en structured data verschenen pas na JavaScript. De sitemap miste producten 26 en 27 en bevatte de herroepingsroute. Een publieke zoekcontrole met `site:stilte-en-draad.nl` gaf geen zichtbare resultaten. HTTPS en de redirect van non-www naar www werkten wel correct.

## Search Console-status

- De domeinproperty voor `stilte-en-draad.nl` is via DNS geverifieerd.
- Het gebruikte verificatie-TXT-record blijft permanent in DNS staan, zodat het eigendom geverifieerd blijft.
- `https://www.stilte-en-draad.nl/sitemap.xml` is succesvol ingediend.
- Google heeft via de sitemap 37 pagina’s ontdekt.

## Monitoring na indiening

1. Gebruik **URL-inspectie** voor minimaal:
   - `https://www.stilte-en-draad.nl/`
   - `https://www.stilte-en-draad.nl/webshop`
   - `https://www.stilte-en-draad.nl/veld`
   - `https://www.stilte-en-draad.nl/droom`
   - drie koopbare productroutes
2. Vraag alleen voor deze representatieve pagina’s indexering aan; laat Google de rest via interne links en sitemap ontdekken.
3. Controleer na enkele dagen en opnieuw na twee tot vier weken de rapporten **Pagina-indexering**, **Sitemaps** en **Uitgebreide resultaten**.
4. Onderzoek uitgesloten pagina’s alleen wanneer publieke canonieke routes onbedoeld worden uitgesloten. Transactionele routes horen uitgesloten te blijven.

Een HTML/meta-verificatietag kan later ook via `index.html` worden toegevoegd, maar DNS-verificatie is voor een domeinproperty de stabielste keuze. Sla de verificatiewaarde niet op voordat Google haar verstrekt.
