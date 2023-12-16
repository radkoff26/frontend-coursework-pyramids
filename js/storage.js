export function isUserLoggedIn() {
    return localStorage.getItem('user') !== null
}

export function saveSessionUser(user) {
    localStorage.setItem('user', user)
}

export function getSessionUser() {
    return localStorage.getItem('user') || 'Anonymous'
}

export function setGameTime(timeout) {
    localStorage.setItem('timeout', timeout)
}

export function getGameTime() {
    return localStorage.getItem('timeout') || 30
}
