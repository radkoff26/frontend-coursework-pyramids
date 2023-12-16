import { DifficultyMap } from "../game/difficulty.js"
import { getDifficultyMode, getGameTime, setDifficultyMode, setGameTime } from "../storage.js"

const timerField = document.querySelector('#timer')
const difficultySelect = document.querySelector('#difficulty')
const saveButton = document.querySelector('.save')
const homeButton = document.querySelector('.home')

saveButton.addEventListener('click', () => {
    if (areFieldsValid()) {
        saveOptions()
        back()
    }
})

function init() {
    const timer = getGameTime()
    timerField.value = timer
    const selectedDifficulty = getDifficultyMode()
    DifficultyMap.forEach((value, key) => {
        const option = buildOption(key, value)
        if (selectedDifficulty === key) {
            option.selected = true
        }
        difficultySelect.appendChild(option)
    })
}

function buildOption(value, text) {
    const option = document.createElement('option')
    option.value = value
    option.innerText = text
    return option
}

function areFieldsValid() {
    const timerValue = timerField.value
    if (timerValue === '') {
        alert('Значение таймера не может быть пустым!')
        return false
    }
    const timer = Number.parseInt(timerValue)
    if (timer < 1) {
        alert('Значение таймера должно быть больше нуля!')
        return false
    }
    const selected = difficultySelect.value
    if (!DifficultyMap.has(selected)) {
        alert('Должна быть указана существующая сложность игры!')
        return false
    }
    return true
}

function saveOptions() {
    const timer = Number.parseInt(timerField.value)
    const selected = difficultySelect.value
    setGameTime(timer)
    setDifficultyMode(selected)
}

function back() {
    location.href = '..'
}

document.addEventListener('DOMContentLoaded', () => init())
homeButton.addEventListener('click', () => back())
