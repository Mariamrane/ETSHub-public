"use client"

import { useEffect,useState,useRef,useMemo,useTransition } from "react"
// Formulaire « Nous contacter » : envoi via /api/contact (Resend). Sur Vercel : ajouter RESEND_API_KEY — voir CONTACT_SETUP.md

/** Profil Discord (section À propos) */
const DISCORD_USER_ID = "1412217726402826290"

const TRANSLATIONS: Record<string,{ fr: string; en: string }> = {
  session: { fr: "Session", en: "Session" },
  freeRoomsLive: { fr: "Salles de cours/Labs", en: "Classrooms/Labs" },
  searchRoom: { fr: "Rechercher une salle", en: "Search a room" },
  allPavilions: { fr: "Tous les pavillons", en: "All pavilions" },
  pavilion: { fr: "Pavillon", en: "Pavilion" },
  live: { fr: "LIVE", en: "LIVE" },
  liveOff: { fr: "LIVE (off)", en: "LIVE (off)" },
  freeAllDay: { fr: "Salles vides toute la journée", en: "Rooms empty all day" },
  freeRestOfDay: { fr: "Salles vides pour le restant de la journée", en: "Rooms free for the rest of the day" },
  reset: { fr: "Réinitialiser", en: "Reset" },
  free: { fr: "LIBRE", en: "FREE" },
  occupied: { fr: "OCCUPÉE", en: "OCCUPIED" },
  closed: { fr: "FERMÉ", en: "CLOSED" },
  nextCourse: { fr: "Prochain C/TP", en: "Next C/TP" },
  nextTP: { fr: "Prochain C/TP", en: "Next C/TP" },
  nextLabo: { fr: "Prochain C/TP", en: "Next C/TP" },
  nextAvailability: { fr: "Prochaine disponibilité", en: "Next availability" },
  roomSchedule: { fr: "Horaire de la salle", en: "Room schedule" },
  pause: { fr: "Pause", en: "Pause" },
  course: { fr: "Cours", en: "Course" },
  courses: { fr: "Cours", en: "Courses" },
  /* \n = retour mobile propre sur 2 lignes (voir .quickOptionTwoLines) */
  coursesAndTeachers: { fr: "Cours et\nEnseignants", en: "Courses and\nTeachers" },
  courseSearch: { fr: "Recherche cours", en: "Course search" },
  teachers: { fr: "Enseignants", en: "Teachers" },
  viewCourses: { fr: "Trouver des cours", en: "Find courses" },
  viewProfs: { fr: "Trouver des enseignants", en: "Find teachers" },
  viewAll: { fr: "Tout", en: "All" },
  viewLabs: { fr: "Labs", en: "Labs" },
  viewClassrooms: { fr: "Salles de cours", en: "Classrooms" },
  roomType: { fr: "Type de local", en: "Room type" },
  viewWorkRooms: { fr: "Salles de travail", en: "Work rooms" },
  workRoomsIntro: { fr: "Salles de travail accessibles en tout temps. Premier arrivé, premier servi.", en: "Work rooms available at all times. First come, first served." },
  accessRestricted: { fr: "Accès limité", en: "Limited access" },
  searchTeacher: { fr: "Rechercher un enseignant", en: "Search a teacher" },
  teacherSchedule: { fr: "Horaire de", en: "Schedule of" },
  noCourseThisDay: { fr: "Aucun cours trouvé pour cette journée.", en: "No course found for this day." },
  weekSchedule: { fr: "Horaire de la semaine", en: "Week schedule" },
  profHourRoom: { fr: "Prof, horaire, local", en: "Prof, time, room" },
  close: { fr: "Fermer", en: "Close" },
  clear: { fr: "Effacer la recherche", en: "Clear search" },
  noCourse: { fr: "Aucun cours", en: "No course" },
  today: { fr: "Aujourd'hui", en: "Today" },
  tomorrow: { fr: "Demain", en: "Tomorrow" },
  freeRoomsNow: { fr: "salles libres maintenant", en: "free rooms now" },
  roomsStatFree: { fr: "salles libres", en: "free rooms" },
  roomsStatOccupied: { fr: "occupées", en: "occupied" },
  roomsStatClosed: { fr: "fermées", en: "closed" },
  densityLive: { fr: "Live", en: "Live" },
  attributionCopy: { fr: "Copier", en: "Copy" },
  attributionProject: { fr: "Projet étudiant indépendant pour la communauté de l'ÉTS.", en: "Independent student project for the ÉTS community." },
  attributionDisclaimer: { fr: "Non affilié officiellement à l'ÉTS.", en: "Not officially affiliated with ÉTS." },
  attributionDisclaimerFull: { fr: "Non affilié officiellement à l'École de technologie supérieure.", en: "Not officially affiliated with École de technologie supérieure." },
  about: { fr: "À propos", en: "About" },
  contactUs: { fr: "Nous contacter", en: "Contact us" },
  contactName: { fr: "Nom", en: "Name" },
  contactEmail: { fr: "Courriel", en: "Email" },
  contactPhone: { fr: "Téléphone", en: "Phone" },
  contactMessage: { fr: "Questions ou suggestions", en: "Questions or suggestions" },
  contactSend: { fr: "Envoyer", en: "Send" },
  contactSuccess: { fr: "Nous vous remercions pour votre message. Nous vous répondrons dans les plus brefs délais.", en: "Thank you for your message. We will get back to you as soon as possible." },
  contactSendAnother: { fr: "Envoyer un autre message", en: "Send another message" },
  loading: { fr: "Chargement…", en: "Loading…" },
  contactErrorShort: { fr: "L’envoi a échoué. Réessayez.", en: "Send failed. Please try again." },
  contactServiceNotConfigured: {
    fr: "Le service d’envoi n’est pas configuré. Ajoutez RESEND_API_KEY dans les variables d’environnement (Vercel → Settings → Environment Variables). Voir CONTACT_SETUP.md.",
    en: "Email service not configured. Add RESEND_API_KEY in your host’s environment variables (Vercel → Settings → Environment Variables). See CONTACT_SETUP.md.",
  },
  tagline: { fr: "Salles, cours et horaires", en: "Rooms, courses & schedules" },
  sessionStartsNotice: {
    fr: "Les horaires d’été 2026 s’appliquent à partir du {date}. Avant cette date, toutes les salles sont affichées comme libres.",
    en: "Summer 2026 schedules start on {date}. Before that date, all rooms are shown as free.",
  },
}

const EMAIL_DOMAIN_SUGGESTIONS = [
  "@ens.etsmtl.ca",
  "@etsmtl.ca",
]

// Salles/labs à afficher comme "LAB" à côté de LIBRE / OCCUPÉE
const LAB_ROOMS = new Set<string>([
  "B-2626",
  "B-2622",
  "B-2624",
  "B-2404",
  "B-2406",
  "B-2408",
  "B-2608",
  "B-2606",
  "B-1656",
  "F-2014",
  "F-2009",
  "F-2010",
  "F-2012",
  "F-2016",
])

// Pavillon B : labs avec accès limité
const B_ACCESS_LIMITED_ROOMS = new Set<string>([
  "B-2626",
  "B-2622",
  "B-2404",
  "B-2406",
  "B-2408",
  "B-2608",
  "B-2606",
  "B-1656",
])

// Exception pavillon F : ne pas afficher "Accès limité" pour ces locaux
const F_ACCESS_LIMITED_EXCEPTIONS = new Set<string>([
  "F-2040",
  "F-3009",
  "F-3016",
  "F-3010",
  "F-3046",
  "F-3040",
  "F-3042",
  "F-5009",
  "F-2054",
])

// Locaux pavillon F : afficher "Salle de cours" même s'ils ont "Accès limité"
const F_COURSE_FLAG_ADDITIONAL = new Set<string>([
  "F-3064",
  "F-3060",
])

// Pavillon A : salles à forcer en LAB
const A_FORCED_LAB_ROOMS = new Set<string>([
  "A-1560",
  "A-1504",
  "A-2220",
  "A-3340",
  "A-3240",
])

function isLabRoomCode(roomCode: string){
  return LAB_ROOMS.has(roomCode)
}

function isClassroomRoomCode(roomCode: string){
  return (
    (roomCode.startsWith("F-") && (F_ACCESS_LIMITED_EXCEPTIONS.has(roomCode) || F_COURSE_FLAG_ADDITIONAL.has(roomCode))) ||
    (roomCode.startsWith("B-") && !LAB_ROOMS.has(roomCode)) ||
    roomCode.startsWith("E-") ||
    roomCode.startsWith("D-")
  )
}

const WORK_ROOMS = new Set<string>([
  "D-4030",
  "D-4029",
  "D-5028",
  "D-5029",
  "B-1104",
  "B-1106",
  "F-4030",
  "F-4028",
  "F-4020",
  "F-4018",
  "F-4014",
  "F-4016",
  "F-1024",
  "F-1026",
  "F-1028",
])

