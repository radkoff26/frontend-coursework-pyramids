let timeout = null
let timeLeft = null
let onTick = null

export function startTimeoutFrom(duration, onTickCallback) {
    stopTimeout()
    timeLeft = duration
    onTick = onTickCallback
    timeout = setTimeout(tick, 1000)
}

export function stopTimeout() {
    timeout && clearTimeout(timeout)
    timeout = null
}

function tick() {
    if (timeLeft === 0) {
        stopTimeout()
    } else {
        onTick && onTick()
        timeLeft--
        timeout = setTimeout(tick, 1000)
    }
}