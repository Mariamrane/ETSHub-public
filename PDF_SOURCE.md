# Data provenance (PDF → JSON)

This repository does **not** include the PDF files (licensing / redistribution).

## Where the data comes from

The `public/*.json` files are generated from the official timetable PDF(s).

## How to verify locally

1. Create a local folder `pdf/` at the repo root (it is gitignored).
2. Put the official PDF(s) in `pdf/` (any filename ending with `.pdf`).
3. Install dependencies and run verification:

```bash
npm install
npm run verify:data
```

`npm run verify:data` regenerates JSON from the PDF(s) **without manual overrides** and compares SHA-256 checksums against the committed reference checksums.

