import { Difficulty, DifficultyMap } from "../game/difficulty.js"
import { Mode, ModeMap } from "../game/mode.js"
import { getAllRecordsByMode } from "../record.js"
import stringifySeconds from "../time.js"

const switches = document.querySelector('.records-modes-switch')
const recordsElement = document.querySelector('.records')
const homeButton = document.querySelector('.home')
const difficultySelect = document.querySelector('#difficulty')
let selectedMode = Mode.Static
let selectedDifficulty = Difficulty.Easy

function initialDraw() {
    for (const [key, mode] of ModeMap) {
        const modeSwitch = renderSwitch(key, mode)
        modeSwitch.addEventListener('click', e => {
            const mode = e.target.getAttribute('data-key')
            if (!mode) {
                return
            }
            selectMode(mode, selectedDifficulty)
        })
        if (key === selectedMode) {
            modeSwitch.classList.add('selected')
        }
    }
    selectMode(selectedMode, selectedDifficulty)
    homeButton.addEventListener('click', () => {
        location.href = '..'
    })
    DifficultyMap.forEach((value, key) => {
        const option = buildOption(key, value)
        if (key === selectedDifficulty) {
            option.selected = true
        }
        difficultySelect.appendChild(option)
    })
    difficultySelect.addEventListener('change', () => {
        const difficulty = difficultySelect.value
        selectMode(selectedMode, difficulty)
    })
}

function buildOption(value, text) {
    const option = document.createElement('option')
    option.value = value
    option.innerText = text
    return option
}

function renderSwitch(key, mode) {
    const modeSwitch = document.createElement('div')
    modeSwitch.classList.add('mode')
    modeSwitch.setAttribute('data-key', key)
    modeSwitch.innerText = mode
    switches.appendChild(modeSwitch)
    return modeSwitch
}

function selectMode(mode, difficulty) {
    selectedMode = mode
    selectedDifficulty = difficulty
    for (const child of switches.children) {
        const childMode = child.getAttribute('data-key')
        child.classList.toggle('selected', childMode === mode)
    }
    recordsElement.innerHTML = ''
    renderRecordsOfMode(mode, difficulty)
}

function renderRecordsOfMode(mode, difficulty) {
    const records = getAllRecordsByMode(mode)
    const userSet = new Set()
    const recordsToDisplay = []
    records.forEach(record => {
        if (!userSet.has(record.username)) {
            const userRecords = records
                .filter(val => val.username === record.username && val.difficulty === difficulty)
                .sort(recordsComparator)
            if (userRecords.length > 0) {
                recordsToDisplay.push(userRecords[0])
            }
        }
        userSet.add(record.username)
    })
    recordsToDisplay.sort(recordsComparator)
    recordsToDisplay.forEach((record, index) => {
        const recordElement = buildRecordElement(record)
        switch (index) {
            case 0:
                recordElement.classList.add('first')
                break
            case 1:
                recordElement.classList.add('second')
                break
            case 2:
                recordElement.classList.add('third')
                break
        }
        recordsElement.appendChild(recordElement)
    })
}

function recordsComparator(a, b) {
    const compareResult = b.result - a.result
    if (compareResult === 0) {
        return a.timeout - b.timeout
    }
    return compareResult
}

function buildRecordElement(record) {
    const recordElement = document.createElement('div')
    recordElement.classList.add('record')

    const line = document.createElement('div')
    line.classList.add('line')

    const user = document.createElement('div')
    user.classList.add('user')
    user.innerText = record.username

    const result = document.createElement('div')
    result.classList.add('result')
    result.innerText = `Результат: ${record.result}`

    const timeout = document.createElement('div')
    timeout.classList.add('timer')
    timeout.innerText = `За время: ${stringifySeconds(record.timeout)}`

    line.appendChild(user)
    line.appendChild(result)
    recordElement.append(line)
    recordElement.append(timeout)

    return recordElement
}

document.addEventListener('DOMContentLoaded', () => initialDraw())
