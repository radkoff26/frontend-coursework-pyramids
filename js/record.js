import { getSessionUser } from "./storage.js"

export class Record {
    username
    result
    mode

    constructor(username, result, mode) {
        this.username = username
        this.result = result
        this.mode = mode
    }
}

export function saveRecord(mode, record) {
    const records = getRecords()
    const user = getSessionUser()
    const newRecord = new Record(user, record, mode)
    records.push(newRecord)
    localStorage.setItem('history', JSON.stringify(records))
}

export function getRecord(mode, user) {
    const records = getRecords()
    const targetRecords = records.filter(val => val.username === user && val.mode === mode)
    if (targetRecords.length === 0) {
        return 0
    }
    const targetResults = targetRecords.map(val => val.result)
    return Math.max.apply(null, targetResults)
}

function getRecords() {
    const history = localStorage.getItem('history') || '[]'
    return JSON.parse(history)
}
