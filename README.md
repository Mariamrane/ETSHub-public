# ÉTS Hub

Trouver une salle libre à l’ÉTS en temps réel — sans tourner 20 minutes dans les pavillons.

Démo (site en production) : `https://etshub.ca`

---

## 🇫🇷 Français

Comme beaucoup d’étudiants à l’ÉTS, je passais souvent 15–20 minutes à tourner dans les pavillons pour trouver une salle libre. Entre les bibliothèques pleines et les salles réservées, ça devient vite frustrant quand on veut juste étudier ou faire un travail d’équipe.

J’ai donc créé **ÉTS Hub**, une plateforme simple qui centralise :

- Salles ou laboratoires libres en temps réel (LIVE)
- Jusqu’à quand une salle est libre / occupée
- Densité d’occupation des pavillons en temps réel (LIVE)
- Choisir une date + heure pour planifier plus tard

Fonctionnalités supplémentaires :

- Trouver des petites salles de travail sans réservation (avec description)
- Rechercher un cours et voir son horaire et ses locaux
- Rechercher un enseignant et voir ses cours et son horaire

> Note : les salles/labs avec accès limité sont indiquées (carte étudiante requise).

### Pourquoi ce dépôt est public
Ce dépôt est une version **open‑source pour audit/transparence** (école/étudiants) et pour montrer la provenance des données.

Le déploiement (site en production) est géré séparément ; ce dépôt public sert surtout à :
- montrer le code côté client
- montrer comment les données sont générées à partir des PDF officiels

### Provenance des données (PDF → JSON)
Ce dépôt **n’inclut pas** les PDF (licence / redistribution).  
Pour vérifier la provenance, voir `PDF_SOURCE.md`.

Vérification reproductible (recommandé) :

```bash
npm install
npm run verify:data
```

Si la commande affiche **OK ✅**, les données générées à partir des PDF correspondent aux checksums commités dans `provenance/checksums.json`.

### Lancer localement (optionnel)

```bash
npm install
npm run dev
```

### Stack
- Next.js (App Router)
- TypeScript
- Parsing PDF → JSON + vérification par SHA‑256

### Contribution
Ce dépôt est public pour transparence/audit uniquement.  
Les contributions externes ne sont pas acceptées pour le moment.

---

## 🇬🇧 English

Like many ÉTS students, I often spent 15–20 minutes walking around buildings to find an available room. Between packed libraries and reserved classrooms, it gets frustrating when you just want to study or work on a team project.

So I built **ÉTS Hub**, a simple platform that centralizes:

- Live available classrooms/labs (LIVE)
- How long a room stays free / occupied
- Live building occupancy density (LIVE)
- Pick a date + time to plan ahead

Extra features:

- Find work rooms that don’t require reservations (with descriptions)
- Search a course and see its schedule/rooms
- Search a teacher and see their courses/schedule

> Note: rooms/labs with restricted access are flagged (student card required).

### Why this repository is public
This repository is an **open‑source audit/transparency** version (school/students) and a way to show data provenance.

Production deployment is handled separately; this public repo mainly exists to:
- share the client-side code
- show how data is generated from official PDFs

### Data provenance (PDF → JSON)
This repository does **not** include PDFs (licensing/redistribution).  
For instructions, see `PDF_SOURCE.md`.

Reproducible verification (recommended):

```bash
npm install
npm run verify:data
```

If the command prints **OK ✅**, the PDF‑derived data matches the committed checksums in `provenance/checksums.json`.

### Run locally (optional)

```bash
npm install
npm run dev
```

### Tech stack
- Next.js (App Router)
- TypeScript
- PDF → JSON parsing + SHA‑256 verification

### Contributions
This repository is public for transparency/audit only.  
External contributions are not accepted at the moment.

