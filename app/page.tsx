"use client"

import { useEffect,useState,useRef,useMemo,useTransition } from "react"
// Formulaire « Nous contacter » : envoi via /api/contact (Resend). Sur Vercel : ajouter RESEND_API_KEY — voir CONTACT_SETUP.md

import { TRANSLATIONS } from "./data/translations"
import {
  DISCORD_USER_ID,
  EMAIL_DOMAIN_SUGGESTIONS,
  WORK_ROOMS,
  WORK_ROOM_META,
  A_FORCED_LAB_ROOMS,
  B_ACCESS_LIMITED_ROOMS,
  F_ACCESS_LIMITED_EXCEPTIONS,
  F_COURSE_FLAG_ADDITIONAL,
  isClassroomRoomCode,
  isLabRoomCode,
} from "./data/rooms"
import {
  SESSION_START_DATE,
  buildDateOptions,
  buildTimeOptions,
  dayPercentAt,
  entryAppliesToDate,
  formatCountdownMinutes,
  formatCountdownSeconds,
  formatCourseWithActivite,
  formatTeacherList,
  formatYmdForLang,
  getCourseSuggestions,
  getDayFromDateStr,
  getDayLabelForDate,
  getProfSuggestions,
  getOpenStartForDay,
  getRoomInfo,
  getSearchSuggestions,
  getWeekDaysToShow,
  hmToHm,
  intervalPercentAtTimeStr,
  isValidProfName,
  minutesUntil,
  normalizeForSearch,
  normalizeForProf,
  nowDateStr,
  nowTimeStr,
  roundTo30Min,
  roomMatches,
  secondsUntilTime,
  timeToMinutes,
} from "./lib/scheduleLogic"

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



const filteredRooms=rooms

.filter(room=>{

if(building!=="Tous" && !room.startsWith(building)) return false
if(search && !normalizeForSearch(room).includes(normalizeForSearch(search))) return false

return true

})

.map(room=>{

const info=getRoomInfo(room,{ date,time,liveNow,schedule,isLive })

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
    const info = getRoomInfo(room,{ date,time,liveNow,schedule,isLive })
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
const timeOptionsList=buildTimeOptions()
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