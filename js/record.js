export function saveRecord(mode, record) {
    const lastRecord = getRecord(mode)
    if (lastRecord < record) {
        localStorage.setItem(mode, record)
    }
}

export function getRecord(mode) {
    return localStorage.getItem(mode) || 0
}
