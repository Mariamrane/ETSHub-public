const fs = require("fs")
const path = require("path")
const crypto = require("crypto")

const { run } = require("./parseScheduleFull")

function sha256File(filePath) {
  const buf = fs.readFileSync(filePath)
  return crypto.createHash("sha256").update(buf).digest("hex")
}

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true })
}

function rimraf(p) {
  if (!fs.existsSync(p)) return
  fs.rmSync(p, { recursive: true, force: true })
}

async function main() {
  // Force "pure PDF" output for audit: no manual overrides in this public repo.
  process.env.ETS_APPLY_OVERRIDES = "0"

  // 1) Generate JSON from local PDF(s) into a temp folder (keeps repo clean)
  const tmpDir = path.join(process.cwd(), ".tmp-provenance")
  rimraf(tmpDir)
  ensureDir(tmpDir)
  process.env.ETS_OUTPUT_DIR = tmpDir
  await run()

  // 2) Compare checksums with committed references
  const refPath = path.join(process.cwd(), "provenance", "checksums.json")
  const ref = JSON.parse(fs.readFileSync(refPath, "utf8"))

  const results = {}
  const mismatches = []

  for (const rel of Object.keys(ref.files)) {
    const filename = path.basename(rel)
    const abs = path.join(tmpDir, filename)
    if (!fs.existsSync(abs)) {
      mismatches.push({ file: rel, error: "missing output file" })
      continue
    }
    const sum = sha256File(abs)
    results[rel] = sum
    const expected = (ref.files[rel] || "").trim()
    if (expected && sum !== expected) {
      mismatches.push({ file: rel, expected, got: sum })
    }
    if (!expected) {
      mismatches.push({ file: rel, error: "no reference checksum committed yet" })
    }
  }

  if (mismatches.length > 0) {
    console.error("\nData provenance verification failed.\n")
    console.error("Mismatches / issues:")
    for (const m of mismatches) {
      console.error(" -", JSON.stringify(m))
    }
    console.error("\nComputed checksums:")
    console.error(JSON.stringify({ algorithm: "sha256", files: results }, null, 2))
    console.error("\nIf you are the maintainer: update provenance/checksums.json with the computed checksums.\n")
    rimraf(tmpDir)
    process.exit(1)
  }

  console.log("\nOK ✅ Data matches the committed PDF-derived checksums.\n")
  rimraf(tmpDir)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

