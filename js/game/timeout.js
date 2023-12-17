let timeout = null
let onTick = null

export function startTimeoutFrom(onTickCallback) {
    stopTimeout()
    onTick = onTickCallback
    timeout = setTimeout(tick, 1000)
}

export function stopTimeout() {
    timeout && clearTimeout(timeout)
    timeout = null
}

function tick() {
    onTick && onTick()
    timeout = setTimeout(tick, 1000)
}