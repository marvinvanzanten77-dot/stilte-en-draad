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

## Herkomstmarkering van productfoto’s

De productpagina vertelt eerlijk dat achtergronden en settings digitaal of deels met AI zijn samengesteld. Alle 19 Merchant-vermeldingen verwijzen daarom naar een publiek productbeeld met IPTC `DigitalSourceType`:

`http://cv.iptc.org/newscodes/digitalsourcetype/compositeSynthetic`

Dit is de officiële IPTC NewsCode voor een samengesteld beeld waarvan minstens één element generatieve AI bevat. De 19 vermeldingen gebruiken 18 unieke beeldbestanden, omdat twee vermeldingen hetzelfde publieke bronbestand delen. De metadata is zonder hercodering toegevoegd: pixels, kleur, uitsnede, resolutie en compressiedata zijn niet gewijzigd. De productiebuild controleert de markering voortaan voordat de feed wordt geschreven en stopt wanneer een feedbeeld haar mist.

## Titels en beschrijvingen

De productnamen, feitelijke gegevens en verhalen zijn afkomstig van Marvin en Jannie en alleen redactioneel met AI ondersteund. Zij zijn daarmee niet als generatief-AI-tekst aangeleverd. De feed gebruikt daarom de gewone Google-attributen `title` en `description`. `structured_title` en `structured_description` met `trained_algorithmic_media` zijn volgens Google alleen vereist wanneer de tekst zelf met generatieve AI is gemaakt. De zichtbare productteksten worden voor deze technische markering niet aangepast.