const WORK_ROOM_META: Record<string, { descFr: string[]; descEn: string[]; accessLimited?: boolean }> = {
  "D-4030": {
    descFr: ["Capacité : 4 à 6 personnes", "Salle vitrée sans porte", "Banc détente"],
    descEn: ["Capacity: 4–6 people", "Glassed room, no door", "Bench for relaxing"],
  },
  "D-4029": {
    descFr: ["Capacité : 4 à 6 personnes", "Salle vitrée sans porte", "Banc détente"],
    descEn: ["Capacity: 4–6 people", "Glassed room, no door", "Bench for relaxing"],
  },
  "D-5028": {
    descFr: ["Capacité : 4 à 6 personnes", "Salle vitrée sans porte", "Banc détente"],
    descEn: ["Capacity: 4–6 people", "Glassed room, no door", "Bench for relaxing"],
  },
  "D-5029": {
    descFr: ["Capacité : 4 à 6 personnes", "Salle vitrée sans porte", "Banc détente"],
    descEn: ["Capacity: 4–6 people", "Glassed room, no door", "Bench for relaxing"],
  },
  "B-1104": {
    descFr: ["Capacité : 4 personnes", "Salle avec porte"],
    descEn: ["Capacity: 4 people", "Room with a door"],
  },
  "B-1106": {
    descFr: ["Capacité : 4 personnes", "Salle avec porte"],
    descEn: ["Capacity: 4 people", "Room with a door"],
  },
  "F-4030": {
    descFr: ["Capacité : 4 à 6 personnes", "Salle avec porte"],
    descEn: ["Capacity: 4–6 people", "Room with a door"],
    accessLimited: true,
  },
  "F-4028": {
    descFr: ["Capacité : 4 à 6 personnes", "Salle avec porte"],
    descEn: ["Capacity: 4–6 people", "Room with a door"],
    accessLimited: true,
  },
  "F-4020": {
    descFr: ["Capacité : 8 personnes", "Salle avec porte"],
    descEn: ["Capacity: 8 people", "Room with a door"],
  },
  "F-4018": {
    descFr: ["Capacité : 8 personnes", "Salle avec porte"],
    descEn: ["Capacity: 8 people", "Room with a door"],
  },
  "F-4014": {
    descFr: ["Capacité : 4 personnes", "Salle avec porte"],
    descEn: ["Capacity: 4 people", "Room with a door"],
  },
  "F-4016": {
    descFr: ["Capacité : 4 personnes", "Salle avec porte"],
    descEn: ["Capacity: 4 people", "Room with a door"],
  },
  "F-1024": {
    descFr: ["Capacité : 4 personnes", "Salle vitrée avec porte"],
    descEn: ["Capacity: 4 people", "Glassed room with a door"],
  },
  "F-1026": {
    descFr: ["Capacité : 4 personnes", "Salle vitrée avec porte"],
    descEn: ["Capacity: 4 people", "Glassed room with a door"],
  },
  "F-1028": {
    descFr: ["Capacité : 4 personnes", "Salle vitrée avec porte"],
    descEn: ["Capacity: 4 people", "Glassed room with a door"],
  },
}

