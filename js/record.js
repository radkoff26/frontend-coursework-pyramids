import { getDifficultyMode, getGameTime, getSessionUser } from "./storage.js"

export class Record {
    username
    result
    mode
    timeout
    difficulty

    constructor(username, result, mode, timeout, difficulty) {
        this.username = username
        this.result = result
        this.mode = mode
        this.timeout = timeout
        this.difficulty = difficulty
    }
}

export function saveRecord(mode, record) {
    const records = getRecords()
    const user = getSessionUser()
    const newRecord = new Record(user, record, mode, getGameTime(), getDifficultyMode())
    records.push(newRecord)
    localStorage.setItem('history', JSON.stringify(records))
}

export function getRecord(mode, user) {
    const records = getRecords()
    const difficulty = getDifficultyMode()
    const targetRecords = records.filter(val => { 
        return val.username === user && val.mode === mode && val.difficulty === difficulty
    })
    if (targetRecords.length === 0) {
        return 0
    }
    const targetResults = targetRecords.map(val => val.result)
    return Math.max.apply(null, targetResults)
}

export function getAllRecordsByMode(mode) {
    return getRecords().filter(val => val.mode === mode)
}

function getRecords() {
    const history = localStorage.getItem('history') || '[]'
    return JSON.parse(history)
}
