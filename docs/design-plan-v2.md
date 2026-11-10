# Bandita v2 · Design-Plan „Magazin, aber wilder"

Stand: 10. November 2026 · erarbeitet im Gespräch mit Pia-Alice Stelzl (CD) · Branch `v2`, Vorschau: https://bandita-git-v2-bandita.vercel.app/de

## Die Idee in einem Satz

Ein Magazin, das in einem Raum liegt: Papier-Kapitel mit echter Fotografie und Raum-Kapitel in 3D wechseln sich ab, und eine Kamera fährt beim Scrollen durch den ganzen Raum, von Station zu Station.

## Was du entschieden hast

| Frage | Entscheidung |
|---|---|
| Gefühl | Magazin, aber wilder: Kapitel und Haltung bleiben, Bewegung und 3D kommen dazu |
| Erste drei Sekunden | Glasbuchstaben im Film **und** ein Objekt **und** eine Kamerafahrt, in einer Szene |
| Objekt | Die Kinokamera |
| Reichweite der Fahrt | Durch die ganze Seite, jedes Kapitel eine Station |
| Bewegung | Ruhe, dann Explosion: still auf dem Papier, Bewegung an den Übergängen und im Raum |
| Farbe | Wechsel hell/dunkel: Ink für den Raum, Creme für das Papier, Farbe in Stößen |
| Fotos vs 3D | Halbe-halbe im Wechsel: dunkle Kapitel sind 3D, helle Kapitel sind Fotografie |
| Interaktionen überall | Band-Cursor, Bilder verflüssigen |
| Überschriften | Alle aus Partikeln (bleibt) |

## Der Raum

Ein dunkler Saal. Hinten eine Leinwand, auf der euer Film läuft. Davor schweben die Glasbuchstaben „Brav war gestern." und brechen den Film. Rechts steht die Kinokamera. Das Seidenband windet sich durch alles. Die Kamera des Besuchers fährt beim Scrollen durch diesen Saal; wo ein Papier-Kapitel kommt, schiebt sich eine Seite vor die Linse, wo ein Raum-Kapitel kommt, fährt sie weiter.

## Die neun Stationen

| # | Kapitel | Welt | Was passiert |
|---|---|---|---|
| 01 | Titel | Raum | Intro: Partikel fliegen zusammen, werden Glasbuchstaben. Kamera fährt in den Saal, Leinwand mit Film hinten, Kinokamera rechts. Maus dreht die Buchstaben, Scroll fährt die Kamera an ihnen vorbei zur Leinwand. |
| 02 | Am Set | Papier | Eure Fotos, Parallaxe, Ruhe. Beim Hover verflüssigen sich die Bilder. |
| 03 | Serie | Farbe | Bleibt wie gebaut: vier Gläser, vier Welten, gepinnt. |
| 04 | Arbeiten | Raum | Die Kamera fährt an den Projekten vorbei wie an Bildern in einer Galerie. Die Cover hängen als Flächen im Raum, wellen sich beim Hover, ein Klick öffnet das Projekt. |
| 05 | Haltung | Papier | Ein Satz aus Partikeln, das Band, sonst nichts. |
| 06 | Wer dahintersteht | Raum | Dein Porträt hängt als Fläche im Saal, der Vorhang zieht sich beim Scrollen auf. Das Team daneben. |
| 07 | Leistungen | Papier | Die Disziplinen-Konstellation, Partikel-Überschrift. |
| 08 | Was Kunden sagen | Raum | Die Facebook-Zitate schweben als Schrift im Raum, die Kamera gleitet durch sie hindurch. Erscheint, sobald die Bewertungen da sind. |
| 09 | Kontakt | Pink | Die Fahrt endet vor dem Objektiv der Kinokamera. Es füllt den Bildschirm, wird Pink, die Kontakt-Seite. |

## Interaktionen auf der ganzen Seite

- **Band-Cursor**: ein kleines Seidenband zieht hinter der Maus her, legt sich über Links, schnürt sich beim Klick zusammen. Nur Desktop.
- **Bilder verflüssigen**: Fotos und Projektflächen wellen sich beim Hover wie Wasser, im Raum per Shader, auf dem Papier per Verzerrungsfilter.
- **Partikel-Überschriften**: bleiben, alle.
- **Nahtlose Seitenwechsel**: der pinke Vorhang bleibt, dazu trägt das Wort BANDITA den Wechsel.
- **Handy**: Gyroskop statt Maus, der Raum ohne Glasbrechung, weniger Partikel. Die Fahrt bleibt.

## Ehrlich: Risiken

- **Handys**: ein durchgehender 3D-Raum kostet Akku und Leistung. Alte Geräte bekommen eine ruhige Version, die Papier-Kapitel sind überall gleich.
- **Aufwand**: das ist der größte Umbau seit dem Start von v2. Ich baue in Etappen, nach jeder siehst du ein Ergebnis auf der Vorschau.
- **Inhalt**: 3D ersetzt keine Inhalte. Die Reels, „So läuft's" und die Bewertungen kommen weiterhin dazu.

## Etappen

1. **Der Saal** (Cover): Glasbuchstaben, Leinwand mit Film, Kinokamera, Kamerafahrt, Intro aus Partikeln.
2. **Hände**: Band-Cursor, Bilder verflüssigen.
3. **Die Galerie** (Arbeiten als Fahrt).
4. **Die Stationen** 06 und 08, das Ende vor dem Objektiv (09).
5. **Feinschliff**: Handy, Leistung, Übergänge.

## Offen

- Kinokamera: realistisch in Schwarz und Grau, oder eine Bandita-Edition in Pink-Lack?
- Leinwand: vorerst der Cocktail-Film. Sobald ein 16:9-Film in 1080p da ist, wird er getauscht.
- Nichts davon geht auf main, bevor du es freigibst.
