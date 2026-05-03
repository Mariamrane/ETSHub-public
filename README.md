# ÉTS Hub

## French

**ÉTS Hub** est une plateforme web pour l’ÉTS : occupation des salles et laboratoires, horaires officiels dérivés des publications de l’école et recherche par cours ou enseignant. Ce dépôt public sert à l’audit du code client et au pipeline PDF vers données.

### **[ÉTS Hub](https://etshub.ca)**, contenu exposé par le site

- Salles ou laboratoires libres* **en temps réel (LIVE)**
- Savoir **jusqu’à quand** une salle reste libre / occupée
- Voir la ***densité d’occupation des pavillons*** **en temps réel (LIVE)**
- Choisir **date + heure** pour **planifier** plus tard (pas uniquement « maintenant »)

\* Les salles / labs avec accès limité sont **indiqués** (carte étudiante requise).

**Extra**

- **Petites salles de travail sans réservation** (avec une **description** de la salle)
- **Rechercher un cours** vers horaire **+** locaux
- **Rechercher un enseignant** vers cours **+** horaire

### Dépôt public

Transparence et audit pour l’école et les étudiants. Le déploiement de production est distinct de ce dépôt. Ce dépôt documente surtout l’interface web et la génération des données à partir des PDF officiels.

### Données

Aucune copie des PDF dans git (droits/licence). La procédure et les chemins attendus sont décrits dans `PDF_SOURCE.md`. La commande `npm run verify:data` régénère le JSON à partir d’une copie locale des publications officielles (emplacement précisé dans la doc), puis compare les sommes SHA‑256 au fichier de référence `provenance/checksums.json`.

```bash
npm install
npm run verify:data
```

Dev local :

```bash
npm install
npm run dev
```

**Stack :** Next.js (App Router), TypeScript.

## English

**ÉTS Hub** is a web app for ÉTS: room/lab occupancy, schedules derived from the school’s published PDFs, and search by course or instructor. This public repository focuses on auditing the client UI and the PDF-to-data pipeline.

### **[ÉTS Hub](https://etshub.ca)**, functionality exposed by the site

- Available classrooms/labs\* **in real time (LIVE)**
- See **how long** a room stays free / occupied
- ***Live occupancy density*** by building **(LIVE)**
- Pick **date + time** to **plan ahead**, not only “right now”

\* Restricted-access rooms/labs are **labeled** (student card required).

**Extra**

- **Small work rooms with no reservation** (with a **short room description**)
- **Course lookup** to schedule **+** rooms
- **Instructor lookup** to courses **+** schedule

### Public repo

Transparency and auditing for the school and students. Production deployment is separate from this tree, which centers on the web UI and extracting data from official PDFs.

### Data

Published PDF files are not committed (licensing). Procedures and paths are in `PDF_SOURCE.md`. Running `npm run verify:data` rebuilds JSON from local copies of official sources (locations described there) and compares SHA‑256 hashes to `provenance/checksums.json`.

```bash
npm install
npm run verify:data
```

Local dev:

```bash
npm install
npm run dev
```

**Stack:** Next.js (App Router), TypeScript.
