# Transactionele e-mail — veilige voorbereiding

De bestaande database-outbox en de Resend-provider zijn technisch voorbereid, maar verzending staat bewust uit. Dit staat los van Mollie: `PAYMENTS_ENABLED=false` blijft ongewijzigd.

## Actuele Resend-status — 2 augustus 2026

- Provider: Resend.
- Domein: `mail.stilte-en-draad.nl`.
- Regio: `eu-west-1` (Ireland).
- De vereiste DKIM-, SPF- en MX-records zijn bij MijnDomein toegevoegd.
- Domain Events meldt `DNS verified`, maar de algemene domeinstatus staat nog op `pending`/`verifying`.
- `Enable Sending` staat aan in Resend; `Enable Receiving` staat uit.
- Er is nog geen Resend API-key aangemaakt.
- `EMAIL_ENABLED=false` blijft in iedere omgeving gehandhaafd.
- Er wordt nog geen testmail of echte e-mail verstuurd.
- Gepland afzenderadres na volledige verificatie: `Stilte & Draad <bericht@mail.stilte-en-draad.nl>`.
- Gepland Reply-To- en bereikbaar contactadres: `marvinvanzanten77@gmail.com`.
- `info@stilte-en-draad.nl` is geen bestaande mailbox en mag niet als bereikbaar adres worden gebruikt.

MijnDomein heeft bij het toevoegen van de DNS-records het algemene DMARC-beleid op monitoring (`none`) gezet en het bestaande SPF-beleid op soft-fail (`~all`). Dit moet vóór volledige livegang bewust opnieuw worden beoordeeld en waar mogelijk worden aangescherpt.

De volgende e-mailfase start pas wanneer Resend de algemene domeinstatus volledig als `verified` toont. `DNS verified` in Domain Events alleen is hiervoor niet voldoende.

## Wat al werkt

- De outbox ondersteunt ontvangst, betaalstatus, donatie en herroeping.
- De verwerker claimt berichten veilig met `skip locked`, markeert succes en plant een retry na een providerfout.
- Elk bericht gebruikt een vaste idempotency-key op basis van het outbox-ID.
- De verwerkingsroute accepteert alleen een correct Bearer-secret.
- Alle berichttypen hebben een eenvoudige Nederlandstalige tekstversie.

## Volgende gecontroleerde fase — nog niet uitvoeren

1. Wacht totdat Resend `mail.stilte-en-draad.nl` volledig als `verified` toont.
2. Maak daarna een beperkte Resend API-key aan met alleen de noodzakelijke verzendrechten.
3. Configureer de key uitsluitend als server-side Vercel-secret; zet haar nooit in Git, documentatie of browsercode.
4. Stel server-side `EMAIL_FROM` in op `Stilte & Draad <bericht@mail.stilte-en-draad.nl>` en `EMAIL_REPLY_TO` op `marvinvanzanten77@gmail.com`.
5. Houd `EMAIL_ENABLED=false` in Production en test eerst uitsluitend in Preview met een gecontroleerd testadres.
6. Controleer alle zes transactionele berichttypen: bestelling ontvangen, betaling geslaagd, betaling mislukt/geannuleerd, handmatige betaalcontrole, donatie bevestigd en herroeping ontvangen.
7. Test retries, de vaste idempotency-key en de verwerking van de database-outbox zonder dubbele verzending.
8. Activeer Production pas na een volledig geslaagde acceptatietest en afzonderlijke toestemming.
9. Beoordeel vóór volledige livegang het DMARC-beleid (`none`) en SPF-beleid (`~all`) opnieuw en scherp die waar mogelijk aan.
10. Voeg pas na acceptatie een Vercel Cron toe voor `/api/email/process`; zonder cron of handmatige beveiligde oproep wordt de wachtrij niet verwerkt.

## Veiligheidsregels

- Zet nooit een sleutel in Git, documentatie, browsercode of een variabele met `VITE_`-prefix.
- Activeer Production pas nadat Resend het domein volledig als `verified` toont, SPF en DKIM geldig zijn en alle zes berichttypen zijn gecontroleerd.
- Gebruik voor Preview een afzonderlijke testconfiguratie en een ontvanger die door Marvin wordt beheerd.
- Log geen berichtinhoud, e-mailadres of providerantwoord met persoonsgegevens.
