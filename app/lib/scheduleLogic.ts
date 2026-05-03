export function timeToMinutes(t:string){
const p=t.split(":")
return Number(p[0])*60+Number(p[1])
}

function pad2(n:number){
  return String(n).padStart(2,"0")
}

export function nowDateStr(d:Date){
  return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`
}

export function nowTimeStr(d:Date){
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

export function getDayFromDateStr(dateStr:string){
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

// Début de session: avant cette date, on considère qu'il n'y a aucun cours (toutes les salles sont libres).
// Format attendu: "YYYY-MM-DD" (comparaison lexicographique OK).
export const SESSION_START_DATE =
  (process.env.NEXT_PUBLIC_SESSION_START_DATE || "").trim() || "2026-05-04"

export function formatYmdForLang(ymd: string, lang: "fr" | "en") {
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

export function entryAppliesToDate(e:any,dateStr:string):boolean{
  if (dateStr < SESSION_START_DATE) return false
  if(CLOSED_DATES.has(dateStr)) return false
  if(e.date) return e.date===dateStr
  const dayForDate = FORCED_DAY_BY_DATE[dateStr] || getDayFromDateStr(dateStr)
  return dayForDate===e.day
}

export function roomMatches(displayRoom:string,scheduleRoom:string):boolean{
  if(displayRoom===scheduleRoom) return true
  return scheduleRoom.startsWith(displayRoom) && scheduleRoom.length > displayRoom.length
}

function addDaysToDateStr(dateStr:string,days:number):string{
  const parts=dateStr.split(/[-\/]/).map(s=>s.trim())
  if(parts.length<3 || parts[0].length!==4) return dateStr
  const d=new Date(Number(parts[0]),Number(parts[1])-1,Number(parts[2])+days)
  return nowDateStr(d)
}

export function getOpenStartForDay(day:string){
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
  const m = timeToMinutes(t)
  return m >= timeToMinutes("23:00") || m < timeToMinutes(openStart)
}

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

export function getRoomInfo(room:string, opts:{
  date:string
  time:string
  liveNow:Date
  schedule:any[]
  isLive:boolean
}){
const { date,time,liveNow,schedule,isLive } = opts

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

export function clamp(n:number,min:number,max:number){
  return Math.min(max,Math.max(min,n))
}

export function dayPercentAt(currentTime:string, dayStart:string, dayEnd:string){
  const start=timeToMinutes(dayStart)
  const end=timeToMinutes(dayEnd)
  const cur=timeToMinutes(currentTime)
  const total=end-start || 1
  return clamp(((cur-start)/total)*100,0,100)
}

export function formatCountdownMinutes(totalMinutes:number){
  const m=Math.max(0,Math.floor(totalMinutes))
  const h=Math.floor(m/60)
  const mm=m%60
  if(h<=0) return `${mm} min`
  if(mm===0) return `${h} h`
  return `${h} h ${mm} min`
}

export function minutesUntil(now:string, target:string){
  return timeToMinutes(target)-timeToMinutes(now)
}

function secondsSinceMidnight(d:Date){
  return d.getHours()*3600 + d.getMinutes()*60 + d.getSeconds()
}

export function secondsUntilTime(now:Date, targetHHMM:string){
  const targetSec=timeToMinutes(targetHHMM)*60
  return targetSec - secondsSinceMidnight(now)
}

export function formatCountdownSeconds(totalSeconds:number){
  const s=Math.max(0,Math.floor(totalSeconds))
  const h=Math.floor(s/3600)
  const mm=Math.floor((s%3600)/60)
  const ss=s%60
  return `${pad2(h)}:${pad2(mm)}:${pad2(ss)}`
}

export function hmToHm(t?:string){
  if(!t) return ""
  return t.length>=5 ? t.slice(0,5) : t
}

export function normalizeForSearch(s:string){
  return s.replace(/\s+/g,"").replace(/-/g,"").toLowerCase()
}

export function getSearchSuggestions(roomsList:string[], query:string, limit=10){
  if(!query.trim()) return []
  const q=normalizeForSearch(query)
  return roomsList
    .filter(room=>normalizeForSearch(room).includes(q))
    .slice(0,limit)
}

export function normalizeForProf(s: string){
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim()
}

export function formatTeacherList(s?: string){
  if (!s) return ""
  return s
    .split(/\s*\/\s*/)
    .map((p: string) => p.trim())
    .filter(Boolean)
    .join(", ")
}

export function formatCourseWithActivite(course?: string, activite?: string){
  if(!course) return ""
  const a = activite === "TP" ? "TP" : activite === "Labo" ? "Labo" : "C"
  return `${course}-${a}`
}

export function isValidProfName(s: string): boolean {
  const t = s.trim()
  if (!t) return false
  if (t.length <= 2) return false
  if (/^[A-Za-z\u00C0-\u024F]\.$/.test(t)) return false
  return true
}

export function getProfSuggestions(names: string[], query: string, limit = 12){
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

export function getCourseSuggestions(courses: { code: string; title: string }[], query: string, limit = 10) {
  if (!query.trim()) return []
  const raw = query.trim()
  const rawNoDiacritics = raw.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")
  const alpha3 = rawNoDiacritics.replace(/[^a-z]/g, "")
  if (alpha3.length === 3 && alpha3 === rawNoDiacritics) {
    const prefix = alpha3.toUpperCase()
    return courses
      .filter(c => (c.code || "").toUpperCase().startsWith(prefix))
      .sort((a, b) => (a.code || "").localeCompare(b.code || "", "fr-CA", { numeric: true }))
      .slice(0, limit)
  }
  const q = raw.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")
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

export function getDayLabelForDate(dateStr:string, todayStr:string){
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

export function buildTimeOptions(){
  const opts:string[]=[]
  for(let min=390;min<=1380;min+=30){
    const h=Math.floor(min/60)
    const m=min%60
    opts.push(`${pad2(h)}:${pad2(m)}`)
  }
  return opts
}

export function roundTo30Min(t:string){
  const [hh,mm]=t.split(":").map(Number)
  const m=(hh*60+(mm||0))
  const r=Math.round(m/30)*30
  const h=Math.floor(r/60)
  const mi=r%60
  return `${pad2(h)}:${pad2(mi)}`
}

const daysEn=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]

export function getWeekDaysToShow(dateStr:string){
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

export function buildDateOptions(todayStr:string, count=14){
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

export function intervalPercentAtTimeStr(current:string, start:string, end:string){
  const c=timeToMinutes(current)*60
  const s=timeToMinutes(start)*60
  const e=timeToMinutes(end)*60
  const total=(e-s) || 1
  return clamp(((c-s)/total)*100,0,100)
}

