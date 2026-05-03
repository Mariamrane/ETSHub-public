# ÉTS Hub

Démo : **[etshub.ca](https://etshub.ca)**

## French

**ÉTS Hub** est une plateforme web pour l’ÉTS : occupation des salles et laboratoires, horaires officiels dérivés des publications de l’école et recherche par cours ou enseignant. Le dépôt public sert à l’audit du code client et à la chaîne PDF → données.

### **[ÉTS Hub](https://etshub.ca)** — contenu disponible sur le site

- Salles ou laboratoires libres* **en temps réel (LIVE)**
- Savoir **jusqu’à quand** une salle reste libre / occupée
- Voir la ***densité d’occupation des pavillons*** **en temps réel (LIVE)**
- Choisir **date + heure** pour **planifier** plus tard (pas uniquement « maintenant »)

\* Les salles / labs avec accès limité sont **indiqués** (carte étudiante requise).

**Extra**

- **Petites salles de travail sans réservation** (avec une **description** de la salle)
- **Rechercher un cours** → horaire **+** locaux
- **Rechercher un enseignant** → cours **+** horaire

### Pourquoi ce dépôt est public

Ce dépôt est public pour l’audit et la transparence (école et étudiants). Le site en production est déployé séparément. L’objectif ici est surtout le code côté client et la génération des données à partir des PDF officiels.

### Provenance des données (PDF → JSON)

Les PDF ne sont pas inclus dans ce dépôt (licence et redistribution). Les détails pratiques sont dans `PDF_SOURCE.md`.

L’idée de la « vérification reproductible », c’est simple : une personne qui télécharge les mêmes PDF officiels, puis lance la commande de vérification, obtient les mêmes empreintes (SHA‑256) que celles stockées dans `provenance/checksums.json`. Ça permet de confirmer que les données ne sont pas « inventées à la main » dans le repo.

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

**ÉTS Hub** is a web app for ÉTS: room/lab occupancy, official schedules derived from the school’s published PDFs, and search by course or instructor. This public repository is for auditing the client code and the PDF → data pipeline.

### **[ÉTS Hub](https://etshub.ca)** — what the site exposes

- Available classrooms/labs\* **in real time (LIVE)**
- See **how long** a room stays free / occupied
- ***Live occupancy density*** by building **(LIVE)**
- Pick **date + time** to **plan ahead**, not only “right now”

\* Restricted-access rooms/labs are **labeled** (student card required).

**Extra**

- **Small work rooms with no reservation** (with a **short room description**)
- **Course lookup** → schedule **+** rooms
- **Instructor lookup** → courses **+** schedule

### Why this repository is public

This repository is public for audit and transparency (school and students). Production deployment is handled separately. The focus here is client-side code and generating data from official PDFs.

### Data provenance (PDF → JSON)

PDFs are not included in this repository (licensing/redistribution). Practical details are in `PDF_SOURCE.md`.

“Reproducible verification” means: if someone downloads the same official PDFs and runs the verification command, they get the same SHA‑256 fingerprints as the ones stored in `provenance/checksums.json`. That helps confirm the data wasn’t manually edited inside the repo.

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
