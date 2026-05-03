const fs = require("fs")
const path = require("path")
const pdf = require("pdf-parse")

const pdfFolder = path.join(process.cwd(), "pdf")

const dayMap = {
  Lun: "Mon",
  Mar: "Tue",
  Mer: "Wed",
  Jeu: "Thu",
  Ven: "Fri",
  Sam: "Sat",
  Dim: "Sun",
}

const MONTHS_FR = {
  janvier: 1,
  février: 2,
  mars: 3,
  avril: 4,
  mai: 5,
  juin: 6,
  juillet: 7,
  août: 8,
  septembre: 9,
  octobre: 10,
  novembre: 11,
  décembre: 12,
}

function parseFrenchDatesLine(line) {
  const trimmed = line.trim()
  const re =
    /(\d{1,2})\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+(\d{4})/gi
  const out = []
  let m
  while ((m = re.exec(trimmed)) !== null) {
    const day = parseInt(m[1], 10)
    const month = MONTHS_FR[m[2].toLowerCase()]
    const year = parseInt(m[3], 10)
    if (month && day >= 1 && day <= 31) {
      const yy = String(year)
      const mm = String(month).padStart(2, "0")
      const dd = String(day).padStart(2, "0")
      out.push(`${yy}-${mm}-${dd}`)
    }
  }
  return [...new Set(out)]
}

const DAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
function getDayOfWeekFromDateStr(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number)
  const date = new Date(y, m - 1, d)
  return DAYS_EN[date.getDay()]
}

const SKIP_WORDS = new Set([
  "Lun",
  "Mar",
  "Mer",
  "Jeu",
  "Ven",
  "Sam",
  "Dim",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
])

function isValidExtractedName(s) {
  if (!s || s.length <= 2) return false
  const t = s.trim()
  if (/^[A-Za-z\u00C0-\u024F]\.$/.test(t)) return false
  if (/^[A-Za-z\u00C0-\u024F][a-z]?\.\s*[A-Za-z\u00C0-\u024F]\s*$/.test(t))
    return false
  if (/^[A-Za-z\u00C0-\u024F][a-z]?\.\s*[A-Za-z\u00C0-\u024F]\s*\/\s*/.test(t))
    return false
  if (/^[A-Za-z\u00C0-\u024F]\.(\s*[A-Za-z\u00C0-\u024F]\.)*\s*$/.test(t))
    return false
  return true
}

function cleanEnseignant(s) {
  if (!s || !s.trim()) return null
  const parts = s
    .split(/\s*\/\s*/)
    .map((p) => p.trim())
    .filter(Boolean)
  const valid = parts.filter((p) => isValidExtractedName(p))
  if (valid.length === 0) return null
  return valid.join(" / ")
}

