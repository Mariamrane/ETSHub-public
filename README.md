# ÉTS Hub

**[etshub.ca](https://etshub.ca)** — trouver une salle libre à l’ÉTS sans perdre 20 minutes dans les pavillons.

## French

Salut 👋

Comme beaucoup à l’ÉTS, je finissais souvent par **15–20 minutes à tourner** dans les corridors pour trouver une salle dispo… pour me faire sortir cinq minutes plus tard parce qu’un cours commençait. Entre **bibliothèques blindées** et **salles déjà réservées**, ça devient vite pénible quand tu veux juste **caler une session de travail** ou un meeting de groupe.

Ceci étant dit, j’ai créé une plateforme simple pour régler ça **(et pas que)** :

### **[ÉTS Hub](https://etshub.ca)** — tout centralisé au même endroit

- Salles ou laboratoires libres* **en temps réel (LIVE)**
- Savoir **jusqu’à quand** une salle reste libre / occupée
- Voir la ***densité d’occupation des pavillons*** **en temps réel (LIVE)**
- Choisir **date + heure** pour **planifier** plus tard (pas uniquement « maintenant »)

\* Les salles / labs avec accès limité sont **indiqués** (carte étudiante requise).

**✨ Extra :**

- ⚡ **Trouver des petites salles de travail SANS réservation** (avec une **description** de la salle)
- ⚡ **Rechercher un cours** → horaire **+** locaux
- ⚡ **Rechercher un enseignant** → cours **+** horaire

Les salles sans réservation, ça évite les allers-retours quand tu veux un cadre tranquille sans booker trois jours à l’avance. Côté **cours / prof**, c’est utile pour rattraper un lab manqué, vérifier un local ou **boucler un cours en urgence** sans déchiffrer cinq PDF différents.

**Astuce :** tu peux **ajouter le site à ton écran d’accueil** et l’utiliser presque comme une petite app 📱.

### Pourquoi ce dépôt est public

Ce dépôt est public pour l’audit et la transparence (école et étudiants). Le site en production est déployé séparément. Ici, l’objectif est surtout de montrer le code côté client et la chaîne de génération des données à partir des PDF officiels.

### Provenance des données (PDF → JSON)

Les PDF ne sont pas inclus dans ce dépôt (licence et redistribution). Les détails pratiques sont dans `PDF_SOURCE.md`.

L’idée de la “vérification reproductible”, c’est simple : une personne qui télécharge les mêmes PDF officiels, puis lance la commande de vérification, obtient les mêmes empreintes (SHA‑256) que celles stockées dans `provenance/checksums.json`. Ça permet de confirmer que les données ne sont pas “inventées à la main” dans le repo.

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

Hey 👋

Like many ÉTS students, I’ve spent **15–20 minutes roaming** halls looking for an open spot… then getting kicked out a few minutes later because a lecture was about to start. Between **packed libraries** and **already-reserved classrooms**, it’s rough when all you want is a **focused work session** or a quick group meetup.

So I built a simple platform to fix that **(and more)**:

### **[ÉTS Hub](https://etshub.ca)** — everything in one place

- Available classrooms/labs\* **in real time (LIVE)**
- See **how long** a room stays free / occupied
- ***Live occupancy density*** by building **(LIVE)**
- Pick **date + time** to **plan ahead**, not only “right now”

\* Restricted-access rooms/labs are **labeled** (student card required).

**✨ Extra:**

- ⚡ **Small work rooms with NO reservation** (with a **short room description**)  
- ⚡ **Course lookup** → schedule **+** rooms  
- ⚡ **Instructor lookup** → courses **+** schedule  

No-reservation rooms are handy when you want a quieter setup without booking days ahead. The **course/instructor search** helps when you need to recover a missed lab, double-check a room, or navigate a tight semester without juggling a pile of PDFs.

**Tip:** you can **add the site to your home screen** and use it almost like a small app 📱.

### Why this repository is public

This repository is public for audit and transparency (school and students). Production deployment is handled separately. This public repo mainly exists to share the client-side code and the PDF-to-data generation flow.

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
