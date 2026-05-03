# ÉTS Hub (public audit repo)

Comme beaucoup d’étudiants à l’ÉTS, je passais souvent 15–20 minutes à tourner dans les pavillons pour trouver une salle libre. Entre les bibliothèques pleines et les salles réservées, ça devient vite frustrant quand on veut juste étudier ou faire un travail d’équipe.

J’ai donc créé **ÉTS Hub**, une plateforme simple qui centralise :

- Salles ou laboratoires libres en temps réel (LIVE)
- Jusqu’à quand une salle est libre / occupée
- Densité d’occupation des pavillons en temps réel (LIVE)
- Choisir une date + heure pour planifier plus tard

Extras :

- Trouver des petites salles de travail sans réservation (avec description)
- Rechercher un cours et voir son horaire et ses locaux
- Rechercher un enseignant et voir ses cours et son horaire

> Note : les salles/labs avec accès limité sont indiquées (carte étudiante requise).

## Pourquoi ce dépôt est public
Ce dépôt est une version **open‑source pour audit/transparence** (école/étudiants) et pour montrer la provenance des données.

Le déploiement (site en production) est géré séparément ; ce dépôt public sert surtout à :
- montrer le code côté client
- montrer comment les données sont générées à partir des PDF officiels

## Provenance des données (PDF → JSON)
Ce dépôt **n’inclut pas** les PDF (licence / redistribution).  
Pour vérifier la provenance, voir `PDF_SOURCE.md`.

### Vérification reproductible (recommandé)
1) Mettre les PDF officiels dans le dossier `pdf/` (local, non versionné).
2) Lancer :

```bash
npm install
npm run verify:data
```

Si la commande affiche **OK ✅**, les fichiers générés à partir des PDF correspondent aux checksums commités dans `provenance/checksums.json`.

## Lancer localement (optionnel)
```bash
npm install
npm run dev
```

