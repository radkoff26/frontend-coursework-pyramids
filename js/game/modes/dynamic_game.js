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
import stringifySeconds from "../time.js";
import { saveRecord } from "../../record.js";
import { Mode } from "../mode.js";

let gameStore = null
let clockElement = null
let onBackPressed = null
let animationFrame = null
let intervalHandle = null
let gameField = null
let redraw = true

// Percents per frame
const speed = 0.25
const subscriber = new Subscriber(render)

/**
 * @param {Store} store 
 * @param {() => void} onBackPressedCallback 
 */
export default function startDynamicGame(store, onBackPressedCallback) {
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
    store.subscribe(subscriber)
    startMovingRings()
    intervalHandle = setInterval(generateNewRing, 2000)
}

function generateNewRing() {
    if (gameStore == null) {
        return
    }
    const floatingRings = gameStore.state.floatingRings
    const lastRingWidth = floatingRings.length === 0 ? 100 : floatingRings[floatingRings.length - 1].width
    let newWidth
    if (Math.random() > 0.5) {
        newWidth = 4.5 + Math.random() * (lastRingWidth - 4.5)
    } else {
        newWidth = 4.5 + Math.random() * 95.5
    }
    const left = Math.random() * (100 - newWidth)
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
            putRingOnPyramid(Number.parseInt(id))
        })
    }
}

function startMovingRings() {
    animationFrame && cancelAnimationFrame(animationFrame)
    animationFrame = requestAnimationFrame(moveRings)
}

function moveRings() {
    if (gameStore == null) {
        return
    }
    const floatingRings = gameStore.state.floatingRings
    for (let i = 0; i < floatingRings.length; i++) {
        const element = floatingRings[i]
        element.top += speed
        if (element.top >= 120) {
            setRedraw()
        }
    }
    if (redraw) {
        gameStore.dispatch(state => {
            state.floatingRings = state.floatingRings.filter(ring => ring.top < 120)
            return state
        })
    }
    rerenderFloatingRings(floatingRings)
    startMovingRings()
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
        renderRecord(state.pyramidRings.length)
        renderPyramid(state, gameField)
        renderFloatingRings(state, gameField)
        renderHome().addEventListener('click', closeGame)
        if (state.isGameOver) {
            stopGame()
            const [homeButton, restartButton] = renderGameOverPopup(state.pyramidRings.length)
            homeButton.addEventListener('click', closeGame)
            restartButton.addEventListener('click', restartGame)
        }
        startMovingRings()
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
    startDynamicGame(new Store(), onBackPressed)
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
    intervalHandle && clearInterval(intervalHandle)
    stopRequestAnimation()
    saveRecord(Mode.Dynamic, gameStore.state.pyramidRings.length)
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
                putRingOnPyramid(Number.parseInt(index))
            })
        }
    });
}

function putRingOnPyramid(ringId) {
    setRedraw()
    gameStore.dispatch(state => {
        const puttingRing = state.floatingRings.find(val => val.id === ringId)
        const ringIndex = state.floatingRings.indexOf(puttingRing)
        const lastRing = state.pyramidRings[state.pyramidRings.length - 1]
        if ((lastRing && puttingRing.width > lastRing.width) || puttingRing.width < 4.5) {
            stopTimeout()
            return {...state, isGameOver: true}
        }
        const pyramidRings = state.pyramidRings
        pyramidRings.push(puttingRing)
        const floatingRings = state.floatingRings
        floatingRings.splice(ringIndex, 1)
        return {...state, floatingRings, pyramidRings}
    })
}

function setRedraw() {
    redraw = true
    stopRequestAnimation()
}

function generateColorHex() {
    const r = (Math.random() * 255).toFixed(0)
    const g = (Math.random() * 255).toFixed(0)
    const b = (Math.random() * 255).toFixed(0)

    return `rgb(${r}, ${g}, ${b})`
}
