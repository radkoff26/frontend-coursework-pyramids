import { Mode, ModeMap } from "../game/mode.js"
import { getAllRecordsByMode } from "../record.js"
import stringifySeconds from "../time.js"

const switches = document.querySelector('.records-modes-switch')
const recordsElement = document.querySelector('.records')
const homeButton = document.querySelector('.home')
let selectedMode = Mode.Static

function initialDraw() {
    for (const [key, mode] of ModeMap) {
        const modeSwitch = renderSwitch(key, mode)
        modeSwitch.addEventListener('click', e => {
            const mode = e.target.getAttribute('data-key')
            if (!mode) {
                return
            }
            selectMode(mode)
        })
        if (key === selectedMode) {
            modeSwitch.classList.add('selected')
        }
    }
    selectMode(selectedMode)
    homeButton.addEventListener('click', () => {
        location.href = '..'
    })
}

function renderSwitch(key, mode) {
    const modeSwitch = document.createElement('div')
    modeSwitch.classList.add('mode')
    modeSwitch.setAttribute('data-key', key)
    modeSwitch.innerText = mode
    switches.appendChild(modeSwitch)
    return modeSwitch
}

function selectMode(mode) {
    selectedMode = mode
    for (const child of switches.children) {
        const childMode = child.getAttribute('data-key')
        child.classList.toggle('selected', childMode === mode)
    }
    recordsElement.innerHTML = ''
    renderRecordsOfMode(mode)
}

function renderRecordsOfMode(mode) {
    const records = getAllRecordsByMode(mode)
    const userSet = new Set()
    const recordsToDisplay = []
    records.forEach(record => {
        if (!userSet.has(record.username)) {
            const userRecords = records
                .filter(val => val.username === record.username)
                .sort(recordsComparator)
            recordsToDisplay.push(userRecords[0])
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
