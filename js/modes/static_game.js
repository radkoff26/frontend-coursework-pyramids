import { renderClock, renderGameField, renderGameOverPopup, renderHome, renderRecord, renderRingElement, renderRingOnPyramid } from "../game_renderer.js";
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
let redraw = true

const subscriber = new Subscriber(render)

/**
 * @param {Store} store 
 * @param {() => void} onBackPressedCallback 
 */
export default function startStaticGame(store, onBackPressedCallback) {
    redraw = true
    gameStore = store
    onBackPressed = onBackPressedCallback
    store.dispatch(state => {
        return {...state, floatingRings: generateInitialFloatingBatch()}
    })
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
}

function render(state) {
    clockElement && (clockElement.innerText = stringifySeconds(state.timeLeft))
    if (redraw) {
        document.body.innerHTML = ''
        const gameField = renderGameField(state.isGameOver)
        clockElement = renderClock(state.timeLeft)
        renderRecord(state.pyramidRings.length)
        renderPyramid(state, gameField)
        renderFloatingRings(state, gameField)
        renderHome().addEventListener('click', closeGame)
        if (state.isGameOver) {
            const [homeButton, restartButton] = renderGameOverPopup(state.pyramidRings.length)
            homeButton.addEventListener('click', closeGame)
            restartButton.addEventListener('click', restartGame)
        }
        redraw = false
    }
}

function restartGame() {
    stopGame()
    startStaticGame(new Store(), onBackPressed)
}

function closeGame() {
    stopGame()
    onBackPressed()
}

function stopGame() {
    saveRecord(Mode.Static, gameStore.state.pyramidRings.length)
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
    redraw = true
    gameStore.dispatch(state => {
        const puttingRing = state.floatingRings.find(val => val.id === ringId)
        const lastRing = state.pyramidRings[state.pyramidRings.length - 1]
        if ((lastRing && puttingRing.width > lastRing.width) || puttingRing.width < 4.5) {
            stopTimeout()
            return {...state, isGameOver: true}
        }
        const pyramidRings = state.pyramidRings
        pyramidRings.push(puttingRing)
        const floatingRings = generateNewFloatingBatch(pyramidRings)
        return {...state, floatingRings, pyramidRings}
    })
}

function generateInitialFloatingBatch() {
    return mapRingSizesToRings([20, 75])
}

function generateNewFloatingBatch(pyramidRings) {
    const peekWidth = pyramidRings.length === 0 ? 40 : pyramidRings[pyramidRings.length - 1].width
    
    let newWidth
    if (peekWidth >= 4.5 && peekWidth < 5.5) {
        newWidth = peekWidth
    } else {
        newWidth = peekWidth - 1
    }
    const restPlace = 92 - newWidth
    const randomRatio = 0.25 + Math.random() * 0.15

    const widthForSuitable = newWidth
    const widthForSmaller = restPlace * randomRatio
    const widthForBigger = restPlace * (1 - randomRatio)

    const ringsWidths = []
    ringsWidths.push(widthForSuitable)
    ringsWidths.push(widthForBigger)
    ringsWidths.push(widthForSmaller)
    shuffle(ringsWidths)

    return mapRingSizesToRings(ringsWidths)
}

function mapRingSizesToRings(ringsWidths) {
    let sum = ringsWidths.reduce((prev, curr) => prev + curr)

    let padding = (100 - sum) / (ringsWidths.length + 1)

    let left = padding

    const rings = ringsWidths.map((ringWidth) => {
        gameStore.lastAddedRingId++
        const ring = new Ring(
            gameStore.lastAddedRingId,
            ringWidth,
            left,
            6,
            generateColorHex()
        )
        left += ringWidth + padding
        return ring
    })

    return rings
}

function generateColorHex() {
    const r = (Math.random() * 255).toFixed(0)
    const g = (Math.random() * 255).toFixed(0)
    const b = (Math.random() * 255).toFixed(0)

    return `rgb(${r}, ${g}, ${b})`
}

function shuffle(array) {
    let currentIndex = array.length,  randomIndex
    while (currentIndex > 0) {
        randomIndex = Math.floor(Math.random() * currentIndex)
        currentIndex--
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
    }
}
