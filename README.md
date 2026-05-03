# ÉTS Hub

Démo : **[etshub.ca](https://etshub.ca)**

## French

**ÉTS Hub** est une plateforme web pour l’ÉTS : occupation des salles et laboratoires, horaires officiels dérivés des publications de l’école et recherche par cours ou enseignant. Ce dépôt public sert à l’audit du code client et au pipeline PDF → données.

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

### Dépôt public

Transparence / audit (école, étudiants). Le site en production n’est pas ce repo — ici : interface + génération des données à partir des PDF officiels.

### Données

Pas de PDF dans git (licence). Procédure et chemins : `PDF_SOURCE.md`. `npm run verify:data` parse les PDF que tu places localement et compare le SHA‑256 au fichier `provenance/checksums.json` (reproductibilité).

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

**Contributions :** audit seulement, pas de PR externes pour le moment.

## English

**ÉTS Hub** is a web app for ÉTS: room/lab occupancy, schedules derived from the school’s published PDFs, and search by course or instructor. This public repo is for auditing the client UI and the PDF → data pipeline.

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

### Public repo

Transparency / auditing (school, students). Production is deployed elsewhere — this tree is UI + deriving data from official PDFs.

### Data

PDFs aren’t tracked (licensing). Steps and paths: `PDF_SOURCE.md`. `npm run verify:data` parses locally supplied PDFs and checks SHA‑256 against `provenance/checksums.json` (reproducibility).

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

**Contributions:** audit-only; external PRs aren’t accepted right now.
