# Google Merchant Center — handmatige aansluiting

De website maakt bij iedere productiebuild automatisch `google-merchant-feed.xml`. Deze feed leest dezelfde productlijst als de webshop. Alleen werkelijk koopbare, niet-verkochte werken met geldige gegevens en voorraad komen erin. Prijs, voorraadstatus en verzendkosten worden dus niet nogmaals met de hand bijgehouden.

## Later eenmalig instellen

1. Open Google Merchant Center en voeg `stilte-en-draad.nl` toe als website.
2. Kies bij **Gegevensbronnen** voor een productbron via een URL.
3. Vul in: `https://www.stilte-en-draad.nl/google-merchant-feed.xml`.
4. Kies Nederland en Nederlands. Gebruik de feed voor gratis vermeldingen.
5. Stel ophalen alleen via de daarvoor bedoelde Merchant Center-functie in; de gewone feed vermeldt de landelijke verzending van € 6,95.
6. Controleer na de eerste verwerking afgekeurde producten, prijzen, afbeeldingen en verzendgegevens.

Google kan verwerking en goedkeuring niet garanderen. Controleer na wijzigingen steeds of de landingspagina, feed en Merchant Center dezelfde prijs en beschikbaarheid tonen. Koppel nog geen advertentiecampagne zonder aparte beslissing.

## Eerst nog controleren: AI-metadata van productfoto’s

De productpagina vertelt al eerlijk dat achtergronden en settings digitaal of deels met AI zijn samengesteld. Google verlangt daarnaast bij AI-gegenereerde of samengestelde productbeelden passende IPTC `DigitalSourceType`-metadata. Een niet-destructieve broncontrole vond die herkenbare markering alleen in productfoto 26 en 27; voor de overige feedbeelden kon zij niet worden aangetoond. Verander of hercodeer de foto’s niet alleen om dit te omzeilen. Laat vóór het handmatig aansluiten van Merchant Center de bronbestanden gecontroleerd van de juiste metadata voorzien, zonder pixels, uitsnede of kleur te veranderen, en valideer daarna opnieuw. De feed staat technisch klaar, maar deze inhoudelijke beeldcontrole blijft een voorwaarde voor aansluiting.
