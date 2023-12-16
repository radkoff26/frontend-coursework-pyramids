export default function stringifySeconds(seconds) {
    let time
    if (seconds >= 3600) {
        time = '59:59'
    } else {
        let minutes = Math.trunc(seconds / 60).toString()
        let secs = (seconds % 60).toString()
        if (minutes.length === 1) {
            minutes = '0' + minutes
        }
        if (secs.length === 1) {
            secs = '0' + secs
        }
        time = `${minutes}:${secs}`
    }
    return time
}