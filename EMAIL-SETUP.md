# Transactionele e-mail — veilige voorbereiding

De bestaande database-outbox en de Resend-provider zijn technisch voorbereid, maar verzending staat bewust uit. Dit staat los van Mollie: `PAYMENTS_ENABLED=false` blijft ongewijzigd.

## Wat al werkt

- De outbox ondersteunt ontvangst, betaalstatus, donatie en herroeping.
- De verwerker claimt berichten veilig met `skip locked`, markeert succes en plant een retry na een providerfout.
- Elk bericht gebruikt een vaste idempotency-key op basis van het outbox-ID.
- De verwerkingsroute accepteert alleen een correct Bearer-secret.
- Alle berichttypen hebben een eenvoudige Nederlandstalige tekstversie.

## Wat handmatig nodig blijft

1. Maak een Resend-account of koppel Resend later via de Vercel Marketplace.
2. Verifieer `stilte-en-draad.nl` bij Resend en plaats de gevraagde SPF- en DKIM-records bij de DNS-provider.
3. Stel uitsluitend server-side in Vercel in:
   - `RESEND_API_KEY`
   - `EMAIL_FROM`
   - `EMAIL_REPLY_TO`
   - `CRON_SECRET`
   - `EMAIL_ENABLED=false`
4. Test ieder berichttype eerst met een gecontroleerd testadres.
5. Zet pas na visuele controle en een geslaagde ontvangsttest `EMAIL_ENABLED=true` in de bedoelde omgeving.
6. Voeg pas daarna een Vercel Cron toe voor `/api/email/process`; zonder cron of handmatige beveiligde oproep wordt de wachtrij niet verwerkt.

## Veiligheidsregels

- Zet nooit een sleutel in Git, documentatie, browsercode of een variabele met `VITE_`-prefix.
- Activeer Production pas nadat SPF en DKIM geldig zijn en alle zes berichttypen zijn gecontroleerd.
- Gebruik voor Preview een afzonderlijke testconfiguratie en een ontvanger die door Marvin wordt beheerd.
- Log geen berichtinhoud, e-mailadres of providerantwoord met persoonsgegevens.
