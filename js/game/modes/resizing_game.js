import { 
    generateRingElement, 
    renderClock, 
    renderGameField, 
    renderGameOverPopup, 
    renderHome, 
    renderRecord, 
    renderRingElement, 
    renderRingOnPyramid 
} from "../game_renderer.js";
import Store from "../../store.js";
import Ring from "../data/ring.js";
import Subscriber from "../../subscriber.js";
import { startTimeoutFrom, stopTimeout } from "../timeout.js";
import stringifySeconds from "../../time.js";
import { saveRecord } from "../../record.js";
import { Mode } from "../mode.js";
import { getDifficultyMode } from "../../storage.js";
import { Difficulty } from "../difficulty.js";

let gameStore = null
let clockElement = null
let onBackPressed = null
let animationFrame = null
let gameField = null
let redraw = true
let isResultSaved = false
let difficulty = null

// Percents per frame
let resizeStep = 0.5
let speed = 0.25
let pointsIncreaseStep = 1
let timeIncreaseStep = 1
let changeSizeAnimationFrameRequest = null
const subscriber = new Subscriber(render)

/**
 * @param {Store} store 
 * @param {() => void} onBackPressedCallback 
 */
export default function startResizingGame(store, onBackPressedCallback) {
    redraw = true
    difficulty = getDifficultyMode()
    gameStore = store
    timeIncreaseStep = getTimeIncreaseStepByDifficulty()
    pointsIncreaseStep = getPointsIncreaseStepByDifficulty()
    onBackPressed = onBackPressedCallback
    generateNewRing()
    startTimeoutFrom(() => {
        store.dispatch(state => {
            const timeLeft = state.timeLeft - 1
            console.log("Time left: ", timeLeft);
            const isGameOver = timeLeft === 0
            if (isGameOver) {
                redraw = true
            }
            return {...state, timeLeft, isGameOver}
        })
    })
    document.addEventListener('keydown', e => {
        stopSizeChangeRequest()
        if (gameStore && !gameStore.state.isGameOver) {
            if (e.key === 'ArrowUp') {
                changeSizeAnimationFrameRequest = requestAnimationFrame(onGrowing)
            } else if (e.key === 'ArrowDown') {
                changeSizeAnimationFrameRequest = requestAnimationFrame(onShrinking)
            }
        }
    })
    document.addEventListener('keyup', e => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            console.log('keyup');
            stopSizeChangeRequest()
        }
    })
    store.subscribe(subscriber)
    startMovingRing()
}

function stopSizeChangeRequest() {
    changeSizeAnimationFrameRequest && cancelAnimationFrame(changeSizeAnimationFrameRequest)
}

function onGrowing() {
    growAllRingsSize()
    changeSizeAnimationFrameRequest = requestAnimationFrame(onGrowing)
}

function onShrinking() {
    shrinkAllRingsSize()
    changeSizeAnimationFrameRequest = requestAnimationFrame(onShrinking)
}

function getSpeedRangeByDifficulty() {
    switch (difficulty) {
        case Difficulty.Easy:
            return [0.2, 0.35]
        case Difficulty.Medium:
            return [0.35, 0.5]
        case Difficulty.Hard:
            return [0.4, 0.55]
    }
    return [0.35, 0.5]
}

function getPointsIncreaseStepByDifficulty() {
    switch (difficulty) {
        case Difficulty.Easy:
            return 3
        case Difficulty.Medium:
            return 2
        case Difficulty.Hard:
            return 1
    }
    return 2
}

function getTimeIncreaseStepByDifficulty() {
    switch (difficulty) {
        case Difficulty.Easy:
            return 2
        case Difficulty.Medium:
            return 1
        case Difficulty.Hard:
            return 0.5
    }
    return 1
}

function generateNewRing() {
    if (gameStore == null) {
        return
    }
    const [min, max] = getSpeedRangeByDifficulty()
    speed = min + Math.random() * max
    const floatingRings = gameStore.state.floatingRings
    // Generating a ring from 4.5% to 100% width
    let newWidth = 4.5 + Math.random() * 95.5
    const left = 50 - newWidth / 2
    gameStore.lastAddedRingId++
    const newRing = new Ring(
        gameStore.lastAddedRingId,
        newWidth,
        left,
        6,
        generateColorHex()
    )
    floatingRings.push(newRing)
    if (gameField != null) {
        const ringElement = generateRingElement(newRing)
        ringElement.setAttribute('data-index', newRing.id)
        gameField.appendChild(ringElement)
        ringElement.addEventListener('click', e => {
            const id = e.target.getAttribute('data-index')
            if (id == null) {
                return
            }
            growRingSize(Number.parseInt(id))
        })
    }
}

function startMovingRing() {
    animationFrame && cancelAnimationFrame(animationFrame)
    if (gameStore && !gameStore.state.isGameOver) {
        animationFrame = requestAnimationFrame(moveRing)
    }
}

