/** Profil Discord (section À propos) */
export const DISCORD_USER_ID = "1412217726402826290"

export const EMAIL_DOMAIN_SUGGESTIONS = [
  "@ens.etsmtl.ca",
  "@etsmtl.ca",
]

// Salles/labs à afficher comme "LAB" à côté de LIBRE / OCCUPÉE
export const LAB_ROOMS = new Set<string>([
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
export const B_ACCESS_LIMITED_ROOMS = new Set<string>([
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
export const F_ACCESS_LIMITED_EXCEPTIONS = new Set<string>([
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
export const F_COURSE_FLAG_ADDITIONAL = new Set<string>([
  "F-3064",
  "F-3060",
])

// Pavillon A : salles à forcer en LAB
export const A_FORCED_LAB_ROOMS = new Set<string>([
  "A-1560",
  "A-1504",
  "A-2220",
  "A-3340",
  "A-3240",
])

export function isLabRoomCode(roomCode: string){
  return LAB_ROOMS.has(roomCode)
}

export function isClassroomRoomCode(roomCode: string){
  return (
    (roomCode.startsWith("F-") && (F_ACCESS_LIMITED_EXCEPTIONS.has(roomCode) || F_COURSE_FLAG_ADDITIONAL.has(roomCode))) ||
    (roomCode.startsWith("B-") && !LAB_ROOMS.has(roomCode)) ||
    roomCode.startsWith("E-") ||
    roomCode.startsWith("D-")
  )
}

export const WORK_ROOMS = new Set<string>([
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

export const WORK_ROOM_META: Record<string, { descFr: string[]; descEn: string[]; accessLimited?: boolean }> = {
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

