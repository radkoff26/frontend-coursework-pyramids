import { generateRingElement, renderClock, renderGameField, renderGameOverPopup, renderHome, renderRecord, renderRingElement, renderRingOnPyramid } from "../game_renderer.js";
import Store from "../store.js";
import Ring from "../data/ring.js";
import Subscriber from "../subscriber.js";
import { startTimeoutFrom, stopTimeout } from "../timeout.js";
import stringifySeconds from "../time.js";
import { saveRecord } from "../record.js";
import { Mode } from "../mode.js";

let gameStore = null
let clockElement = null
let onBackPressed = null
let animationFrame = null
let gameField = null
let redraw = true

// Percents per frame
let speed = 0.25
const subscriber = new Subscriber(render)

/**
 * @param {Store} store 
 * @param {() => void} onBackPressedCallback 
 */
export default function startResizingGame(store, onBackPressedCallback) {
    redraw = true
    gameStore = store
    onBackPressed = onBackPressedCallback
    generateNewRing()
    startTimeoutFrom(store.state.timeLeft, () => {
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
    document.addEventListener('keyup', e => {
        if (e.key === ' ') {
            if (gameStore && !gameStore.state.isGameOver) {
                growAllRingsSize()
            }
        }
    })
    store.subscribe(subscriber)
    startMovingRing()
}

function generateNewRing() {
    if (gameStore == null) {
        return
    }
    speed = 0.1 + Math.random() * 0.4
    const floatingRings = gameStore.state.floatingRings
    const lastRingWidth = floatingRings.length === 0 ? 100 : floatingRings[floatingRings.length - 1].width
    let newWidth = 4.5 + Math.random() * (lastRingWidth - 4.5)
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
        document.body.innerHTML = ''
        gameField = renderGameField(state.isGameOver)
        clockElement = renderClock(state.timeLeft)
        renderRecord(state.pyramidRings.length)
        renderPyramid(state, gameField)
        renderFloatingRings(state, gameField)
        renderHome().addEventListener('click', closeGame)
        if (state.isGameOver) {
            stopGame()
            const [homeButton, restartButton] = renderGameOverPopup(state.pyramidRings.length)
            homeButton.addEventListener('click', closeGame)
            restartButton.addEventListener('click', restartGame)
        } else {
            startMovingRing()
        }
        redraw = false
    }
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
    stopRequestAnimation()
    saveRecord(Mode.Resizing, gameStore.state.pyramidRings.length)
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
    puttingRing.width += 1
    puttingRing.left = 50 - puttingRing.width / 2
    const ringElement = document.querySelector(`[data-index="${ringId}"`)
    ringElement.style.width = `${puttingRing.width}%`
    ringElement.style.left = `${puttingRing.left}%`
}

function growAllRingsSize() {
    const floatingRings = gameStore.state.floatingRings
    floatingRings.forEach(val => {
        val.width += 1
        val.left = 50 - val.width / 2
        const ringElement = document.querySelector(`[data-index="${val.id}"`)
        ringElement.style.width = `${val.width}%`
        ringElement.style.left = `${val.left}%`
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
    const pyramidRings = state.pyramidRings
    pyramidRings.push(puttingRing)
    const floatingRings = state.floatingRings
    floatingRings.splice(ringIndex, 1)
    return {...state, floatingRings, pyramidRings}
}

function generateColorHex() {
    const r = (Math.random() * 255).toFixed(0)
    const g = (Math.random() * 255).toFixed(0)
    const b = (Math.random() * 255).toFixed(0)

    return `rgb(${r}, ${g}, ${b})`
}
