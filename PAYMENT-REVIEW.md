# Procedure `payment_review`

`payment_review` is een blokkerende administratieve status. De order mag niet worden verzonden of afgehaald. Er volgt nooit automatisch een refund.

## Controle en beslissing

1. Blokkeer fulfilment en neem geen handmatige voorraadactie voordat de controle klaar is.
2. Controleer de betaling rechtstreeks in Mollie aan de hand van `mollie_payment_id`.
3. Vergelijk bedrag, valuta, betaalstatus, betaalreferentie, ordernummer en ordergegevens.
4. Controleer `order_audit_log` voor de statusgeschiedenis.
5. Controleer `inventory_audit_log` en `product_inventory` voor reservering, vrijgave, verkoop en eventuele conflicten.
6. Leg de conclusie vast als een nieuwe auditgebeurtenis met actor, reden en alleen noodzakelijke details.
7. Kies daarna één handmatige uitkomst:
   - vrijgeven voor fulfilment als betaling en voorraad aantoonbaar kloppen;
   - refund bij een betaalde order die niet geleverd kan worden;
   - escaleren als betaling, identiteit of voorraad niet eenduidig is.

Een late betaalde webhook bij inmiddels opnieuw gereserveerde of verkochte voorraad zet de order op `payment_review` met reden `late_paid_inventory_conflict`. De bestaande reservering of verkoop wordt niet overschreven. De outbox maakt een berichttype `payment_review` klaar, maar een externe mailprovider is nog niet geactiveerd.

Er is bewust nog geen beheerpaneel of automatische vrijgave/refund. Een toekomstige beheerdersactie moet altijd een record aan `order_audit_log` toevoegen; rechtstreekse statuswijzigingen zonder audit zijn niet toegestaan.