function extractEnseignant(line, room) {
  const roomIdx = line.indexOf(room)
  let afterRoom = roomIdx !== -1 ? line.slice(roomIdx + room.length).trim() : ""
  afterRoom = afterRoom
    .replace(/\s+[A-Z]{3}\d{3}\s*.*$/, "")
    .replace(/\d{4,}.*$/, "")
    .trim()

  const INITIAL = "[A-Za-z\u00C0-\u024F][a-z]?"
  const NOM_PART = "[A-Za-z\\u00C0-\\u024F]+(?:[-'’][A-Za-z\\u00C0-\\u024F]+)*"
  const NOM = `${NOM_PART}(?:\\s+${NOM_PART})*`

  const multiNames = afterRoom.match(
    new RegExp(
      `^((?:[A-Za-z\\u00C0-\\u024F]\\.(?:\\s*[A-Za-z\\u00C0-\\u024F]\\.)*\\s*${NOM_PART}(?:\\s+${NOM_PART})*)(?:\\s*\\/\\s*[A-Za-z\\u00C0-\\u024F]\\.(?:\\s*[A-Za-z\\u00C0-\\u024F]\\.)*\\s*${NOM_PART}(?:\\s+${NOM_PART})*)*)`
    )
  )
  if (multiNames) {
    const parts = multiNames[1]
      .split(/\s*\/\s*/)
      .map((p) => p.trim())
      .filter(Boolean)
    const valid = parts.filter((p) => isValidExtractedName(p))
    if (valid.length) return valid.join(" / ")
  }

  const multiInitial = afterRoom.match(
    new RegExp(
      `^([A-Za-z\\u00C0-\\u024F]\\.(?:\\s*[A-Za-z\\u00C0-\\u024F]\\.)*\\s*${NOM})`
    )
  )
  if (multiInitial) {
    const s = multiInitial[1].trim()
    if (isValidExtractedName(s)) return s
  }

  const initialName = afterRoom.match(
    new RegExp(
      "^(" +
        INITIAL +
        "\\.\\s*" +
        NOM +
        "(?:\\s*\\/\\s*" +
        INITIAL +
        "\\.\\s*" +
        NOM +
        ")*)"
    )
  )
  if (initialName) {
    const s = initialName[1].trim()
    if (isValidExtractedName(s)) return s
  }

  const nameCommaInitial = afterRoom.match(
    /^([A-Za-z\u00C0-\u024F]+(?:\s+[A-Za-z\u00C0-\u024F]+)*\s*,\s*[A-Za-z\u00C0-\u024F][a-z]?\.?)(?:\s|$)/
  )
  if (nameCommaInitial) {
    const s = nameCommaInitial[1].trim()
    if (isValidExtractedName(s)) return s
  }

  const looseInitial = afterRoom.match(
    /([A-Za-z\u00C0-\u024F][a-z]?\.\s*[A-Za-z\u00C0-\u024F][A-Za-z\u00C0-\u024F\s\.\-\/'’]*?)(?:\s{2,}|$)/
  )
  if (looseInitial) {
    const s = looseInitial[1].trim()
    if (isValidExtractedName(s)) return s
  }

  const words = afterRoom.split(/\s+/).filter((w) => w.length > 0)
  const nameWords = []
  for (const w of words) {
    const clean = w.replace(/[,.\/]/g, "")
    if (/^\d+$/.test(clean) || /^\d{1,2}:\d{2}$/.test(clean) || /^[A-Z]{3}\d{3}$/.test(clean))
      break
    if (SKIP_WORDS.has(w)) break
    if (!/^[A-Za-z\u00C0-\u024F\.\-\/'’]+$/.test(clean)) break
    nameWords.push(w)
    if (nameWords.length >= 6) break
  }
  if (nameWords.length >= 1) {
    const candidate = nameWords.join(" ").trim()
    if (candidate.length >= 2 && isValidExtractedName(candidate)) return candidate
  }

  const anywhereMulti = line.match(
    /([A-Za-z\u00C0-\u024F]\.(?:\s*[A-Za-z\u00C0-\u024F]\.)*\s*[A-Za-z\u00C0-\u024F]+(?:[-'’][A-Za-z\u00C0-\u024F]+)*(?:\s+[A-Za-z\u00C0-\u024F]+(?:[-'’][A-Za-z\u00C0-\u024F]+)*)*)/
  )
  if (anywhereMulti) {
    const s = anywhereMulti[1].trim()
    if (!/[A-Z]{3}\d{3}/.test(s) && isValidExtractedName(s)) return s
  }
  const anywhere = line.match(
    /([A-Za-z\u00C0-\u024F][a-z]?\.\s*[A-Za-z\u00C0-\u024F]+(?:[-'’][A-Za-z\u00C0-\u024F]+)*(?:\s+[A-Za-z\u00C0-\u024F]+(?:[-'’][A-Za-z\u00C0-\u024F]+)*)*)/
  )
  if (anywhere) {
    const s = anywhere[1].trim()
    if (!/[A-Z]{3}\d{3}/.test(s) && isValidExtractedName(s)) return s
  }

  return null
}

async function readPDF(filePath) {
  const buffer = fs.readFileSync(filePath)
  const data = await pdf(buffer)
  const lines = data.text.split("\n")

  const schedule = []
  const courseTitles = {}
  const fixedDateSeen = new Set()

  function stripPrealableFromTitle(t) {
    return t.replace(/\s*[A-Z]{3}\d{3}\s*$/, "").replace(/\s+/g, " ").trim()
  }

  function looksLikeCourseGroupOrExamLine(after) {
    const a = (after || "").trim().replace(/^(?:[-–—‑‐]\s*)+/, "")
    if (/^\d{1,3}\s*(?::|\b)/.test(a)) return true
    return false
  }

  function looksLikeTitleContinuation(nextLine) {
    const n = (nextLine || "").trim()
    if (!n) return false
    if (/^[A-Z]{3}\d{3}\b/.test(n)) return false
    if (/^(Lun|Mar|Mer|Jeu|Ven|Sam|Dim)\b/.test(n)) return false
    if (/^\d{1,2}:\d{2}/.test(n) || /\d{1,2}h\d{2}/.test(n)) return false
    if (/^Dates?\s*:/i.test(n)) return false
    if (/^Veuillez\s+noter/i.test(n)) return false
    if (/^COURSGR/i.test(n)) return false
    return /^[A-Za-z\u00C0-\u024F][A-Za-z\u00C0-\u024F\s'’\-]+$/.test(n)
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()
    const next = lines[i + 1] || ""

    const withDash = trimmed.match(/^([A-Z]{3}\d{3})\s*[-–—]\s*(.+)$/)
    if (withDash) {
      const code = withDash[1]
      let after = withDash[2].trim()
      if (looksLikeCourseGroupOrExamLine(after)) continue
      if (/^et\s/i.test(after) || /^[A-Z]{3}\d{3}(\s|$|et)/i.test(after)) continue
      if (looksLikeTitleContinuation(next) && (after.endsWith(" ") || /POUR\s+LES$/i.test(after))) {
        after = `${after} ${next.trim()}`
      }
      const title = stripPrealableFromTitle(after)
      if (title.length > 1 && !/^\d{2}:\d{2}/.test(title)) {
        if (
          !courseTitles[code] ||
          (courseTitles[code].length < title.length && !looksLikeCourseGroupOrExamLine(courseTitles[code]))
        ) {
          courseTitles[code] = title
        }
      }
      continue
    }

    const noDash = trimmed.match(/^([A-Z]{3}\d{3})\s+([A-Za-z\u00C0-\u024F].+)$/)
    if (noDash) {
      const code = noDash[1]
      let after = noDash[2].trim()
      if (/^et\s/i.test(after) || /^[A-Z]{3}\d{3}(\s|$|et)/i.test(after)) continue
      if (looksLikeTitleContinuation(next) && (after.endsWith(" ") || /POUR\s+LES$/i.test(after))) {
        after = `${after} ${next.trim()}`
      }
      const title = stripPrealableFromTitle(after)
      if (!/^(Lun|Mar|Mer|Jeu|Ven|Sam|Dim)\s/i.test(title) && !/^\d{2}:\d{2}/.test(title) && title.length > 2) {
        if (
          !courseTitles[code] ||
          (courseTitles[code].length < title.length && !looksLikeCourseGroupOrExamLine(courseTitles[code]))
        ) {
          courseTitles[code] = title
        }
      }
    }
  }

  let currentCourse = null
  let lastEnseignant = null
  let pendingSessions = []
  let pendingDates = []

  function flushSessionsAsWeekly() {
    pendingSessions.forEach((pending) => {
      const { day, start, end, rooms, activite, enseignant, courseTitle } = pending
      rooms.forEach((room) => {
        schedule.push({
          room,
          course: pending.course,
          day,
          start,
          end,
          ...(activite && { activite }),
          ...(enseignant && { enseignant }),
          ...(courseTitle && { courseTitle }),
        })
      })
    })
    pendingSessions = []
  }

  function flushSessionsWithDates() {
    const allDates = [...new Set(pendingDates)]
    if (allDates.length === 0) return
    const matching = pendingSessions.filter((s) => allDates.some((d) => getDayOfWeekFromDateStr(d) === s.day))
    const rest = pendingSessions.filter((s) => !allDates.some((d) => getDayOfWeekFromDateStr(d) === s.day))
    matching.forEach((pending) => {
      const { day, start, end, rooms, activite, enseignant, courseTitle } = pending
      const datesForThisDay = allDates.filter((dateStr) => getDayOfWeekFromDateStr(dateStr) === day)
      datesForThisDay.forEach((dateStr) => {
        rooms.forEach((room) => {
          schedule.push({
            room,
            course: pending.course,
            day,
            start,
            end,
            date: dateStr,
            ...(activite && { activite }),
            ...(enseignant && { enseignant }),
            ...(courseTitle && { courseTitle }),
          })
        })
      })
    })
    rest.forEach((pending) => {
      const { day, start, end, rooms, activite, enseignant, courseTitle } = pending
      rooms.forEach((room) => {
        schedule.push({
          room,
          course: pending.course,
          day,
          start,
          end,
          ...(activite && { activite }),
          ...(enseignant && { enseignant }),
          ...(courseTitle && { courseTitle }),
        })
      })
    })
    pendingSessions = []
    pendingDates = []
  }

  lines.forEach((line, idx) => {
    const trimmed = line.trim()
    const nextLine = lines[idx + 1] || ""
    const isScheduleLine = line.match(/(Lun|Mar|Mer|Jeu|Ven|Sam|Dim)(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/)
    const frenchDates = parseFrenchDatesLine(line)
    const isDateOnlyLine =
      frenchDates.length > 0 &&
      !isScheduleLine &&
      !/^[A-Z]{3}\d{3}\s/.test(trimmed) &&
      !/\s+au\s+/i.test(trimmed) &&
      !/abandon|remboursement/i.test(trimmed)

    if (currentCourse) {
      const fixedDate = frenchDates[0]
      if (fixedDate && /\bSalle\b/i.test(line)) {
        const hm = [...line.matchAll(/(\d{1,2})h(\d{2})/g)].map((m) => ({
          h: Number(m[1]),
          m: Number(m[2]),
        }))
        if (hm.length >= 2) {
          const start = `${String(hm[0].h).padStart(2, "0")}:${String(hm[0].m).padStart(2, "0")}`
          const end = `${String(hm[1].h).padStart(2, "0")}:${String(hm[1].m).padStart(2, "0")}`
          const roomPattern = /[A-Z]-\d{3,4}[A-Z]?/g
          const roomList = []
          let rm
          while ((rm = roomPattern.exec(line)) !== null) {
            roomList.push(rm[0])
          }
          const rooms = [...new Set(roomList)]
          if (rooms.length > 0) {
            if (pendingSessions.length > 0) {
              if (pendingDates.length > 0) flushSessionsWithDates()
              else flushSessionsAsWeekly()
            }
            const day = getDayOfWeekFromDateStr(fixedDate)
            rooms.forEach((room) => {
              const key = `${currentCourse}|${room}|${fixedDate}|${start}|${end}`
              if (fixedDateSeen.has(key)) return
              fixedDateSeen.add(key)
              schedule.push({
                room,
                course: currentCourse,
                day,
                start,
                end,
                date: fixedDate,
                courseTitle: courseTitles[currentCourse] || null,
              })
            })
          }
        }
      }
    }

    if (isDateOnlyLine) {
      if (pendingSessions.length > 0) {
        pendingDates = pendingDates.concat(frenchDates)
      }
      return
    }

    const leftmostSigle = trimmed.match(/^([A-Z]{3}\d{3})\s*(.*)$/s)
    if (leftmostSigle) {
      const code = leftmostSigle[1]
      const rest = leftmostSigle[2].trim()
      const restNoDash = rest.replace(/^(?:[-–—‑‐]\s*)+/, "")
      if (!looksLikeCourseGroupOrExamLine(restNoDash)) {
        const isPrealableLine = /^et\s/i.test(rest) || /^[A-Z]{3}\d{3}(\s|$|et)/i.test(rest)
        const isCourseHeader =
          !isPrealableLine &&
          (/^[-–—]/.test(rest) || (/^[A-Za-z\u00C0-\u024F]/.test(rest) && !/^\d{2}:\d{2}/.test(rest)))
        if (isCourseHeader) {
          if (pendingSessions.length > 0) {
            if (pendingDates.length > 0) flushSessionsWithDates()
            else flushSessionsAsWeekly()
          }
          pendingDates = []
          currentCourse = code
          const titleMatch = rest.match(/^[-–—]?\s*(.+)$/)
          if (titleMatch) {
            let rawTitle = titleMatch[1]
            if (looksLikeTitleContinuation(nextLine) && (/POUR\s+LES$/i.test(rawTitle.trim()) || /\s$/.test(rawTitle))) {
              rawTitle = `${rawTitle} ${nextLine.trim()}`
            }
            let t = stripPrealableFromTitle(rawTitle)
            if (t.length > 1 && !/^\d{2}:\d{2}/.test(t)) {
              if (
                !courseTitles[currentCourse] ||
                (courseTitles[currentCourse].length < t.length && !looksLikeCourseGroupOrExamLine(courseTitles[currentCourse]))
              ) {
                courseTitles[currentCourse] = t
              }
            }
          }
          lastEnseignant = null
        }
      }
    }

    if (isScheduleLine) {
      const match = isScheduleLine
      const day = dayMap[match[1]]
      const start = match[2]
      const end = match[3]

      const roomPattern = /[A-Z]-\d{3,4}[A-Z]?/g
      const roomList = []
      let m
      while ((m = roomPattern.exec(line)) !== null) {
        let rm = m[0]
        if (/[A-Z]$/.test(rm) && line[m.index + rm.length] === ".") rm = rm.slice(0, -1)
        roomList.push(rm)
      }
      const rooms = [...new Set(roomList)]
      if (rooms.length === 0) return

      if (!currentCourse) return
      const course = currentCourse

      const endTimeIdx = line.indexOf(match[3]) + match[3].length
      const firstRoomIdx = line.indexOf(rooms[0])
      let activite = null
      if (firstRoomIdx > endTimeIdx) {
        const between = line.slice(endTimeIdx, firstRoomIdx)
        if (/\bLabo\b/i.test(between)) activite = "Labo"
        else if (/\bTP\b/.test(between)) activite = "TP"
        else if (/\bC\b/.test(between)) activite = "C"
      }

      let enseignant = extractEnseignant(line, rooms[rooms.length - 1])
      if (!enseignant && rooms.length > 1) enseignant = extractEnseignant(line, rooms[0])
      enseignant = cleanEnseignant(enseignant || "") || null
      if (enseignant) lastEnseignant = enseignant
      else if (lastEnseignant) enseignant = lastEnseignant

      if (pendingSessions.length > 0 && pendingDates.length > 0) {
        flushSessionsWithDates()
      }
      pendingSessions.push({
        course,
        day,
        start,
        end,
        rooms,
        activite,
        enseignant,
        courseTitle: courseTitles[course] || null,
      })
    }
  })

  if (pendingSessions.length > 0) {
    if (pendingDates.length > 0) flushSessionsWithDates()
    else flushSessionsAsWeekly()
  }

  return { schedule, courseTitles }
}

async function run() {
  const outputDir =
    process.env.ETS_OUTPUT_DIR?.trim() || path.join(process.cwd(), "public")

  if (!fs.existsSync(pdfFolder)) {
    throw new Error('Missing "pdf/" folder. See PDF_SOURCE.md')
  }

  const files = fs.readdirSync(pdfFolder).filter((f) => f.toLowerCase().endsWith(".pdf"))
  if (files.length === 0) {
    throw new Error('No PDF found in "pdf/". See PDF_SOURCE.md')
  }

  let allSchedules = []
  const allCourseTitles = {}

  for (const file of files) {
    console.log("Reading:", file)
    const { schedule, courseTitles } = await readPDF(path.join(pdfFolder, file))
    allSchedules = [...allSchedules, ...schedule]
    Object.assign(allCourseTitles, courseTitles)
  }

  allSchedules = allSchedules.map((e) => ({
    ...e,
    courseTitle: allCourseTitles[e.course] || e.courseTitle || "",
  }))

  fs.mkdirSync(outputDir, { recursive: true })

  const outputPath = path.join(outputDir, "schedule.json")
  fs.writeFileSync(outputPath, JSON.stringify(allSchedules, null, 2))
  console.log("schedule.json created")

  const coursesPath = path.join(outputDir, "courses.json")
  const coursesList = Object.entries(allCourseTitles).map(([code, title]) => ({ code, title }))
  fs.writeFileSync(coursesPath, JSON.stringify(coursesList, null, 2))
  console.log("courses.json created", coursesList.length, "courses")

  const enseignants = allSchedules
    .filter((e) => e.enseignant)
    .map(({ room, course, day, start, end, enseignant, date }) => ({
      room,
      course,
      day,
      start,
      end,
      enseignant,
      ...(date && { date }),
    }))
  const enseignantsPath = path.join(outputDir, "enseignants.json")
  fs.writeFileSync(enseignantsPath, JSON.stringify(enseignants, null, 2))
  console.log("enseignants.json created", enseignants.length, "entries")

  const rooms = [
    ...new Set(
      allSchedules
        .map((e) => e.room)
        .filter((r) => typeof r === "string" && r.trim().length > 0)
        .map((r) => r.trim())
    ),
  ].sort((a, b) => a.localeCompare(b, "fr"))
  const roomsPath = path.join(outputDir, "rooms.json")
  fs.writeFileSync(roomsPath, JSON.stringify(rooms, null, 2))
  console.log("rooms.json created", rooms.length, "rooms")
}

module.exports = { readPDF, run }

if (require.main === module) {
  run().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}

