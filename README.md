# Interaktiv fysik-illustration: Projektilrörelse

Detta projekt är en liten interaktiv webbsida som visualiserar hur en projektil rör sig i en båge under påverkan av gravitationen. Syftet är att göra fysik lätt att förstå genom att låta användaren justera parametrar och direkt se effekterna i realtid.

## Översikt

Illustrationen visar en boll som skjuts iväg med en viss utgångshastighet och vinkel. Användaren kan:

- ändra startvinkel
- ändra utgångshastighet
- justera gravitationen
- se banans form och markör för tid, höjd och sträcka
- pausa, återstarta och återställa simuleringen

Detta passar för undervisning i mekanik, kinematics och projektilrörelse.

## Mål

- göra fysikmodellering visuell och interaktiv
- tydliggöra sambandet mellan vinkel, hastighet och bana
- demonstrera hur gravitation påverkar rörelsen
- ge en enkel, lättförståelig frontend utan komplicerad installation

## Planerad funktionalitet

- startvinkel (t.ex. 15°–75°)
- startfart (t.ex. 10–80 m/s)
- gravitation (t.ex. 1,6–19,6 m/s²)
- simulering i realtid
- spår av tidigare positioner
- visning av horisontell och vertikal komponent
- beräkningar för flygtid, maxhöjd och räckvidd

## Teknisk stack

Detta projekt kommer sannolikt att byggas med:

- HTML
- CSS
- JavaScript

Om projektet utökas kan det senare kompletteras med bibliotek för grafik eller animation, exempelvis canvas eller SVG.

## Så kör du projektet

1. öppna projektmappen i VS Code
2. starta en enkel lokal server från projektroten, t.ex.:

```bash
python -m http.server 8000
```

3. öppna webbläsaren på:

```text
http://localhost:8000
```

4. om sidan har en HTML-fil i roten, kan den även öppnas direkt i webbläsaren, men en lokal server rekommenderas för smidig utveckling.

## Projektstruktur

Det här är den förväntade filstrukturen:

```text
projectile-motion/
├── README.md
├── index.html
├── style.css
├── script.js
└── assets/
```

## Exempel på lärandemål

- förstå hur vinkel påverkar räckvidd
- se hur högre hastighet ger längre bana
- jämföra olika gravitationer
- analysera hur vertikal och horisontell rörelse separeras

## För utveckling

När projektet byggs vidare kan du lägga till:

- bättre UI-kontroller
- grafiska axlar och mått
- animation av projektilen på en canvas
- textuella beräkningar i realtid
- möjlighet att jämföra flera simuleringar samtidigt

## Licens

Detta projekt är tänkt för utbildnings- och demonstrationssyfte och kan anpassas efter skolprojekt eller lärarbeten.
