# Mollie-betaalflow — activatiehandleiding

## Huidige positie

Marvin van Zanten/Shaman Studios is de juridische contractpartij. Stilte & Draad is het merk en Mollie-websiteprofiel voor `https://www.stilte-en-draad.nl`. De organisatie staat bij Mollie nog in aanvullende beoordeling en de diensten zijn uitgeschakeld. Daarom blijft `PAYMENTS_ENABLED=false`, wordt geen live-key gebruikt en kan nog geen betrouwbare echte Mollie-testbetaling plaatsvinden.

De website gebruikt de Mollie Payments API, niet Payment Links. De checkout en donatieflow blijven op Stilte & Draad. Alleen iDEAL-authenticatie opent Mollies beveiligde checkout of bankapp. De terugkeerpagina vraagt de betalingsstatus opnieuw server-side op; de redirect en webhookpayload gelden nooit zelfstandig als betalingsbewijs.

## A. Wat nu lokaal kan

### 1. Database voorbereiden

Maak na toestemming een PostgreSQL-database aan, bijvoorbeeld Neon via de Vercel Marketplace. Dit project maakt zelf geen betaalde infrastructuur aan.

1. Kopieer `.env.example` naar `.env.local`.
2. Vul uitsluitend `DATABASE_URL` in.
3. Voer `npm run db:migrate` uit.
4. Voer hetzelfde commando nogmaals uit om de herhaalbaarheid te controleren.

De migratie draait in één transactie met een PostgreSQL advisory lock. Tabellen, kolommen en indexen gebruiken `if not exists`; constraints worden gecontroleerd opnieuw geplaatst. Bij een conflict rolt de volledige migratie terug zonder gedeeltelijke schemawijzigingen. `schema_migrations` registreert versie `001_mollie_checkout`.

Als Marvin liever de Neon SQL Editor gebruikt, kan de volledige inhoud van `database/001_mollie_checkout.sql` daar eenmaal worden uitgevoerd. De tweede uitvoering hoort eveneens zonder dataverlies te slagen.

### 2. Lokale controles

Deze controles vereisen geen Mollie-account:

```sh
npm test
npm run lint
npm run typecheck:api
npm run build
npm audit --omit=dev
git diff --check
```

Zonder betaalconfiguratie tonen checkout en donaties rustig dat online betalen wordt voorbereid. In development toont het configuratieblok welke variabelen ontbreken; productie toont nooit technische details.

### 3. Productgegevens voorbereiden

Ieder product ondersteunt:

- titel, ID, prijs, voorraad en gereedheidsstatus;
- hoogte, breedte, diepte en gewicht;
- materialen, onderhoud, kwetsbaarheid en handwerkafwijkingen;
- verzendklasse, verwerkingstermijn en levertijd;
- ophalen en verzenden als losse keuzes;
- toegestane landen/regio’s;
- uniek werk en certificaatgegevens.

Alle huidige werken staan bewust op `display_only`. Ze blijven zichtbaar als tentoonstelling, maar de winkelmand en server blokkeren afrekenen. Zet een werk pas op `purchasable` wanneer de relevante gegevens zijn bevestigd en minstens ophalen of verzenden expliciet is toegestaan.

### 4. Voorraad- en racestrategie

PostgreSQL is de enige betrouwbare voorraadbron. Een checkout:

1. maakt de voorraadrij indien nodig;
2. vergrendelt ieder gekozen product met `SELECT … FOR UPDATE`;
3. controleert verkocht en actieve reservering;
4. schrijft order, orderregels en reservering in dezelfde transactie.

Mollie krijgt het interne order-ID als idempotency-key. Een herhaalde browserpoging hervat dezelfde draftorder en dezelfde Mollie-betaling zolang de reservering nog geldig is. Dubbele webhooks halen telkens de actuele status bij Mollie op en terminale statussen worden niet teruggedraaid.

Bij een zeer late `paid`-status wordt de voorraad opnieuw vergrendeld. Is het werk intussen door een andere order gereserveerd of verkocht, dan krijgt de oude order `payment_review`. De nieuwe voorraad wordt niet overschreven; handmatige controle en eventueel terugbetaling zijn dan noodzakelijk.

## B. Pas nadat Mollie de organisatie vrijgeeft

### 1. Mollie-testmodus activeren

1. Controleer dat “additional onboarding – in review” verdwenen is.
2. Controleer dat Mollies diensten opnieuw actief zijn.
3. Controleer dat websiteprofiel Stilte & Draad is goedgekeurd.
4. Controleer dat iDEAL in testmodus actief is.
5. Maak of kopieer uitsluitend de `test_…` API-key.
6. Stel in Vercel Preview in:
   - `PAYMENTS_ENABLED=true`
   - `MOLLIE_MODE=test`
   - `MOLLIE_API_KEY=test_…`
   - `DATABASE_URL`
   - `APP_BASE_URL` van de publieke preview
   - `MOLLIE_WEBHOOK_URL=https://preview…/api/mollie/webhook`
   - `RESERVATION_DURATION_MINUTES=15`
   - Donaties hebben geen ingestelde commerciële minimum- of maximumgrens; uitsluitend positieve centbedragen zijn technisch geldig.
   - `DONATION_CONFIRM_THRESHOLD=500.00`
7. Controleer dat base-URL en webhook exact dezelfde HTTPS-herkomst gebruiken.

Een test-key wordt door de code in Vercel Production geweigerd. Een live-key wordt buiten Vercel Production geweigerd.

### 2. Acceptatietest

Test op een publieke Preview-deployment:

- open/pending en terugkeer vóór de webhook;
- paid, failed, canceled en expired;
- refresh en polling op `/betaling/:orderId`;
- dubbele webhook en webhooks in verkeerde volgorde;
- dubbelklikken en netwerkretry met dezelfde idempotency-key;
- twee gelijktijdige checkouts voor hetzelfde unieke werk;
- vrijgave na mislukte of verlopen betaling;
- late paid na vrijgave en het `payment_review`-pad;
- donatie, anonieme donatie, minimum, maximum en manipulatie;
- databasewaarden voor order, orderregels, reservering en verkocht;
- toetsenbord, mobiel, QR-fallback en bankapp-terugkeer.

### 3. Pas daarna live

1. Rond juridische gegevens, privacy, voorwaarden, verzending en e-mailbevestigingen af.
2. Maak pas dan een live-key.
3. Plaats die uitsluitend in Vercel Production.
4. Zet Production bewust op `MOLLIE_MODE=live` en `PAYMENTS_ENABLED=true`.
5. Voer één kleine, gecontroleerde live smoke test uit.
6. Controleer betaling, statuspagina, order, voorraad en bevestigingsmail.

## Environmentvariabelen

Zie `.env.example`. Geen variabele met een geheim mag een `VITE_`-prefix krijgen. Ontbrekende juridische gegevens blijven leeg totdat Marvin ze aanlevert: KvK, btw-status/-nummer, adres en contact-e-mail. Het minimale én maximale donatiebedrag, reserveringsduur en eventuele verzendtarieven zijn bewuste bedrijfskeuzes.