export default function Home(){

const [theme,setTheme]=useState("dark")
const [lang,setLang]=useState<"fr"|"en">("fr")
const t=(key:string)=>TRANSLATIONS[key]?.[lang] ?? key

const [rooms,setRooms]=useState<string[]>([])
const [schedule,setSchedule]=useState<any[]>([])

const [search,setSearch]=useState("")
const [building,setBuilding]=useState("Tous")
const [roomTypeFilter,setRoomTypeFilter]=useState<"all"|"labs"|"classrooms">("all")
const [searchFocused,setSearchFocused]=useState(false)
const [showOnlyFreeAllDay,setShowOnlyFreeAllDay]=useState(false)
const [showOnlyFreeRestOfDay,setShowOnlyFreeRestOfDay]=useState(false)
const [openWeekRoom,setOpenWeekRoom]=useState<string|null>(null)
const [profSearch,setProfSearch]=useState("")
const [profSearchFocused,setProfSearchFocused]=useState(false)
const [selectedProfName,setSelectedProfName]=useState<string|null>(null)
const [openProfSchedule,setOpenProfSchedule]=useState<string|null>(null)
const [courseSearch,setCourseSearch]=useState("")
const [courseSearchFocused,setCourseSearchFocused]=useState(false)
const [selectedCourse,setSelectedCourse]=useState<string|null>(null)
const [openCourseSchedule,setOpenCourseSchedule]=useState<string|null>(null)

const [date,setDate]=useState("")
const [time,setTime]=useState("")
const [isLive,setIsLive]=useState(true)
const [liveNow,setLiveNow]=useState<Date>(new Date())
const [activeQuickView,setActiveQuickView]=useState<"rooms"|"coursesAndEnseignants"|"workRooms">("rooms")
const [isPending,startTransition]=useTransition()
const [coursesOrProfsView,setCoursesOrProfsView]=useState<"courses"|"profs">("courses")
const [openDropdown,setOpenDropdown]=useState<null|"date"|"time"|"building"|"roomType">(null)
const [contactName,setContactName]=useState("")
const [contactEmail,setContactEmail]=useState("")
const [contactMessage,setContactMessage]=useState("")
const [contactSent,setContactSent]=useState(false)
const [contactSending,setContactSending]=useState(false)
const [contactError,setContactError]=useState<string|null>(null)
const [showBackToTop,setShowBackToTop]=useState(false)
const searchInputRef=useRef<HTMLInputElement>(null)
const controlsRef=useRef<HTMLDivElement>(null)
const profInputRef=useRef<HTMLInputElement>(null)
const courseInputRef=useRef<HTMLInputElement>(null)
const courseSectionRef=useRef<HTMLDivElement>(null)

const coursesAndProfsData = useMemo(() => {
  const courseTitles = new Map<string, string>()
  const courseToProfs = new Map<string, Set<string>>()
  const profToCourses = new Map<string, Set<string>>()
  const profSet = new Set<string>()
  schedule.forEach((e: any) => {
    if (!e.course) return
    const title = (e.courseTitle && e.courseTitle.trim()) || courseTitles.get(e.course) || ""
    courseTitles.set(e.course, title)
    if (e.enseignant) {
      e.enseignant.split(/\s*\/\s*/).forEach((n: string) => {
        const name = n.trim()
        if (name.length > 2 && isValidProfName(name)) {
          profSet.add(name)
          const codes = profToCourses.get(name) || new Set<string>()
          codes.add(e.course)
          profToCourses.set(name, codes)
          const profs = courseToProfs.get(e.course) || new Set<string>()
          profs.add(name)
          courseToProfs.set(e.course, profs)
        }
      })
    }
  })
  const uniqueCourses = Array.from(courseTitles.entries()).map(([code, title]) => ({ code, title })).sort((a, b) => a.code.localeCompare(b.code))
  const uniqueProfs = Array.from(profSet).sort((a, b) => a.localeCompare(b))
  const getProfs = (code: string) => Array.from(courseToProfs.get(code) || []).sort((a, b) => a.localeCompare(b))
  const getCourses = (prof: string) => Array.from(profToCourses.get(prof) || []).sort()
  return { uniqueCourses, uniqueProfs, getProfs, getCourses }
}, [schedule])

// Pavillon A : flag LAB seulement si toutes les activités de la salle sont des "Labo"
const aLabOnlyRooms = useMemo(() => {
  const out = new Set<string>()
  if(!rooms.length || !schedule.length) return out
  rooms.forEach((r) => {
    if(!r.startsWith("A-")) return
    const entries = schedule.filter((e:any) => roomMatches(r, e.room))
    if(entries.length>0 && entries.every((e:any) => e.activite==="Labo")) out.add(r)
  })
  return out
}, [rooms, schedule])

useEffect(()=>{

document.body.className = theme==="light" ? "light" : ""

},[theme])

useEffect(()=>{
  const onScroll=()=> setShowBackToTop(window.scrollY > 400)
  window.addEventListener("scroll",onScroll,{ passive: true })
  onScroll()
  return ()=>window.removeEventListener("scroll",onScroll)
},[])

useEffect(()=>{
  if(!openDropdown) return
  const onDocClick=(e:MouseEvent)=>{
    if(controlsRef.current && !controlsRef.current.contains(e.target as Node)) setOpenDropdown(null)
  }
  document.addEventListener("click",onDocClick)
  return ()=>document.removeEventListener("click",onDocClick)
},[openDropdown])

useEffect(()=>{
  fetch("/rooms.json")
    .then(r=>r.json())
    .then(data=>setRooms(data))

  Promise.all([
    fetch("/schedule.json").then(r=>r.json()),
    fetch("/enseignants.json").then(r=>r.ok?r.json():[]).catch(()=>[])
  ]).then(([sched, enseignants]:[any[],any[]])=>{
    // Fusionne les enseignants sans écrasement:
    // - par local (room key)
    // - et par créneau de cours global (slot key) pour récupérer toute l'équipe.
    const teachersByRoomKey = new Map<string, Set<string>>()
    const teachersBySlotKey = new Map<string, Set<string>>()
    const addTeachers = (map: Map<string, Set<string>>, key: string, raw: string | undefined) => {
      if(!raw) return
      const names = raw
        .split(/\s*\/\s*|\s*,\s*/)
        .map((n: string) => n.trim())
        .filter(Boolean)
      if(!names.length) return
      const set = map.get(key) || new Set<string>()
      names.forEach((n: string) => set.add(n))
      map.set(key, set)
    }
    const roomKeyOf = (e:any) => `${e.room}|${e.day}|${e.start}|${e.end}|${e.course}|${e.date||""}`
    const slotKeyOf = (e:any) => `${e.day}|${e.start}|${e.end}|${e.course}|${e.date||""}`

    sched.forEach((s:any)=>{
      addTeachers(teachersByRoomKey, roomKeyOf(s), s.enseignant)
      addTeachers(teachersBySlotKey, slotKeyOf(s), s.enseignant)
    })
    if (enseignants && enseignants.length) {
      enseignants.forEach((e:any)=>{
        addTeachers(teachersByRoomKey, roomKeyOf(e), e.enseignant)
        addTeachers(teachersBySlotKey, slotKeyOf(e), e.enseignant)
      })
    }

    sched = sched.map((s:any)=>{
      const roomNames = Array.from(teachersByRoomKey.get(roomKeyOf(s)) || [])
      const slotNames = Array.from(teachersBySlotKey.get(slotKeyOf(s)) || [])
      const names = Array.from(new Set([...roomNames, ...slotNames]))
      return { ...s, enseignant: names.length ? names.join(" / ") : s.enseignant }
    })
    setSchedule(sched)
  })
},[])



function timeToMinutes(t:string){

const p=t.split(":")
return Number(p[0])*60+Number(p[1])

}

function pad2(n:number){
  return String(n).padStart(2,"0")
}

function nowDateStr(d:Date){
  return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`
}

function nowTimeStr(d:Date){
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

function nowTimeWithSecondsStr(d:Date){
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`
}

function getDayFromDateStr(dateStr:string){
  const parts=dateStr.split(/[-\/]/).map(s=>s.trim())
  let y=0,m=0,dayNum=0

  if(parts.length>=3 && parts[0].length===4){
    // YYYY-MM-DD
    y=Number(parts[0]); m=Number(parts[1]); dayNum=Number(parts[2])
  }else if(parts.length>=3 && parts[2].length===4){
    // MM/DD/YYYY (ou DD/MM/YYYY)
    y=Number(parts[2])
    const a=Number(parts[0])
    const b=Number(parts[1])
    if(a>12){
      // DD/MM/YYYY
      dayNum=a; m=b
    }else{
      // MM/DD/YYYY (par défaut)
      m=a; dayNum=b
    }
  }else{
    const parsed=new Date(dateStr)
    const days=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
    return days[parsed.getDay()] || "Mon"
  }

  const d=new Date(y,m-1,dayNum)
  const days=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
  return days[d.getDay()] || "Mon"
}

/** Retourne true si l'entrée d'horaire s'applique à la date donnée (YYYY-MM-DD). Gère les sessions à dates spécifiques (ex. certains samedis seulement). */
// Début de session: avant cette date, on considère qu'il n'y a aucun cours (toutes les salles sont libres).
// Format attendu: "YYYY-MM-DD" (comparaison lexicographique OK).
const SESSION_START_DATE =
  (process.env.NEXT_PUBLIC_SESSION_START_DATE || "").trim() || "2026-05-04"

function formatYmdForLang(ymd: string, lang: "fr" | "en") {
  // Cas principal: 2026-05-04 → "4 mai 2026" / "May 4, 2026"
  const m = ymd.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return ymd
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  try {
    return new Intl.DateTimeFormat(lang === "fr" ? "fr-CA" : "en-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(d)
  } catch {
    return ymd
  }
}

const CLOSED_DATES = new Set(
  (process.env.NEXT_PUBLIC_CLOSED_DATES || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
)
const FORCED_DAY_BY_DATE: Record<string, string> = (() => {
  const raw = (process.env.NEXT_PUBLIC_FORCED_DAY_BY_DATE || "").trim()
  if (!raw) return {}
  try {
    return JSON.parse(raw)
  } catch {
    return {}
  }
})()

function entryAppliesToDate(e:any,dateStr:string):boolean{
  if (dateStr < SESSION_START_DATE) return false
  if(CLOSED_DATES.has(dateStr)) return false
  if(e.date) return e.date===dateStr
  const dayForDate = FORCED_DAY_BY_DATE[dateStr] || getDayFromDateStr(dateStr)
  return dayForDate===e.day
}

/** True si la salle affichée (ex. F-3046) correspond à la salle du schedule (ex. F-3046 ou F-3046A). */
function roomMatches(displayRoom:string,scheduleRoom:string):boolean{
  if(displayRoom===scheduleRoom) return true
  return scheduleRoom.startsWith(displayRoom) && scheduleRoom.length > displayRoom.length
}

/** Ajoute N jours à une date YYYY-MM-DD. */
function addDaysToDateStr(dateStr:string,days:number):string{
  const parts=dateStr.split(/[-\/]/).map(s=>s.trim())
  if(parts.length<3 || parts[0].length!==4) return dateStr
  const d=new Date(Number(parts[0]),Number(parts[1])-1,Number(parts[2])+days)
  return nowDateStr(d)
}

function getOpenStartForDay(day:string){
  // Samedi & dimanche ouvrent à 07:30
  return (day==="Sat" || day==="Sun") ? "07:30" : "06:30"
}

function getNextDayLabelAndFirstEvent(room:string,currentDateStr:string,schedule:any[],isSameCalendarDayAsToday:boolean,isLive:boolean){
  const daysFr=["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"]
  for(let step=1;step<=7;step++){
    const targetDateStr=addDaysToDateStr(currentDateStr,step)
    const eventsForDay=schedule
      .filter((e:any)=>roomMatches(room,e.room) && entryAppliesToDate(e,targetDateStr))
      .sort((a:any,b:any)=>a.start.localeCompare(b.start))
    if(eventsForDay.length>0){
      const first=eventsForDay[0]
      const mergedNext = getMergedBlock(eventsForDay, 0, 15)
      const targetDay = getDayFromDateStr(targetDateStr)
      let label=daysFr[["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(targetDay)] ?? ""
      if(isLive && step===1){
        label = isSameCalendarDayAsToday ? "Demain" : "Lendemain"
      }
      return{
        label,
        course:first.course,
        activite:first.activite,
        enseignant:first.enseignant,
        start:first.start,
        end:mergedNext.end
      }
    }
  }
  return null
}

function isClosedTime(t: string, openStart: string){
  // Fermé avant l'ouverture (openStart) et après 23:00 (plage qui traverse minuit)
  const m = timeToMinutes(t)
  return m >= timeToMinutes("23:00") || m < timeToMinutes(openStart)
}

/** Fusionne les créneaux consécutifs séparés par ≤15 min pour l'affichage "Prochain cours". Retourne { end, lastIndex }. */
function getMergedBlock(events: any[], startIndex: number, minGapMinutes: number): { end: string; lastIndex: number } {
  let end = events[startIndex].end
  let j = startIndex
  while (j + 1 < events.length) {
    const gap = timeToMinutes(events[j + 1].start) - timeToMinutes(events[j].end)
    if (gap > 0 && gap <= minGapMinutes) {
      j += 1
      end = events[j].end
    } else break
  }
  return { end, lastIndex: j }
}

function getRoomInfo(room:string){

// En mode "live" (ou si l'utilisateur n'a pas choisi date/heure),
// on se base sur l'heure actuelle pour appliquer correctement les périodes "FERMÉ".
const effectiveDate = date || nowDateStr(liveNow)
const effectiveTime = time || nowTimeStr(liveNow)

const todayStr=nowDateStr(liveNow)
const day=getDayFromDateStr(effectiveDate)
const openStart=getOpenStartForDay(day)
const closeEnd="23:00"
const minUsefulGap=15

if(isClosedTime(effectiveTime,openStart)){
  return { status: "FERMÉ", closedStart: closeEnd, closedEnd: openStart }
}

const events=schedule
.filter((e:any)=>roomMatches(room,e.room) && entryAppliesToDate(e,effectiveDate))
.sort((a:any,b:any)=>a.start.localeCompare(b.start))

let prevEnd=openStart

for(let i=0;i<events.length;i++){

const event=events[i]

if(effectiveTime >= event.start && effectiveTime < event.end){

// Cherche la prochaine fenêtre de disponibilité utile (> 15 min)
// en sautant les petites pauses entre blocs de cours/labos.
let availStartVal = event.end
let availEndVal = closeEnd
for(let j=i+1; j<events.length; j++){
  const nextEvt = events[j]
  const gap = timeToMinutes(nextEvt.start) - timeToMinutes(availStartVal)
  if(gap > minUsefulGap){
    availEndVal = nextEvt.start
    break
  }
  if(timeToMinutes(nextEvt.end) > timeToMinutes(availStartVal)){
    availStartVal = nextEvt.end
  }
}

return{

status:"OCCUPÉ",

course:event.course,
activite:event.activite,
enseignant:event.enseignant,

start:event.start,
end:event.end,

availStart:availStartVal,
availEnd: availEndVal

}

}

if(effectiveTime < event.start){

const gapTotal=timeToMinutes(event.start)-timeToMinutes(prevEnd)
if(gapTotal>0 && gapTotal<=minUsefulGap && effectiveTime>=prevEnd){
  const nextEvent=event
  const afterNext=events[i+1]

  const mergedPause = getMergedBlock(events, i, minUsefulGap)
  const afterBlock = events[mergedPause.lastIndex + 1]
  return{
    status:"OCCUPÉ",
    course:"PAUSE",
    start:prevEnd,
    end:nextEvent.start,

    nextCourse:nextEvent.course,
    nextActivite:nextEvent.activite,
    nextEnseignant:nextEvent.enseignant,
    nextStart:nextEvent.start,
    nextEnd:mergedPause.end,

    availStart:mergedPause.end,
    availEnd:afterBlock ? afterBlock.start : closeEnd
  }
}

const merged = getMergedBlock(events, i, minUsefulGap)
return{

status:"LIBRE",

freeStart:prevEnd,
freeEnd:event.start,

nextCourse:event.course,
nextActivite:event.activite,
nextEnseignant:event.enseignant,
nextStart:event.start,
nextEnd:merged.end,
nextDayLabel: date===todayStr ? "Aujourd'hui" : undefined

}

}

// Toujours avancer prevEnd, sinon on ne détecte pas
// correctement les pauses entre 2 cours (<= 15 min).
prevEnd=event.end

}

  const gapToClose=timeToMinutes(closeEnd)-timeToMinutes(prevEnd)
  if(gapToClose>0 && gapToClose<=minUsefulGap && effectiveTime>=prevEnd){
  return{
    status:"OCCUPÉ",
    course:"PAUSE",
    start:prevEnd,
    end:closeEnd,
    availStart:closeEnd,
    availEnd:closeEnd
  }
}

  const isSameDayAsToday = effectiveDate===todayStr
  const nextDayInfo=getNextDayLabelAndFirstEvent(room,effectiveDate,schedule,isSameDayAsToday,isLive)

return{

status:"LIBRE",

  freeStart:prevEnd,
  freeEnd:closeEnd,

  nextDayLabel:nextDayInfo?.label,
  nextCourse:nextDayInfo?.course,
  nextActivite:nextDayInfo?.activite,
  nextEnseignant:nextDayInfo?.enseignant,
  nextStart:nextDayInfo?.start,
  nextEnd:nextDayInfo?.end

}

}



function percent(start:string,end:string){

const startDay=390
const endDay=1380

const s=timeToMinutes(start)
const e=timeToMinutes(end)

const total=endDay-startDay

return{

left:((s-startDay)/total)*100,
width:((e-s)/total)*100

}

}

function clamp(n:number,min:number,max:number){
  return Math.min(max,Math.max(min,n))
}

function dayPercentAt(currentTime:string, dayStart:string, dayEnd:string){
  const start=timeToMinutes(dayStart)
  const end=timeToMinutes(dayEnd)
  const cur=timeToMinutes(currentTime)
  const total=end-start || 1
  return clamp(((cur-start)/total)*100,0,100)
}

function formatCountdownMinutes(totalMinutes:number){
  const m=Math.max(0,Math.floor(totalMinutes))
  const h=Math.floor(m/60)
  const mm=m%60
  if(h<=0) return `${mm} min`
  if(mm===0) return `${h} h`
  return `${h} h ${mm} min`
}

function minutesUntil(now:string, target:string){
  return timeToMinutes(target)-timeToMinutes(now)
}

function secondsSinceMidnight(d:Date){
  return d.getHours()*3600 + d.getMinutes()*60 + d.getSeconds()
}

function timeToSeconds(t:string){
  const p=t.split(":")
  const hh=Number(p[0]||0)
  const mm=Number(p[1]||0)
  const ss=Number(p[2]||0)
  return hh*3600 + mm*60 + ss
}

function secondsUntilTime(now:Date, targetHHMM:string){
  const targetSec=timeToMinutes(targetHHMM)*60
  return targetSec - secondsSinceMidnight(now)
}

function formatCountdownSeconds(totalSeconds:number){
  const s=Math.max(0,Math.floor(totalSeconds))
  const h=Math.floor(s/3600)
  const mm=Math.floor((s%3600)/60)
  const ss=s%60
  return `${pad2(h)}:${pad2(mm)}:${pad2(ss)}`
}

function hmToHms(t?:string){
  if(!t) return ""
  // Données en HH:MM -> on affiche HH:MM:SS
  return t.length===5 ? `${t}:00` : t
}

function hmToHm(t?:string){
  if(!t) return ""
  return t.length>=5 ? t.slice(0,5) : t
}

// Normalise pour la recherche: A-9999, A9999, a 9999 -> "a9999"
function normalizeForSearch(s:string){
  return s.replace(/\s+/g,"").replace(/-/g,"").toLowerCase()
}

function getSearchSuggestions(roomsList:string[], query:string, limit=10){
  if(!query.trim()) return []
  const q=normalizeForSearch(query)
  return roomsList
    .filter(room=>normalizeForSearch(room).includes(q))
    .slice(0,limit)
}

function normalizeForProf(s: string){
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim()
}

function formatTeacherList(s?: string){
  if (!s) return ""
  return s
    .split(/\s*\/\s*/)
    .map((p: string) => p.trim())
    .filter(Boolean)
    .join(", ")
}

function formatCourseWithActivite(course?: string, activite?: string){
  if(!course) return ""
  const a = activite === "TP" ? "TP" : activite === "Labo" ? "Labo" : "C"
  return `${course}-${a}`
}

function isValidProfName(s: string): boolean {
  const t = s.trim()
  if (!t) return false
  if (t.length <= 2) return false
  if (/^[A-Za-z\u00C0-\u024F]\.$/.test(t)) return false
  return true
}

function getUniqueProfNames(schedule: any[]){
  const set = new Set<string>()
  schedule.forEach((e:any)=>{
    if (e.enseignant) {
      e.enseignant.split(/\s*\/\s*/).forEach((n: string) => {
        const name = n.trim()
        if (isValidProfName(name)) set.add(name)
      })
    }
  })
  return Array.from(set).sort()
}

function getProfSuggestions(names: string[], query: string, limit = 12){
  if (!query.trim()) return []
  const q = normalizeForProf(query)
  if (q.length < 2) return names.filter(n => normalizeForProf(n).startsWith(q)).slice(0, limit)
  const scored = names.map(name => {
    const n = normalizeForProf(name)
    if (n === q) return { name, score: 100 }
    if (n.startsWith(q)) return { name, score: 90 }
    if (n.includes(q)) return { name, score: 70 }
    const qLen = q.length
    let matches = 0
    let j = 0
    for (let i = 0; i < n.length && j < q.length; i++) {
      if (n[i] === q[j]) { j++; matches++ }
    }
    if (j === q.length) return { name, score: 50 + matches }
    if (n.length >= qLen - 1 && n.length <= qLen + 2) {
      let d = 0
      for (let i = 0; i < Math.min(n.length, q.length); i++) if (n[i] !== q[i]) d++
      if (d <= 2) return { name, score: 40 }
    }
    return { name, score: 0 }
  })
  return scored
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(x => x.name)
}

function getUniqueCourses(schedule: any[]): { code: string; title: string }[] {
  const map = new Map<string, string>()
  schedule.forEach((e: any) => {
    if (!e.course) return
    const title = (e.courseTitle && e.courseTitle.trim()) || map.get(e.course) || ""
    map.set(e.course, title)
  })
  return Array.from(map.entries()).map(([code, title]) => ({ code, title })).sort((a, b) => a.code.localeCompare(b.code))
}

function getCoursesForProf(schedule: any[], profName: string): string[] {
  const q = normalizeForProf(profName)
  const match = (s?: string) => s && (normalizeForProf(s).includes(q) || s.split(/\s*\/\s*/).some((p: string) => normalizeForProf(p).includes(q)))
  const set = new Set<string>()
  schedule.forEach((e: any) => {
    if (e.course && match(e.enseignant)) set.add(e.course)
  })
  return Array.from(set).sort()
}

function getProfsForCourse(schedule: any[], courseCode: string): string[] {
  const set = new Set<string>()
  schedule.forEach((e: any) => {
    if (e.course !== courseCode || !e.enseignant) return
    e.enseignant.split(/\s*\/\s*/).forEach((n: string) => {
      const name = n.trim()
      if (isValidProfName(name)) set.add(name)
    })
  })
  return Array.from(set).sort((a, b) => a.localeCompare(b))
}

function getCourseSuggestions(courses: { code: string; title: string }[], query: string, limit = 10) {
  if (!query.trim()) return []
  const raw = query.trim()
  const rawNoDiacritics = raw.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")
  const alpha3 = rawNoDiacritics.replace(/[^a-z]/g, "")
  // Si l'utilisateur tape seulement 3 lettres (ex: "mec", "GOL"), afficher tous les cours du sigle correspondant.
  if (alpha3.length === 3 && alpha3 === rawNoDiacritics) {
    const prefix = alpha3.toUpperCase()
    return courses
      .filter(c => (c.code || "").toUpperCase().startsWith(prefix))
      .sort((a, b) => (a.code || "").localeCompare(b.code || "", "fr-CA", { numeric: true }))
      .slice(0, limit)
  }
  const q = raw.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")
  // Quand l'utilisateur a sélectionné "CODE — Titre", matcher par sigle pour que le cours reste reconnu
  const selectedCode = raw.split(/\s*—\s*/)[0]?.trim().toLowerCase()
  return courses
    .filter(c => {
      const matchBySelectedCode = selectedCode && c.code.toLowerCase() === selectedCode
      const matchBySearch = c.code.toLowerCase().includes(q) || (c.title && c.title.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").includes(q))
      return matchBySelectedCode || matchBySearch
    })
    .slice(0, limit)
}

const joursFr=["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"]
const moisFr=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"]

function cap(s:string){ return s ? s.charAt(0).toUpperCase()+s.slice(1) : s }

function getDayLabelForDate(dateStr:string, todayStr:string){
  if(!dateStr) return ""
  if(dateStr===todayStr) return "Aujourd'hui"
  const parts=dateStr.split("-")
  const d=new Date(Number(parts[0]),Number(parts[1])-1,Number(parts[2]))
  return cap(joursFr[d.getDay()])
}

function formatDateLabelFr(dateStr:string, todayStr:string){
  if(dateStr===todayStr) return "Aujourd'hui"
  const parts=dateStr.split("-")
  const d=new Date(Number(parts[0]),Number(parts[1])-1,Number(parts[2]))
  const tomorrow=new Date(d)
  tomorrow.setDate(tomorrow.getDate()-1)
  const tomorrowStr=nowDateStr(tomorrow)
  if(tomorrowStr===todayStr) return "Demain"
  const jour=cap(joursFr[d.getDay()])
  const mois=cap(moisFr[d.getMonth()])
  return `${jour} ${d.getDate()} ${mois} ${d.getFullYear()}`
}

function buildTimeOptions(){
  const opts:string[]=[]
  for(let min=390;min<=1380;min+=30){
    const h=Math.floor(min/60)
    const m=min%60
    opts.push(`${pad2(h)}:${pad2(m)}`)
  }
  return opts
}

const timeOptionsList=buildTimeOptions()

function roundTo30Min(t:string){
  const [hh,mm]=t.split(":").map(Number)
  const m=(hh*60+(mm||0))
  const r=Math.round(m/30)*30
  const h=Math.floor(r/60)
  const mi=r%60
  return `${pad2(h)}:${pad2(mi)}`
}

const daysEn=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]

/** Semaine complète lundi → dimanche pour les modals "Horaire de la semaine". */
function getWeekDaysToShow(dateStr:string){
  const parts=dateStr.split("-")
  const d=new Date(Number(parts[0]),Number(parts[1])-1,Number(parts[2]))
  const dayOfWeek=d.getDay()
  const mondayOffset=dayOfWeek===0 ? -6 : 1-dayOfWeek
  const monday=new Date(d)
  monday.setDate(d.getDate()+mondayOffset)
  const out:{date:Date,dateStr:string,dayEn:string,label:string}[]=[]
  for(let i=0;i<7;i++){
    const day=new Date(monday)
    day.setDate(monday.getDate()+i)
    out.push({
      date:day,
      dateStr:nowDateStr(day),
      dayEn:daysEn[day.getDay()],
      label: `${cap(joursFr[day.getDay()])} ${day.getDate()} ${cap(moisFr[day.getMonth()])} ${day.getFullYear()}`
    })
  }
  return out
}

function buildDateOptions(todayStr:string, count=14){
  const opts:[string,string][]=[]
  const parts=todayStr.split("-")
  const y=Number(parts[0]), m=Number(parts[1]), d=Number(parts[2])
  for(let i=0;i<count;i++){
    const date=new Date(y,m-1,d+i)
    const val=nowDateStr(date)
    opts.push([val, formatDateLabelFr(val, todayStr)])
  }
  return opts
}

function intervalPercentAtTimeStr(current:string, start:string, end:string){
  const c=timeToSeconds(hmToHms(current))
  const s=timeToSeconds(hmToHms(start))
  const e=timeToSeconds(hmToHms(end))
  const total=(e-s) || 1
  return clamp(((c-s)/total)*100,0,100)
}



const filteredRooms=rooms

.filter(room=>{

if(building!=="Tous" && !room.startsWith(building)) return false
if(search && !normalizeForSearch(room).includes(normalizeForSearch(search))) return false

return true

})

.map(room=>{

const info=getRoomInfo(room)

return{room,...info}

})
.filter(room=>{
  if(!showOnlyFreeAllDay) return true
  const dateStr=date || nowDateStr(liveNow)
  const hasEvent=schedule.some((e:any)=>roomMatches(room.room,e.room) && entryAppliesToDate(e,dateStr))
  return !hasEvent
})
.filter(room=>{
  if(!showOnlyFreeRestOfDay) return true
  return room.status==="LIBRE" && room.freeEnd==="23:00"
})
.filter(room=>{
  if(!profSearch.trim()||!selectedProfName||normalizeForProf(profSearch.trim())!==normalizeForProf(selectedProfName)) return true
  const q=normalizeForProf(profSearch.trim())
  const match=(s?:string)=>s&&(normalizeForProf(s).includes(q)||s.split(/\s*\/\s*/).some((p:string)=>normalizeForProf(p).includes(q)))
  return match(room.enseignant)||match(room.nextEnseignant)
})
.filter(room=>{
  if(!selectedCourse) return true
  return room.course===selectedCourse||room.nextCourse===selectedCourse
})
.filter(room=>{
  if(roomTypeFilter==="all") return true
  if(roomTypeFilter==="labs") return isLabRoomCode(room.room) || aLabOnlyRooms.has(room.room) || A_FORCED_LAB_ROOMS.has(room.room)
  return isClassroomRoomCode(room.room)
})
.sort((a:any,b:any)=>{
  const order=(s:string)=>{
    if(s==="LIBRE") return 0
    if(s==="OCCUPÉ") return 1
    if(s==="FERMÉ") return 2
    return 3
  }

  const d=order(a.status)-order(b.status)
  if(d!==0) return d
  const pavilionRank: Record<string, number> = { B: 0, D: 1, E: 2, F: 3, A: 4 }
  const letterA = String(a.room || "").split("-")[0]?.trim() || ""
  const letterB = String(b.room || "").split("-")[0]?.trim() || ""
  const rA = pavilionRank[letterA] ?? 99
  const rB = pavilionRank[letterB] ?? 99
  if(rA !== rB) return rA - rB

  const numA = parseInt(String(a.room || "").replace(/\D/g, ""), 10) || 0
  const numB = parseInt(String(b.room || "").replace(/\D/g, ""), 10) || 0
  if(numA !== numB) return numA - numB

  return String(a.room).localeCompare(String(b.room),"fr",{numeric:true,sensitivity:"base"})
})

const freeCount = filteredRooms.filter((r:any)=>r.status==="LIBRE").length
const occupiedCount = filteredRooms.filter((r:any)=>r.status==="OCCUPÉ").length
const closedCount = filteredRooms.filter((r:any)=>r.status==="FERMÉ").length

const buildingDensity = (()=>{
  const out: Record<string,{ free: number; occupied: number; closed: number }> = {}
  ;["A","B","D","E","F"].forEach(b=>{ out[b] = { free: 0, occupied: 0, closed: 0 } })
  rooms.forEach(room=>{
    const letter = room[0]
    if(!out[letter]) return
    const info = getRoomInfo(room)
    if(info.status==="LIBRE") out[letter].free++
    else if(info.status==="OCCUPÉ") out[letter].occupied++
    else out[letter].closed++
  })
  return out
})()

useEffect(()=>{
  if(!isLive) return

  const tick=()=>{
    const d=new Date()
    setLiveNow(d)
    setDate(nowDateStr(d))
    setTime(nowTimeStr(d))
  }

  tick()
  const id=setInterval(tick, 1_000)
  return ()=>clearInterval(id)
},[isLive])

const effectiveNowDate = date || nowDateStr(liveNow)
const effectiveNowTime = time || nowTimeStr(liveNow)
const effectiveDay = getDayFromDateStr(effectiveNowDate)
const effectiveOpenStart = getOpenStartForDay(effectiveDay)
const effectiveCloseEnd = "23:00"
const nowDotLeft = dayPercentAt(effectiveNowTime, effectiveOpenStart, effectiveCloseEnd)
const showSessionStartNotice = effectiveNowDate < SESSION_START_DATE
const sessionStartLabel = formatYmdForLang(SESSION_START_DATE, lang)
const sessionStartNoticeText = t("sessionStartsNotice").replace("{date}", sessionStartLabel)

const resetRoomsSection = ()=>{
  setSearch("")
  setSearchFocused(false)
  setBuilding("Tous")
  setRoomTypeFilter("all")
  setShowOnlyFreeAllDay(false)
  setShowOnlyFreeRestOfDay(false)
  setOpenWeekRoom(null)
  setOpenDropdown(null)
  // Revenir en LIVE (heure du moment)
  setIsLive(true)
  setDate(nowDateStr(liveNow))
  setTime(nowTimeStr(liveNow))
  searchInputRef.current?.blur()
}

const resetCoursesTeachersSection = ()=>{
  setCourseSearch("")
  setCourseSearchFocused(false)
  setSelectedCourse(null)
  setOpenCourseSchedule(null)
  setProfSearch("")
  setProfSearchFocused(false)
  setSelectedProfName(null)
  setOpenProfSchedule(null)
  setCoursesOrProfsView("courses")
  courseInputRef.current?.blur()
  profInputRef.current?.blur()
}
const dateOptions = buildDateOptions(nowDateStr(liveNow))

return(

<main className="container">


<div className="header">
<div className="headerBrand">
  <div className="logoBlock" aria-hidden>
    <div className="logoMark logoMarkImg" aria-hidden>
      <img src="/logo-transparent_LOUPE.png" alt="" className="logoEtsImg" decoding="async" />
    </div>
    <div className="headerTitleBlock">
      <h1 className="logoText">ÉTS Hub</h1>
    </div>
  </div>
</div>

<div className="headerActions">
<button type="button" className="aboutBtn" onClick={()=>document.getElementById("a-propos")?.scrollIntoView({ behavior: "smooth", block: "start" })}>{t("about")}</button>
<button type="button" className="langBtn" onClick={()=>setLang(l=>l==="fr"?"en":"fr")} title={lang==="fr"?"English":"Français"}>{lang==="fr"?"EN":"FR"}</button>
<div
className={`themeSwitch ${theme}`}
onClick={()=>setTheme(theme==="dark"?"light":"dark")}
>
<div className="switchCircle">{theme==="dark" ? "☾" : "☼"}</div>
</div>
</div>

</div>

<div className="quickOptions" aria-label="Options">
<button type="button" className={`quickOption ${activeQuickView==="rooms"?"active":""}`} onClick={()=>setActiveQuickView("rooms")}>{t("freeRoomsLive")}</button>
<button type="button" className={`quickOption quickOptionTwoLines ${activeQuickView==="coursesAndEnseignants"?"active":""}`} onClick={()=>{ setCoursesOrProfsView("courses"); startTransition(()=>setActiveQuickView("coursesAndEnseignants")) }} aria-busy={isPending}>{t("coursesAndTeachers")}</button>
<button type="button" className={`quickOption ${activeQuickView==="workRooms"?"active":""}`} onClick={()=>{ setCoursesOrProfsView("courses"); startTransition(()=>setActiveQuickView("workRooms")) }} aria-busy={isPending}>{t("viewWorkRooms")}</button>
</div>

{activeQuickView==="rooms" && (
<section className="pageSection sectionRooms" aria-label={t("freeRoomsLive")}>
<div className="controls sectionControlsOneLine" ref={controlsRef}>
<button type="button" className={`liveButton ${isLive ? "on" : ""}`} onClick={()=>setIsLive(v=>!v)}>
{isLive && <span className="liveDot" aria-hidden />}
{isLive ? t("live") : t("liveOff")}
</button>
<div className="searchStack searchStackInline">
<div className="searchWrap searchWrapClear">
<input
ref={searchInputRef}
placeholder={t("searchRoom")}
aria-label={t("searchRoom")}
value={search}
onChange={e=>setSearch(e.target.value)}
onFocus={()=>setSearchFocused(true)}
onBlur={()=>setTimeout(()=>setSearchFocused(false),150)}
className={search ? "hasClear" : ""}
/>
{search ? (
<button type="button" className="searchClearBtn" onClick={()=>{ setSearch(""); searchInputRef.current?.focus() }} aria-label={t("clear")}>×</button>
) : null}
{searchFocused && search.trim() && (
<ul className="searchSuggestions">
{getSearchSuggestions(rooms,search).map(room=>(
<li key={room} onMouseDown={()=>{ setSearch(room); setSearchFocused(false) }}>
{room}
</li>
))}
</ul>
)}
</div>
</div>
<div className="customSelectWrap">
<button type="button" className="customSelectBtn dateSelect" onClick={()=>setOpenDropdown(openDropdown==="date"?null:"date")} aria-expanded={openDropdown==="date"}>
<span>{dateOptions.find(([v])=>v===(date||effectiveNowDate))?.[1] ?? (date || effectiveNowDate)}</span>
<span className="selectArrow" aria-hidden>▼</span>
</button>
{openDropdown==="date" && (
<ul className="searchSuggestions customSelectList" onMouseDown={e=>e.preventDefault()}>
{dateOptions.map(([val,label])=>(
<li key={val} className={val===(date||effectiveNowDate)?"selected":""} onMouseDown={()=>{ setIsLive(false); setDate(val); setOpenDropdown(null) }}>{label}</li>
))}
</ul>
)}
</div>
<div className="customSelectWrap">
<button type="button" className="customSelectBtn timeSelect" onClick={()=>setOpenDropdown(openDropdown==="time"?null:"time")} aria-expanded={openDropdown==="time"}>
<span>{time && timeOptionsList.includes(time) ? time : roundTo30Min(time || effectiveNowTime || "06:30")}</span>
<span className="selectArrow" aria-hidden>▼</span>
</button>
{openDropdown==="time" && (
<ul className="searchSuggestions customSelectList" onMouseDown={e=>e.preventDefault()}>
{timeOptionsList.map(tm=>{
const currentTime = time && timeOptionsList.includes(time) ? time : roundTo30Min(time || effectiveNowTime || "06:30")
return (
<li key={tm} className={tm===currentTime?"selected":""} onMouseDown={()=>{ setIsLive(false); setTime(tm); setOpenDropdown(null) }}>{tm}</li>
)
})}
</ul>
)}
</div>
<div className="customSelectWrap">
<button type="button" className="customSelectBtn buildingSelect" onClick={()=>setOpenDropdown(openDropdown==="building"?null:"building")} aria-expanded={openDropdown==="building"}>
<span>{building==="Tous"?t("allPavilions"):`${t("pavilion")} ${building}`}</span>
<span className="selectArrow" aria-hidden>▼</span>
</button>
{openDropdown==="building" && (
<ul className="searchSuggestions customSelectList" onMouseDown={e=>e.preventDefault()}>
<li className={building==="Tous"?"selected":""} onMouseDown={()=>{ setBuilding("Tous"); setOpenDropdown(null) }}>{t("allPavilions")}</li>
{(["B","D","E","F","A"] as const).map(b=>{
  const d=buildingDensity[b]
  const tot=d.free+d.occupied+d.closed||1
  const freePct=(d.free/tot)*100
  const occPct=(d.occupied/tot)*100
  const closedPct=(d.closed/tot)*100
  return (
<li key={b} className={building===b?"selected":""} onMouseDown={()=>{ setBuilding(b); setOpenDropdown(null) }}>
<span>{t("pavilion")} {b}</span>
<span className="buildingDensityWrap">
<span className="buildingDensityBar" role="img" aria-hidden><span className="densitySeg free" style={{width:`${freePct}%`}} /><span className="densitySeg occupied" style={{width:`${occPct}%`}} /><span className="densitySeg closed" style={{width:`${closedPct}%`}} /></span>
</span>
</li>
  )
})}
</ul>
)}
</div>
<div className="customSelectWrap">
<button type="button" className="customSelectBtn roomTypeSelect" onClick={()=>setOpenDropdown(openDropdown==="roomType"?null:"roomType")} aria-expanded={openDropdown==="roomType"}>
<span>{roomTypeFilter==="all" ? t("roomType") : roomTypeFilter==="labs" ? t("viewLabs") : t("viewClassrooms")}</span>
<span className="selectArrow" aria-hidden>▼</span>
</button>
{openDropdown==="roomType" && (
<ul className="searchSuggestions customSelectList" onMouseDown={e=>e.preventDefault()}>
<li className={roomTypeFilter==="all"?"selected":""} onMouseDown={()=>{ setRoomTypeFilter("all"); setOpenDropdown(null) }}>{t("viewAll")}</li>
<li className={roomTypeFilter==="labs"?"selected":""} onMouseDown={()=>{ setRoomTypeFilter("labs"); setOpenDropdown(null) }}>{t("viewLabs")}</li>
<li className={roomTypeFilter==="classrooms"?"selected":""} onMouseDown={()=>{ setRoomTypeFilter("classrooms"); setOpenDropdown(null) }}>{t("viewClassrooms")}</li>
</ul>
)}
</div>
<button className={`freeAllDayButton ${showOnlyFreeAllDay ? "on" : ""}`} onClick={()=>{ setShowOnlyFreeRestOfDay(false); setShowOnlyFreeAllDay(v=>!v) }}>{t("freeAllDay")}</button>
<button className={`freeRestOfDayButton ${showOnlyFreeRestOfDay ? "on" : ""}`} onClick={()=>{ setShowOnlyFreeAllDay(false); setShowOnlyFreeRestOfDay(v=>!v) }}>{t("freeRestOfDay")}</button>
<button type="button" className="resetBtn" onClick={resetRoomsSection} aria-label={t("reset")} title={t("reset")}><span aria-hidden>↻</span></button>
</div>

{showSessionStartNotice ? (
  <div className="sessionStartNotice" role="status" aria-live="polite">
    {sessionStartNoticeText}
  </div>
) : null}

<div className="roomsStatsLine aboveGrid">
{freeCount} {t("roomsStatFree")}, {occupiedCount} {t("roomsStatOccupied")}{closedCount ? `, ${closedCount} ${t("roomsStatClosed")}` : ""}
</div>

<div className="grid">
{filteredRooms.map(room=>(
<div key={room.room} className="card">
{(room.status==="LIBRE" || room.status==="OCCUPÉ") && (isLabRoomCode(room.room) || aLabOnlyRooms.has(room.room) || A_FORCED_LAB_ROOMS.has(room.room)) ? (
  <span className="labFlag">LAB</span>
) : null}
<div className="room">
<span className="roomNumber">{room.room}</span>
{isClassroomRoomCode(room.room) && (room.status === "LIBRE" || room.status === "OCCUPÉ") ? (
  <span className="courseFlag">{lang === "fr" ? "Salle de cours" : "Classroom"}</span>
) : null}
<span className="roomStatus">
  {room.status==="LIBRE" ? t("free") : room.status==="OCCUPÉ" ? t("occupied") : t("closed")}
</span>
</div>
{room.status==="LIBRE" &&(
<>
<div className="timelineContainer">
<span>{hmToHm(room.freeStart)}</span>
<div className="timelineBar greenBar">
<div className="timelineDot" style={{ left:`${intervalPercentAtTimeStr(effectiveNowTime, room.freeStart || effectiveOpenStart, room.freeEnd || effectiveCloseEnd)}%` }}></div>
</div>
<span>{hmToHm(room.freeEnd)}</span>
</div>
{room.freeEnd && (
<div className="countdown green">
{isLive ? formatCountdownSeconds(secondsUntilTime(liveNow, room.freeEnd)) : formatCountdownMinutes(minutesUntil(effectiveNowTime, room.freeEnd))}
</div>
)}
{room.nextCourse &&(
<div className="info prochainCoursBlock">
<div className="prochainCoursLine1">
<span className="prochainCoursTitle">
  {room.nextActivite==="TP" ? t("nextTP") : room.nextActivite==="Labo" ? t("nextLabo") : t("nextCourse")}{room.nextDayLabel ? ` (${room.nextDayLabel})` : ""}
</span>
<span className="courseSiglePill">{room.nextCourse}</span>
</div>
<div className="prochainCoursLine2">
<span>{hmToHm(room.nextStart)} à {hmToHm(room.nextEnd)}</span>
{room.nextEnseignant && <span>· {formatTeacherList(room.nextEnseignant)}</span>}
</div>
</div>
)}
</>
)}
{room.status==="OCCUPÉ" &&(
<>
<div className="timelineContainer">
<span>{hmToHm(room.start)}</span>
<div className="timelineBar redBar">
<div className="timelineDot" style={{left:`${intervalPercentAtTimeStr(effectiveNowTime, room.start, room.end)}%`}}></div>
{room.course && room.course!=="PAUSE" && (
<div className="timelineDotLabel" style={{left:`${intervalPercentAtTimeStr(effectiveNowTime, room.start, room.end)}%`}}>{formatCourseWithActivite(room.course, room.activite)}</div>
)}
</div>
<span>{hmToHm(room.end)}</span>
</div>
<div className="info">
{room.course==="PAUSE" && (<><br/></>)}
{room.enseignant && room.course && room.course!=="PAUSE" && (
<div className="enseignantLine">{formatTeacherList(room.enseignant)}</div>
)}
{room.end && (
<span className="countdown red">
{isLive ? formatCountdownSeconds(secondsUntilTime(liveNow, room.end)) : formatCountdownMinutes(minutesUntil(effectiveNowTime, room.end))}
</span>
)}
{(()=>{
const start=room.availStart || room.end
const end=room.availEnd || "23:00"
const durMin=timeToMinutes(end)-timeToMinutes(start)
if(durMin<=15) return null
const dayLabel=date ? getDayLabelForDate(date, nowDateStr(liveNow)) : ""
return (<><br/>{t("nextAvailability")}{dayLabel ? ` (${dayLabel})` : ""}<br/><div className="nextAvail">{hmToHm(start)} à {hmToHm(end)}</div></>)
})()}
</div>
</>
)}
{room.status==="FERMÉ" &&(
<>
<div className="timelineContainer">
<span>{hmToHm(room.closedStart || "23:00")}</span>
<div className="timelineBar closedBar"></div>
<span>{hmToHm(room.closedEnd || getOpenStartForDay(getDayFromDateStr(date || nowDateStr(new Date()))))}</span>
</div>
</>
)}
{(room.room.startsWith("F-") && !F_ACCESS_LIMITED_EXCEPTIONS.has(room.room)) || B_ACCESS_LIMITED_ROOMS.has(room.room) || room.room.startsWith("A-") ? (
  <div className="accessInfo" aria-label={t("accessRestricted")}>
    <div className="accessBadge restricted">{t("accessRestricted")}</div>
    <div className="accessDetail">
      {lang === "fr"
        ? "Seuls les étudiant(e)s ayant ce local inscrit à leur horaire y ont accès. Carte étudiante requise."
        : "Access is limited to students who have this room on their schedule. Student card required."}
    </div>
  </div>
) : null}
<button type="button" className="weekScheduleBtn" onClick={()=>setOpenWeekRoom(room.room)}>{t("roomSchedule")}</button>
</div>
))}
</div>
</section>
)}

{activeQuickView==="workRooms" && (
<section className="pageSection sectionWorkRooms" aria-label={t("viewWorkRooms")}>
  <div className="workRoomsIntroBox">{t("workRoomsIntro")}</div>
  <div className="grid">
    {Array.from(WORK_ROOMS)
      .sort((a, b) => {
        const letterA = a.split("-")[0] || ""
        const letterB = b.split("-")[0] || ""
        if (letterA !== letterB) return letterA.localeCompare(letterB, "fr", { sensitivity: "base" })
        const na = parseInt((a.split("-")[1] || "").replace(/\D/g, ""), 10) || 0
        const nb = parseInt((b.split("-")[1] || "").replace(/\D/g, ""), 10) || 0
        return na - nb
      })
      .map((room) => {
        const meta = WORK_ROOM_META[room]
        if (!meta) return null
        return (
          <div key={room} className="card">
            <div className="room">
              <span className="roomNumber">{room}</span>
              {meta.accessLimited ? (
                <div className="accessInfo" aria-label={t("accessRestricted")}>
                  <div className="accessBadge restricted">{t("accessRestricted")}</div>
                </div>
              ) : null}
            </div>

            <ul className="workRoomDesc">
              {(lang === "fr" ? meta.descFr : meta.descEn).map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )
      })}
  </div>
</section>
)}

{activeQuickView==="coursesAndEnseignants" && (
<section className="pageSection sectionCoursesEnseignants" ref={courseSectionRef} aria-label={t("coursesAndTeachers")}>
{isPending ? <p className="coursesSectionLoading" aria-live="polite">{t("loading")}</p> : null}
<div className="coursesProfsToggle">
<button type="button" className={`quickOption ${coursesOrProfsView==="courses"?"active":""}`} onClick={()=>setCoursesOrProfsView("courses")}>{t("viewCourses")}</button>
<button type="button" className={`quickOption ${coursesOrProfsView==="profs"?"active":""}`} onClick={()=>setCoursesOrProfsView("profs")}>{t("viewProfs")}</button>
</div>

{coursesOrProfsView==="courses" && (
<>
<div className="controls sectionControlsOneLine">
<div className="searchStack searchStackInline">
<div className="searchWrap searchWrapClear">
<input
ref={courseInputRef}
placeholder={t("courseSearch")}
value={courseSearch}
onChange={e=>setCourseSearch(e.target.value)}
onFocus={()=>setCourseSearchFocused(true)}
onBlur={()=>setTimeout(()=>setCourseSearchFocused(false),150)}
className={courseSearch ? "hasClear" : ""}
/>
{courseSearch ? (
<button type="button" className="searchClearBtn" onClick={()=>{ setCourseSearch(""); courseInputRef.current?.focus() }} aria-label={t("clear")}>×</button>
) : null}
{courseSearchFocused && courseSearch.trim() && (
<ul className="searchSuggestions">
{getCourseSuggestions(coursesAndProfsData.uniqueCourses,courseSearch).map(c=>(
<li key={c.code} className="courseSuggestionItem" onMouseDown={()=>{ setCourseSearch(c.title ? `${c.code} — ${c.title}` : c.code); setCourseSearchFocused(false) }}>
{c.title ? <><span className="courseSuggestionTitle">{c.title}</span><span className="courseSiglePill">{c.code}</span></> : <span className="courseSiglePill">{c.code}</span>}
</li>
))}
</ul>
)}
</div>
</div>
<button type="button" className="resetBtn" onClick={resetCoursesTeachersSection} aria-label={t("reset")} title={t("reset")}><span aria-hidden>↻</span></button>
</div>
<div className="grid courseCardGrid">
{(()=>{
  const allCourses = coursesAndProfsData.uniqueCourses
  const filtered = courseSearch.trim()
    ? getCourseSuggestions(allCourses, courseSearch, 500)
    : allCourses
  return filtered.map(c=>{
    const profs = coursesAndProfsData.getProfs(c.code)
    return (
    <div key={c.code} className="card courseCard">
      <div className="courseCardHeader">
        <div className="courseCardTitleLine"><span className="roomNumber courseCardTitle">{c.title || c.code}</span></div>
        <div className="courseCardSigleLine">
          <span className="courseSiglePill courseCardSiglePill">{c.code}</span>
        </div>
      </div>
      <div className="courseCardProfsWrap">
        <div className="courseCardProfs">
          {profs.length===0 ? null : profs.map(name=>(
          <div key={name} className="courseCardProfCase">
            <button type="button" className="linkLikeBtn courseCardProfLink" onClick={()=>{ setCoursesOrProfsView("profs"); setProfSearch(name); setOpenProfSchedule(name) }}>{name}</button>
          </div>
          ))}
        </div>
      </div>
      <button type="button" className="weekScheduleBtn" onClick={()=>setOpenCourseSchedule(c.code)}>
        {t("weekSchedule")} - {c.code}
      </button>
    </div>
    )
  })
})()}
</div>
</>
)}

{coursesOrProfsView==="profs" && (
<>
<div className="controls sectionControlsOneLine">
<div className="searchStack searchStackInline">
<div className="searchWrap searchWrapClear">
<input
ref={profInputRef}
placeholder={t("searchTeacher")}
value={profSearch}
onChange={e=>setProfSearch(e.target.value)}
onFocus={()=>setProfSearchFocused(true)}
onBlur={()=>setTimeout(()=>setProfSearchFocused(false),150)}
className={profSearch ? "hasClear" : ""}
/>
{profSearch ? (
<button type="button" className="searchClearBtn" onClick={()=>{ setProfSearch(""); profInputRef.current?.focus() }} aria-label={t("clear")}>×</button>
) : null}
{profSearchFocused && (
<ul className="searchSuggestions">
{getProfSuggestions(coursesAndProfsData.uniqueProfs,profSearch).map(name=>(
<li key={name} onMouseDown={()=>{ setProfSearch(name); setProfSearchFocused(false) }}>{name}</li>
))}
</ul>
)}
</div>
</div>
<button type="button" className="resetBtn" onClick={resetCoursesTeachersSection} aria-label={t("reset")} title={t("reset")}><span aria-hidden>↻</span></button>
</div>
<div className="grid profCardGrid">
{(()=>{
  const allProfs = coursesAndProfsData.uniqueProfs
  const filtered = profSearch.trim()
    ? getProfSuggestions(allProfs, profSearch, 9999)
    : allProfs
  return filtered.map(name=>{
    const courseCodes = coursesAndProfsData.getCourses(name)
    return (
    <div key={name} className="card courseCard profCard">
      <div className="profCardHeader">
        <div className="profCardNameLine"><span className="roomNumber profCardName">{name}</span></div>
      </div>
      <div className="courseCardProfsWrap profCardCoursesWrap">
        <div className="courseCardProfs profCardCoursesList">
          {courseCodes.map(code=>(
          <span key={code} className="courseSiglePill profCardSiglePill">
            <button type="button" className="linkLikeBtn profCardCourseLink" onClick={()=>{ setCoursesOrProfsView("courses"); setCourseSearch(code); setOpenCourseSchedule(code) }}>{code}</button>
          </span>
          ))}
        </div>
      </div>
      <button type="button" className="weekScheduleBtn" onClick={()=>setOpenProfSchedule(name)}>
        {t("weekSchedule")} - {name}
      </button>
    </div>
    )
  })
})()}
</div>
</>
)}
</section>
)}

{openWeekRoom && (
<div className="modalOverlay" onClick={()=>setOpenWeekRoom(null)}>
<div className="modalWeek" onClick={e=>e.stopPropagation()}>
<div className="modalWeekScroll">
<h3>{openWeekRoom} · {t("roomSchedule")}</h3>
{getWeekDaysToShow(effectiveNowDate).map(day=>{
  const raw=schedule.filter((e:any)=>roomMatches(openWeekRoom,e.room) && entryAppliesToDate(e,day.dateStr))
  const seen=new Set<string>()
  const deduped=raw
    .filter((e:any)=>{
      const id=`${e.course}-${e.start}-${e.end}`
      if(seen.has(id)) return false
      seen.add(id)
      return true
    })
    .sort((a:any,b:any)=>a.start.localeCompare(b.start))
  const events:(any[])=[]
  deduped.forEach((e:any)=>{
    const last=events[events.length-1]
    if(last&&last.course===e.course&&last.end===e.start){
      last.end=e.end
      if(e.enseignant&&!last.enseignant) last.enseignant=e.enseignant
    }else events.push({ course: e.course, start: e.start, end: e.end, activite: e.activite, enseignant: e.enseignant })
  })
  const activiteLabel = (a?: string) => a === "TP" ? "TP" : a === "Labo" ? "Labo" : t("course")
  return (
  <div key={day.dateStr} className="weekDayBlock">
    <div className="weekDayLabel">{day.label}</div>
    <ul className="weekDayEvents">
    {events.length===0 ? <li className="weekDayEmpty">{t("noCourse")}</li> : events.map((e:any,i:number)=>{
      const roomsList = [...new Set(schedule.filter((x:any)=>entryAppliesToDate(x,day.dateStr) && x.course===e.course && x.start===e.start && x.end===e.end).map((x:any)=>x.room))].sort()
      const profNames = e.enseignant ? (e.enseignant as string).split(/\s*\/\s*/).map((p:string)=>p.trim()).filter(Boolean) : []
      return (
      <li key={i}>{hmToHm(e.start)} à {hmToHm(e.end)} · <strong>{activiteLabel(e.activite)}</strong> · <button type="button" className="linkLikeBtn" onClick={()=>{ setOpenWeekRoom(null); setOpenCourseSchedule(e.course) }}>{e.course}</button> · {roomsList.map((room:string, ri:number)=>(<span key={room}>{ri ? ", " : null}<button type="button" className="linkLikeBtn" onClick={()=>{ setOpenWeekRoom(room) }}>{room}</button></span>))}
      {profNames.length ? (
        <> · {profNames.map((name:string, idx:number)=>(<span key={name}>{idx ? ", " : null}<button type="button" className="linkLikeBtn" onClick={()=>{ setOpenWeekRoom(null); setOpenProfSchedule(name) }}>{name}</button></span>))}</>
      ) : null}
      </li>
      )
    })}
    </ul>
  </div>
)})}
</div>
<button type="button" className="modalCloseBtn" onClick={()=>setOpenWeekRoom(null)}>{t("close")}</button>
</div>
</div>
)}

{openProfSchedule && (()=>{
  const q=normalizeForProf(openProfSchedule)
  const match=(s?:string)=>s&&(normalizeForProf(s).includes(q)||s.split(/\s*\/\s*/).some((p:string)=>normalizeForProf(p).includes(q)))
  return (
<div className="modalOverlay" onClick={()=>setOpenProfSchedule(null)}>
<div className="modalWeek" onClick={e=>e.stopPropagation()}>
<div className="modalWeekScroll">
<h3>{t("teacherSchedule")} {openProfSchedule}</h3>
{getWeekDaysToShow(effectiveNowDate).map(day=>{
  const raw=schedule.filter((e:any)=>entryAppliesToDate(e,day.dateStr)&&match(e.enseignant))
  const seen=new Set<string>()
  const deduped=raw.filter((e:any)=>{
    const id=`${e.course}-${e.start}-${e.end}-${e.room}`
    if(seen.has(id)) return false
    seen.add(id)
    return true
  }).sort((a:any,b:any)=>a.start.localeCompare(b.start))
  const bySlot = new Map<string,{ course: string; start: string; end: string; activite?: string; rooms: string[] }>()
  deduped.forEach((e:any)=>{
    const key=`${e.course}-${e.start}-${e.end}-${e.activite || ""}`
    if(!bySlot.has(key)) bySlot.set(key,{ course: e.course, start: e.start, end: e.end, activite: e.activite, rooms: [] })
    const slot=bySlot.get(key)!
    if(!slot.rooms.includes(e.room)) slot.rooms.push(e.room)
  })
  const events = [...bySlot.values()].sort((a,b)=>a.start.localeCompare(b.start)).map(s=>({ ...s, rooms: s.rooms.sort().join(", ") }))
  const activiteLabel = (a?: string) => a === "TP" ? "TP" : a === "Labo" ? "Labo" : t("course")
  return (
  <div key={day.dateStr} className="weekDayBlock">
    <div className="weekDayLabel">{day.label}</div>
    <ul className="weekDayEvents">
    {events.length===0 ? <li className="weekDayEmpty">{t("noCourse")}</li> : events.map((e:any,i:number)=>{
      const roomsList = e.rooms ? e.rooms.split(/,\s*/).filter(Boolean) : []
      return (
      <li key={i}>{hmToHm(e.start)} à {hmToHm(e.end)} · <strong>{activiteLabel(e.activite)}</strong> · <button type="button" className="linkLikeBtn" onClick={()=>{ setOpenProfSchedule(null); setOpenCourseSchedule(e.course) }}>{e.course}</button> · {roomsList.map((room:string, ri:number)=>(<span key={room}>{ri ? ", " : null}<button type="button" className="linkLikeBtn" onClick={()=>{ setOpenProfSchedule(null); setOpenWeekRoom(room.trim()) }}>{room.trim()}</button></span>))}
      </li>
      )
    })}
    </ul>
  </div>
)})}
</div>
<button type="button" className="modalCloseBtn" onClick={()=>setOpenProfSchedule(null)}>{t("close")}</button>
</div>
</div>
)})()}

{openCourseSchedule && (()=>{
  const courseTitle = coursesAndProfsData.uniqueCourses.find(c=>c.code===openCourseSchedule)?.title || ""
  const label = courseTitle ? `${openCourseSchedule} — ${courseTitle}` : openCourseSchedule
  return (
<div className="modalOverlay" onClick={()=>setOpenCourseSchedule(null)}>
<div className="modalWeek" onClick={e=>e.stopPropagation()}>
<div className="modalWeekScroll">
<h3>{label} · {t("weekSchedule")}</h3>
{getWeekDaysToShow(effectiveNowDate).map(day=>{
  const raw=schedule.filter((e:any)=>e.course===openCourseSchedule&&entryAppliesToDate(e,day.dateStr))
  const seen=new Set<string>()
  const deduped=raw.filter((e:any)=>{
    const id=`${e.room}-${e.start}-${e.end}`
    if(seen.has(id)) return false
    seen.add(id)
    return true
  }).sort((a:any,b:any)=>a.start.localeCompare(b.start))
  const events:(any[])=[]
  deduped.forEach((e:any)=>{
    const last=events[events.length-1]
    if(last&&last.room===e.room&&last.end===e.start){
      last.end=e.end
    }else events.push({ room: e.room, start: e.start, end: e.end, activite: e.activite, enseignant: e.enseignant })
  })
  const activiteLabel = (a?: string) => a === "TP" ? "TP" : a === "Labo" ? "Labo" : t("course")
  return (
  <div key={day.dateStr} className="weekDayBlock">
    <div className="weekDayLabel">{day.label}</div>
    <ul className="weekDayEvents">
    {events.length===0 ? <li className="weekDayEmpty">{t("noCourse")}</li> : events.map((e:any,i:number)=>{
      const profNames = e.enseignant ? (e.enseignant as string).split(/\s*\/\s*/).map((p:string)=>p.trim()).filter(Boolean) : []
      const goToProf = (name:string)=>{ setOpenCourseSchedule(null); setProfSearch(name); setSelectedProfName(name); setOpenProfSchedule(name) }
      return (
      <li key={i}>{hmToHm(e.start)} à {hmToHm(e.end)} · <strong>{activiteLabel(e.activite)}</strong> · <button type="button" className="linkLikeBtn" onClick={()=>{ setOpenCourseSchedule(null); setOpenWeekRoom(e.room) }}>{e.room}</button>
      {profNames.length ? (
      <> · {profNames.map((name:string, idx:number)=>(<span key={name}>{idx ? ", " : null}<button type="button" className="linkLikeBtn" onClick={()=>goToProf(name)}>{name}</button></span>))}</>
    ) : null}
      </li>
      )
    })}
    </ul>
  </div>
)})}
</div>
<button type="button" className="modalCloseBtn" onClick={()=>setOpenCourseSchedule(null)}>{t("close")}</button>
</div>
</div>
)})()}

<section id="a-propos" className="aboutSection" aria-label={t("about")}>
<div className="attributionBlock">
<div className="contactBlock">
<div className="contactHeading"><span className="contactIcon" aria-hidden>✉</span> {t("contactUs")}</div>
{contactSent ? (
<div className="contactThankYouWrap">
  <p className="contactThankYou" role="status">{t("contactSuccess")}</p>
  <button type="button" className="contactSendAnotherBtn" onClick={()=>{ setContactSent(false); setContactError(null); setContactName(""); setContactEmail(""); setContactMessage("") }}>{t("contactSendAnother")}</button>
</div>
) : (
<form className="contactForm" onSubmit={async (e)=>{
  e.preventDefault()
  setContactError(null)
  setContactSending(true)
  const nameTrim = contactName.trim()
  const emailTrim = contactEmail.trim()
  const messageTrim = contactMessage.trim()
  if (!nameTrim || !emailTrim) {
    setContactError(lang==="fr" ? "Le nom et le courriel sont obligatoires." : "Name and email are required.")
    setContactSending(false)
    return
  }
  const emailLower = emailTrim.toLowerCase()
  const allowed = EMAIL_DOMAIN_SUGGESTIONS.some(d => emailLower.endsWith(d))
  if (!allowed) {
    setContactError(
      lang==="fr"
        ? "Courriel invalide. Utilisez seulement @ens.etsmtl.ca ou @etsmtl.ca."
        : "Invalid email. Please use only @ens.etsmtl.ca or @etsmtl.ca."
    )
    setContactSending(false)
    return
  }
  if (!messageTrim) {
    setContactError(lang==="fr" ? "Le message est obligatoire." : "Message is required.")
    setContactSending(false)
    return
  }
  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: nameTrim,
        email: emailTrim,
        message: messageTrim,
      }),
    })
    const data = (await res.json().catch(() => ({}))) as { error?: string; ok?: boolean }
    if (!res.ok) {
      const errMsg = typeof data.error === "string" ? data.error : ""
      if (res.status === 503 || /not configured|Email service/i.test(errMsg)) {
        setContactError(t("contactServiceNotConfigured"))
      } else {
        setContactError(errMsg || t("contactErrorShort"))
      }
      return
    }
    if (data.ok) setContactSent(true)
    else setContactError(t("contactErrorShort"))
  } catch {
    setContactError(t("contactErrorShort"))
  } finally {
    setContactSending(false)
  }
}}>
<div className="contactFormRow">
<label className="contactLabel">
  <div className="contactInputWrap">
    <input
      type="text"
      placeholder={t("contactName")}
      value={contactName}
      onChange={e=>setContactName(e.target.value)}
      className="contactInput"
      disabled={contactSending}
    />
    {contactName && !contactSending ? (
      <button
        type="button"
        className="contactClearBtn"
        onClick={()=>setContactName("")}
        aria-label={t("clear")}
      >
        ×
      </button>
    ) : null}
  </div>
</label>
<label className="contactLabel">
  <div className="contactInputWrap">
    <input
      type="text"
      inputMode="email"
      autoComplete="email"
      placeholder={t("contactEmail")}
      value={contactEmail}
      onChange={e=>setContactEmail(e.target.value)}
      className="contactInput"
      disabled={contactSending}
    />
    {contactEmail && !contactSending ? (
      <button
        type="button"
        className="contactClearBtn"
        onClick={()=>setContactEmail("")}
        aria-label={t("clear")}
      >
        ×
      </button>
    ) : null}
  </div>
  {!contactSending && contactEmail && !contactEmail.includes("@") && (
    <div className="emailDomainSuggestions">
      {EMAIL_DOMAIN_SUGGESTIONS.map(domain=>(
        <button
          key={domain}
          type="button"
          className="emailDomainSuggestionBtn"
          onClick={()=>setContactEmail(contactEmail + domain)}
        >
          {contactEmail}{domain}
        </button>
      ))}
    </div>
  )}
</label>
</div>
<label className="contactLabel contactLabelFull">
  <div className="contactInputWrap contactTextareaWrap">
    <textarea
      placeholder={t("contactMessage")}
      value={contactMessage}
      onChange={e=>setContactMessage(e.target.value)}
      className="contactInput contactTextarea"
      rows={3}
      disabled={contactSending}
    />
    {contactMessage && !contactSending ? (
      <button
        type="button"
        className="contactClearBtn contactClearBtnTextarea"
        onClick={()=>setContactMessage("")}
        aria-label={t("clear")}
      >
        ×
      </button>
    ) : null}
  </div>
</label>
{contactError && <div className="contactError" role="alert">{contactError}</div>}
<button type="submit" className="contactSubmitBtn" disabled={contactSending}>{contactSending ? (lang==="fr" ? "Envoi…" : "Sending…") : t("contactSend")}</button>
</form>
)}
</div>

<div className="contactSocial">
<a href="https://www.linkedin.com/in/hmariam" target="_blank" rel="noopener noreferrer" className="contactSocialLink" aria-label="LinkedIn" title="LinkedIn">
<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
</a>
<a href={`https://discord.com/users/${DISCORD_USER_ID}`} target="_blank" rel="noopener noreferrer" className="contactSocialLink" aria-label="Discord" title={lang==="fr" ? "Me contacter sur Discord" : "Contact me on Discord"}>
<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
</a>
<a href="https://github.com/Mariamrane/ETSHub" target="_blank" rel="noopener noreferrer" className="contactSocialLink" aria-label="GitHub ETSHub" title={lang==="fr" ? "Voir le projet sur GitHub" : "View the project on GitHub"}>
<img src="/github-logo.png" alt="" aria-hidden width={22} height={22} style={{ display: "block", borderRadius: "4px" }} />
</a>
</div>

<div className="attributionFooter">
<div className="attributionText attributionProjectLine">{t("attributionProject")} {t("attributionDisclaimerFull")}</div>
<div className="attributionText">© 2026 <span className="attributionBrand">ÉTS Hub</span> par Mariam Himrane</div>
</div>
</div>
</section>

<button
  type="button"
  className={`backToTopBtn ${showBackToTop ? "visible" : ""}`}
  onClick={()=>window.scrollTo({ top: 0, behavior: "smooth" })}
  aria-label={lang==="fr" ? "Retour en haut" : "Back to top"}
  title={lang==="fr" ? "Retour en haut" : "Back to top"}
>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 19V5M5 12l7-7 7 7"/></svg>
</button>

</main>

)

}