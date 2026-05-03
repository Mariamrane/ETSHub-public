# ÉTS Hub

Trouver une salle libre à l’ÉTS en temps réel, sans tourner 20 minutes dans les pavillons.

Démo (site en production) : `https://etshub.ca`

## Francais

Comme beaucoup d’étudiants à l’ÉTS, je passais souvent 15–20 minutes à tourner dans les pavillons pour trouver une salle libre. Entre les bibliothèques pleines et les salles réservées, ça devient vite frustrant quand on veut juste étudier ou faire un travail d’équipe.

J’ai donc créé **ÉTS Hub**, une plateforme simple pour centraliser l’info au même endroit. Tu peux y voir les salles et labs libres en temps réel (LIVE), savoir jusqu’à quand une salle est libre ou occupée, voir la densité d’occupation par pavillon, et choisir une date et une heure pour planifier plus tard. Il y a aussi des petites salles de travail sans réservation (avec description), une recherche par cours (horaire et locaux) et une recherche par enseignant (cours et horaire). Les salles ou labs avec accès limité sont indiqués (carte étudiante requise).

### Pourquoi ce dépôt est public

Ce dépôt est public pour l’audit et la transparence (école et étudiants). Le site en production est déployé séparément. Ici, l’objectif est surtout de montrer le code côté client et la chaîne de génération des données à partir des PDF officiels.

### Provenance des données (PDF → JSON)

Les PDF ne sont pas inclus dans ce dépôt (licence et redistribution). Les détails pratiques sont dans `PDF_SOURCE.md`.

L’idée de la “vérification reproductible”, c’est simple : une personne qui télécharge les mêmes PDF officiels, puis lance la commande de vérification, obtient les mêmes empreintes (SHA‑256) que celles stockées dans `provenance/checksums.json`. Ça permet de confirmer que les données affichées côté site découlent bien des horaires officiels, et pas d’un fichier JSON modifiable à la main dans le dépôt.

Tu peux te demander si tout ça “doit” être sur GitHub. Pour cette partie précisément, oui et c’est courant dans les projets ouverts : on ne publie ni les PDF (droits et redistribution), ni des secrets ; on publie la méthode (scripts), la commande à lancer et un fichier de référence (`provenance/checksums.json`). L’auditeur ou l’école télécharge elle‑même les PDF depuis la source officielle, rejoue la même chaîne localement et compare. Le détail des chemins et des étapes est dans `PDF_SOURCE.md`.

Commande :

```bash
npm install
npm run verify:data
```

### Lancer localement (optionnel)

```bash
npm install
npm run dev
```

### Stack

Next.js (App Router), TypeScript, parsing PDF → JSON, vérification par SHA‑256.

### Contribution

Ce dépôt est public pour audit uniquement. Les contributions externes ne sont pas acceptées pour le moment.

## English

Like many ÉTS students, I often spent 15–20 minutes walking around buildings to find an available room. Between packed libraries and reserved classrooms, it gets frustrating when you just want to study or work on a team project.

So I built **ÉTS Hub**, a simple platform to keep everything in one place. It shows live available classrooms/labs (LIVE), how long a room stays free or occupied, live occupancy density per building, and lets you pick a date and time to plan ahead. It also includes work rooms that don’t require reservations (with descriptions), course search (schedule and rooms), and teacher search (courses and schedule). Rooms/labs with restricted access are flagged (student card required).

### Why this repository is public

This repository is public for audit and transparency (school and students). Production deployment is handled separately. This public repo mainly exists to share the client-side code and the PDF-to-data generation flow.

### Data provenance (PDF → JSON)

PDFs are not included in this repository (licensing/redistribution). Practical details are in `PDF_SOURCE.md`.

“Reproducible verification” means: if someone downloads the same official PDFs and runs the verification command, they get the same SHA‑256 fingerprints as the ones stored in `provenance/checksums.json`. That confirms the figures on the site trace back to the official schedules, rather than relying on JSON someone could silently edit in the repo.

You might wonder whether this belongs on GitHub at all. For verification specifically, yes, and open projects often do exactly this: we do not publish the PDFs (licensing/redistribution) or any secrets—we publish the mechanics (scripts), the command to run, and a reference fingerprint file (`provenance/checksums.json`). Anyone auditing downloads the PDFs from the official source, replays the same pipeline locally, and compares. Paths and steps are spelled out in `PDF_SOURCE.md`.

Command:

```bash
npm install
npm run verify:data
```

### Run locally (optional)

```bash
npm install
npm run dev
```

### Tech stack

Next.js (App Router), TypeScript, PDF → JSON parsing, SHA‑256 verification.

### Contributions

This repository is public for audit only. External contributions are not accepted at the moment.
