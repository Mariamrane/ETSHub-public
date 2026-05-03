# ÉTS Hub

Trouver une salle libre à l’ÉTS en temps réel, sans tourner 20 minutes dans les pavillons.

Démo (site en production) : `https://etshub.ca`

## 🇫🇷 Français

Comme beaucoup d’étudiants à l’ÉTS, je passais souvent 15–20 minutes à tourner dans les pavillons pour trouver une salle libre. Entre les bibliothèques pleines et les salles réservées, ça devient vite frustrant quand on veut juste étudier ou faire un travail d’équipe.

J’ai donc créé **ÉTS Hub**, une plateforme simple pour centraliser l’info au même endroit.

Tu peux y voir les salles et labs libres en temps réel (LIVE), savoir jusqu’à quand une salle est libre/occupée, voir la densité d’occupation par pavillon, et choisir une date + heure pour planifier plus tard.

Il y a aussi des fonctionnalités supplémentaires comme les petites salles de travail sans réservation (avec description), la recherche par cours (horaire + locaux) et la recherche par enseignant (cours + horaire).

Les salles/labs avec accès limité sont indiquées (carte étudiante requise).

### Pourquoi ce dépôt est public
Ce dépôt est public pour l’audit/transparence (école/étudiants) et pour montrer la provenance des données.

Le déploiement (site en production) est géré séparément. Ici, l’objectif est surtout de montrer le code côté client et la chaîne de génération des données à partir des PDF officiels.

### Provenance des données (PDF → JSON)
Ce dépôt n’inclut pas les PDF (licence / redistribution). Pour vérifier la provenance, voir `PDF_SOURCE.md`.

Vérification reproductible :

```bash
npm install
npm run verify:data
```

Si la commande affiche **OK ✅**, les données générées à partir des PDF correspondent aux checksums de `provenance/checksums.json`.

### Lancer localement (optionnel)

```bash
npm install
npm run dev
```

### Stack
Next.js (App Router), TypeScript, parsing PDF → JSON et vérification par SHA‑256.

### Contribution
Ce dépôt est public pour audit uniquement. Les contributions externes ne sont pas acceptées pour le moment.

## 🇬🇧 English

Like many ÉTS students, I often spent 15–20 minutes walking around buildings to find an available room. Between packed libraries and reserved classrooms, it gets frustrating when you just want to study or work on a team project.

So I built **ÉTS Hub**, a simple platform to keep everything in one place.

It shows live available classrooms/labs (LIVE), how long a room stays free/occupied, live occupancy density per building, and lets you pick a date + time to plan ahead.

It also includes extra features like work rooms that don’t require reservations (with descriptions), course search (schedule + rooms), and teacher search (courses + schedule).

Rooms/labs with restricted access are flagged (student card required).

### Why this repository is public
This repository is public for audit/transparency (school/students) and to show data provenance.

Production deployment is handled separately. This public repo mainly exists to share the client-side code and the PDF-to-data generation flow.

### Data provenance (PDF → JSON)
This repository does not include PDFs (licensing/redistribution). For instructions, see `PDF_SOURCE.md`.

Reproducible verification:

```bash
npm install
npm run verify:data
```

If the command prints **OK ✅**, the PDF‑derived data matches the checksums in `provenance/checksums.json`.

### Run locally (optional)

```bash
npm install
npm run dev
```

### Tech stack
Next.js (App Router), TypeScript, PDF → JSON parsing and SHA‑256 verification.

### Contributions
This repository is public for audit only. External contributions are not accepted at the moment.

