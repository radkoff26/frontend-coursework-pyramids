import { Difficulty } from "./game/difficulty.js"

// User
export function isUserLoggedIn() {
    return localStorage.getItem('user') !== null
}

export function saveSessionUser(user) {
    localStorage.setItem('user', user)
}

export function getSessionUser() {
    return localStorage.getItem('user') || 'Anonymous'
}

// Settings
export function getDifficultyMode() {
    return localStorage.getItem('difficulty') || Difficulty.Easy
}

export function setDifficultyMode(difficulty) {
    localStorage.setItem('difficulty', difficulty)
}

export function getGameTime() {
    return localStorage.getItem('timeout') || 30
}

export function setGameTime(timeout) {
    localStorage.setItem('timeout', timeout)
}