function moveRing() {
    if (gameStore == null) {
        return
    }
    const floatingRings = gameStore.state.floatingRings
    for (let i = 0; i < floatingRings.length; i++) {
        const element = floatingRings[i]
        element.top += speed
        if (element.top >= 65) {
            redraw = true
        }
    }
    if (redraw) {
        generateNewRing()
        gameStore.dispatch(state => {
            let current = state
            const putOnRings = current.floatingRings.filter(ring => ring.top >= 65)
            putOnRings.forEach(val => {
                current = putRingOnPyramid(state, val.id)
            })
            current.floatingRings = current.floatingRings.filter(ring => ring.top < 65)
            return current
        })
    }
    rerenderFloatingRings(floatingRings)
    startMovingRing()
}

function rerenderFloatingRings(floatingRings) {
    if (gameField == null) {
        return
    }
    for (const child of gameField.children) {
        const attr = child.getAttribute('data-index')
        if (attr == null) {
            continue
        }
        const index = Number.parseInt(attr)
        const ring = floatingRings.find(val => val.id === index)
        child.style.top = `${ring.top}%`
    }
}

function render(state) {
    clockElement && (clockElement.innerText = stringifySeconds(state.timeLeft))
    if (redraw) {
        stopRequestAnimation()
        rerenderRoot()
        gameField = renderGameField(state.isGameOver)
        clockElement = renderClock(state.timeLeft)
        renderRecord(state.pyramidRings.length * pointsIncreaseStep)
        renderPyramid(state, gameField)
        renderHome().addEventListener('click', closeGame)
        if (state.isGameOver) {
            stopGame()
            const [homeButton, restartButton] = renderGameOverPopup(state.pyramidRings.length)
            homeButton.addEventListener('click', closeGame)
            restartButton.addEventListener('click', restartGame)
        } else {
            renderFloatingRings(state, gameField)
            startMovingRing()
        }
        redraw = false
    }
}

function rerenderRoot() {
    document.body.removeChild(document.querySelector('#game'))
    const rootElement = document.createElement('div')
    rootElement.id = 'game'
    document.body.insertAdjacentElement('afterbegin', rootElement)
}

function restartGame() {
    stopGame()
    startResizingGame(new Store(), onBackPressed)
}

function closeGame() {
    stopGame()
    onBackPressed()
}

function stopRequestAnimation() {
    animationFrame && cancelAnimationFrame(animationFrame)
    animationFrame = null
}

function stopGame() {
    stopSizeChangeRequest()
    stopRequestAnimation()
    if (!isResultSaved) {
        saveRecord(Mode.Resizing, gameStore.state.pyramidRings.length * pointsIncreaseStep)
    }
    stopTimeout()
    gameStore.unsubscribe(subscriber)
}

function renderPyramid(state, gameField) {
    const pyramid = gameField.children[0]
    state.pyramidRings.slice(-5).forEach(ring => {
        renderRingOnPyramid(ring, pyramid)
    })
}

function renderFloatingRings(state, gameField) {
    state.floatingRings.forEach((ring) => {
        const element = renderRingElement(ring, gameField)
        if (!state.isGameOver) {
            element.addEventListener('click', e => {
                const index = e.target.getAttribute('data-index')
                if (!index) {
                    return
                }
                growRingSize(Number.parseInt(index))
            })
        }
    });
}

function growRingSize(ringId) {
    const floatingRings = gameStore.state.floatingRings
    const puttingRing = floatingRings.find(val => val.id === ringId)
    const diff = puttingRing.width + 1
    if (diff > 100) {
        return
    }
    puttingRing.width = diff
    puttingRing.left = 50 - puttingRing.width / 2
    const ringElement = document.querySelector(`[data-index="${ringId}"`)
    ringElement.style.width = `${puttingRing.width}%`
    ringElement.style.left = `${puttingRing.left}%`
}

function growAllRingsSize() {
    changeAllRingsSize(resizeStep)
}

function shrinkAllRingsSize() {
    changeAllRingsSize(-resizeStep)
}

function changeAllRingsSize(delta) {
    const floatingRings = gameStore.state.floatingRings
    floatingRings.forEach(val => {
        const diff = val.width + delta
        if (diff >= 4.5 && diff <= 100) {
            val.width = diff
            val.left = 50 - val.width / 2
            const ringElement = document.querySelector(`[data-index="${val.id}"`)
            ringElement.style.width = `${val.width}%`
            ringElement.style.left = `${val.left}%`
        }
    })
}

function putRingOnPyramid(state, ringId) {
    const puttingRing = state.floatingRings.find(val => val.id === ringId)
    const ringIndex = state.floatingRings.indexOf(puttingRing)
    const lastRing = state.pyramidRings[state.pyramidRings.length - 1]
    if ((lastRing && puttingRing.width > lastRing.width) || puttingRing.width < 4.5) {
        stopTimeout()
        redraw = true
        return {...state, isGameOver: true}
    }
    const timeLeft = state.timeLeft + timeIncreaseStep
    const pyramidRings = state.pyramidRings
    pyramidRings.push(puttingRing)
    const floatingRings = state.floatingRings
    floatingRings.splice(ringIndex, 1)
    return {...state, floatingRings, pyramidRings, timeLeft}
}

function generateColorHex() {
    const r = (Math.random() * 255).toFixed(0)
    const g = (Math.random() * 255).toFixed(0)
    const b = (Math.random() * 255).toFixed(0)

    return `rgb(${r}, ${g}, ${b})`
}
