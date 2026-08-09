# Stilte & Draad — openstaande todo's

Dit bestand bevat uitsluitend werkzaamheden die nog niet aantoonbaar zijn afgerond.

## Afgeronde publicatiefase — 9 augustus 2026

- [x] Transactionele communicatie personaliseren met Jannies toon en het bijbehorende werkverhaal.
- [x] Bij ieder verkoopbaar werk duidelijk maken dat de fysieke begeleidende tekst wordt meegeleverd.
- [x] Versiebeheer en blijvende opslag voor cookievoorkeuren implementeren en testen.
- [x] De technische SEO-basis publiceren: route-eigen metadata, canonicals, geldige JSON-LD, sitemap, robots en echte HTTP 404.
- [x] De performanceoptimalisatie publiceren: responsieve homepagehero en uitgestelde initialisatie van niet-kritieke audio, video en interactieve ervaringen.
- [x] De footercredit wijzigen naar `© 2026 Stilte & Draad · door InnerVerse Studios`.
- [x] Deze fase op Production controleren op desktop en mobiele viewports, zonder bestelling, betaling, donatie of e-mail aan te maken.

## Winkel, betalingen en donaties

- [x] Een aparte Neon PostgreSQL-database aan Vercel Preview en Development koppelen en met migraties en echte databasetests valideren.
- [x] Een aparte Neon PostgreSQL-database uitsluitend aan Vercel Production koppelen.
- [x] Migraties `001_mollie_checkout.sql` en `002_withdrawals.sql` tweemaal zonder fouten op Production uitvoeren.
- [x] Alle acht echte PostgreSQL-integratie- en concurrencytests op Production uitvoeren.
- [x] De betaal- en donatiearchitectuur technisch voorbereiden, inclusief veilige uitschakeling en statuscontrole.
- [x] De Production-rooktest op desktop en mobiel uitvoeren.
- [ ] Kopen en doneren bewust uitgeschakeld houden totdat de volledige Mollie-test- en acceptatiefase is afgerond (`PAYMENTS_ENABLED=false`). Dit is nadrukkelijk nog geen afgeronde live-betaalfase.
- [ ] Mollie-testkey en overige servervariabelen veilig in Vercel instellen.
- [ ] Alle echte Mollie-testscenario’s, webhooks en concurrencytest op een testdatabase doorlopen.
- [ ] Mollie pas na een geslaagde acceptatietest bewust naar live omzetten.
- [x] Resend als toekomstige transactionele mailprovider kiezen en de vereiste DNS-records voor `mail.stilte-en-draad.nl` toevoegen.
- [ ] Wachten totdat Resend de algemene domeinstatus volledig als `verified` toont; Domain Events meldt al `DNS verified`, maar de domeinstatus is nog `pending`/`verifying`.
- [ ] Daarna een beperkte Resend API-key aanmaken en uitsluitend als Vercel-secret configureren; `EMAIL_ENABLED=false` blijft gehandhaafd.
- [ ] Eerst in Preview alle zes berichttypen, retries, idempotency en outboxverwerking testen terwijl Production uitgeschakeld blijft.
- [ ] Na geslaagde acceptatietest afzonderlijk toestemming vragen voordat transactionele e-mail in Production wordt geactiveerd.
- [ ] Het door MijnDomein aangepaste DMARC-beleid (`none`) en SPF-beleid (`~all`) vóór volledige livegang opnieuw beoordelen en waar mogelijk aanscherpen.
- [ ] SumUp later uitsluitend voor fysieke betalingen configureren.

## Belangrijkste blokkades vóór opening van de webshop

1. [ ] Mollie-testconfiguratie instellen en alle acceptatietests, webhooks en foutscenario’s doorlopen.
2. [ ] Resend pas na volledige domeinverificatie veilig koppelen, in Preview testen en daarna bestel-, betaal-, donatie- en herroepingsbevestigingen gecontroleerd activeren.
3. [ ] De wettelijk conforme digitale herroepingsstroom end-to-end testen en activeren.
    - [x] Migratie `002_withdrawals.sql` op de gekoppelde Neon-database uitvoeren.
    - [ ] De mailprovider koppelen en het berichttype `withdrawal_received` met het voorbereide bevestigingssjabloon verzenden.
    - [ ] De volledige herroepingsstroom op Vercel testen: geldige bestelling, foutieve gegevens, dubbele verzending en ontvangen bevestigingsmail.
4. [ ] Verzendkosten, levertijd, verpakking, bezorgen en ophalen definitief uitwerken.
5. [ ] De resterende productgegevens invullen: Zand aan Zee-maten, gewichten, techniek, jaar, ophangwijze en waar nodig kwetsbaarheid.
6. [ ] Ontbrekende bedrijfsgegevens toevoegen: btw-status.
7. [ ] Privacyverklaring en algemene voorwaarden juridisch en inhoudelijk controleren en afronden.
8. [ ] Voorlopige productprijzen samen met Jannie nalopen en definitief vaststellen.
9. [ ] Duidelijk aangeven wanneer de webshop officieel geopend is.

## SEO en deelbaarheid

- [ ] Google Search Console aansluiten, sitemap indienen en indexering controleren.

## Toegankelijkheid

- [ ] Contrast van kleine, lichte hoofdletters nalopen.
- [ ] Alle animaties met `prefers-reduced-motion` praktisch testen.
- [ ] De stilte-ervaring zonder animatie en uitsluitend met toetsenbord testen.

## Performance en mobiel

- [x] Alle zes kaartvideo’s optimaliseren, koppelen en technisch testen.
- [ ] De resterende audio- en videobestanden waar nodig verder optimaliseren voor webgebruik.
- [ ] Alle interactieve onderdelen op mobiel en tablet testen.
- [x] Lighthouse-controle uitvoeren op performance, toegankelijkheid en SEO.

## Productpresentatie en vertrouwen

- [ ] Detailfoto’s per werk toevoegen.
- [ ] Certificaten aanvullen met jaar en handtekening.
- [ ] Audioverhalen aan individuele werken koppelen.
- [ ] Verhalen van kopers of bestemmingen van werken toevoegen.
- [ ] Levenslijnen opnieuw maken en daarna opnieuw fotograferen en invoeren.

## Evenementen en rijdend atelier

- [ ] Echte festivals, markten en exposities invoeren.
- [ ] Nieuwsbrief of “blijf op de hoogte” toevoegen.
- [ ] Ontvanger, besteding en voorwaarden van donaties volledig toelichten.

## Inhoud en beeld

- [ ] De ontbrekende Corfu-video verzamelen, optimaliseren en aan Griekenland op de kaart koppelen.
- [x] De afbeelding van Droom vervangen door een persoonlijke foto van Jannie.
- [x] De afbeelding van Stilte vervangen door een persoonlijke foto van Jannie.
- [ ] Biografische locaties in Veld door Jannie laten bevestigen.
- [ ] Beslissen of het tabblad Textiel definitief verwijderd blijft.
- [ ] Beslissen of een centrale audioplayer terugkomt.
- [ ] Externe citaten in Stilte periodiek controleren op formulering en bron.
