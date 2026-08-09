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

## Handmatige stappen na publicatie

1. Open Google Search Console en voeg een **Domeinproperty** toe voor `stilte-en-draad.nl`.
2. Kopieer de door Google gegeven TXT-verificatiewaarde naar MijnDomein. Voeg dit DNS-record pas toe na expliciete toestemming en verander geen bestaande mailrecords.
3. Wacht op DNS-verificatie en dien onder **Sitemaps** `https://www.stilte-en-draad.nl/sitemap.xml` in.
4. Gebruik **URL-inspectie** voor minimaal:
   - `https://www.stilte-en-draad.nl/`
   - `https://www.stilte-en-draad.nl/webshop`
   - `https://www.stilte-en-draad.nl/veld`
   - `https://www.stilte-en-draad.nl/droom`
   - drie koopbare productroutes
5. Vraag alleen voor deze representatieve pagina’s indexering aan; laat Google de rest via interne links en sitemap ontdekken.
6. Controleer na enkele dagen en opnieuw na twee tot vier weken de rapporten **Pagina-indexering**, **Sitemaps** en **Uitgebreide resultaten**.
7. Onderzoek uitgesloten pagina’s alleen wanneer publieke canonieke routes onbedoeld worden uitgesloten. Transactionele routes horen uitgesloten te blijven.

Een HTML/meta-verificatietag kan later ook via `index.html` worden toegevoegd, maar DNS-verificatie is voor een domeinproperty de stabielste keuze. Sla de verificatiewaarde niet op voordat Google haar verstrekt.
