# Neon PostgreSQL koppelen aan Vercel

## Volledige lokale omgeving

Start frontend en Functions samen met `npm run dev:full -- --listen 5173`. Dit script gebruikt bewust `vercel dev --local`: zo worden verzoeken naar `/api/*` door de lokale Vercel Functions afgehandeld voordat Vite de SPA serveert. `npm run dev` start alleen de frontend. Een gelinkte `vercel dev` zonder `--local` kan de projectinstelling voor de Vite-devserver overnemen en TypeScript-bronbestanden onder `/api` teruggeven in plaats van de Functions uit te voeren.

De applicatie gebruikt de npm-package `postgres` en verwacht een volledige PostgreSQL-connection string in `DATABASE_URL`. Gebruik voor de serverless runtime de gepoolde Neon-URL; de host bevat dan `-pooler`. TLS moet in de URL staan. Gebruik de door Neon geleverde gepoolde database-URL en neem geen voorbeeld met gebruikersnaam of wachtwoord op in documentatie.

Neem de URL letterlijk uit Neon over. Als Neon ook `channel_binding=require` toevoegt, laat die parameter staan. Zet nooit een database-URL in een `VITE_…`-variabele.

## Koppelen via het Vercel-dashboard

1. Open het bestaande project **Stilte & Draad** in Vercel.
2. Open **Storage / Marketplace** en kies **Neon**.
3. Kies **Create New Neon Account** voor een nieuw, door Vercel beheerd Neon-account, of **Link Existing Neon Account** als Marvin al Neon gebruikt.
4. Selecteer het bestaande Vercel-project en de gewenste omgevingen. Laat `PAYMENTS_ENABLED=false`.
5. Controleer daarna onder **Project → Settings → Environment Variables** dat `DATABASE_URL` bestaat voor de bedoelde omgeving.
6. Als de integratie ook `DATABASE_URL_UNPOOLED` levert, bewaar die voor migraties. Anders kopieer je in Neon via **Project Dashboard → Connect**, met connection pooling uit, de directe URL naar `DATABASE_URL_UNPOOLED`.
7. Trek voor uitsluitend lokaal testen de waarden veilig naar `.env.local`; commit dit bestand nooit.

De runtime gebruikt `DATABASE_URL`. `npm run db:migrate` kiest bij voorkeur `DATABASE_URL_UNPOOLED` en valt anders terug op `DATABASE_URL`. De runner voert alle genummerde SQL-bestanden in oplopende volgorde uit. Iedere migratie gebruikt een transactie en een advisory lock; tabellen, indexen en registraties zijn herhaalbaar ingericht. Tweemaal uitvoeren is daarom een verplichte controle:

```bash
npm run db:migrate
npm run db:migrate
```

Controleer daarna dat beide opdrachten voor iedere run melden:

- `Migratie 001_mollie_checkout.sql is veilig uitgevoerd.`
- `Migratie 002_withdrawals.sql is veilig uitgevoerd.`

## Echte concurrencytest

Gebruik uitsluitend een lege ontwikkel- of testbranch, nooit de productiedatabase:

Trek de Preview/Development-variabelen eerst naar het git-genegeerde `.env.local` en voer daarna uit:

```bash
npm run test:db
```

Zonder `DATABASE_URL` wordt de suite zichtbaar als overgeslagen gemeld. De test voert beide migraties tweemaal uit, controleert schema en constraints, maakt uitsluitend herkenbare testrecords aan, valideert gelijktijdige reserveringen, verlopen en verkochte voorraad, dubbele aankoop- en donatieverzoeken, dubbele/vertraagde betaalstatussen, `payment_review`, herroeping en outboxverwerking, en ruimt de testrecords weer op.
