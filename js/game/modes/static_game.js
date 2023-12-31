import { 
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
import { Difficulty } from "../difficulty.js";
import { getDifficultyMode } from "../../storage.js";

let gameStore = null
let clockElement = null
let onBackPressed = null
let redraw = true
let stickElement = null
let isResultSaved = false

let difficulty = Difficulty.Easy
let pointsIncreaseStep = 1
let timeIncreaseStep = 2

let movingRing = null

const subscriber = new Subscriber(render)

/**
 * @param {Store} store 
 * @param {() => void} onBackPressedCallback 
 */
export default function startStaticGame(store, onBackPressedCallback) {
    redraw = true
    gameStore = store
    difficulty = getDifficultyMode()
    pointsIncreaseStep = getPointsIncreaseStepByDifficulty()
    timeIncreaseStep = getTimeIncreaseStepByDifficulty()
    onBackPressed = onBackPressedCallback
    store.dispatch(state => {
        return {...state, floatingRings: generateInitialFloatingBatch()}
    })
    startTimeoutFrom(() => {
        store.dispatch(state => {
            const timeLeft = state.timeLeft - 1
            const isGameOver = timeLeft === 0
            if (isGameOver) {
                redraw = true
            }
            return {...state, timeLeft, isGameOver}
        })
    })
    store.subscribe(subscriber)
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

function render(state) {
    clockElement && (clockElement.innerText = stringifySeconds(state.timeLeft))
    if (redraw) {
        rerenderRoot()
        const gameField = renderGameField(state.isGameOver)
        clockElement = renderClock(state.timeLeft)
        stickElement = gameField.querySelector('.stick')
        renderRecord(state.pyramidRings.length * pointsIncreaseStep)
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

function rerenderRoot() {
    document.body.removeChild(document.querySelector('#game'))
    const rootElement = document.createElement('div')
    rootElement.id = 'game'
    document.body.insertAdjacentElement('afterbegin', rootElement)
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
    if (!isResultSaved) {
        saveRecord(Mode.Static, gameStore.state.pyramidRings.length * pointsIncreaseStep)
    }
    stopTimeout()
    gameStore.unsubscribe(subscriber)
}

function renderPyramid(state, gameField) {
    const pyramid = gameField.children[0]
    const stand = pyramid.querySelector('.stand')
    console.log(stand)
    stand.addEventListener('dragenter', e => {
        console.log('dragover')
    })
    state.pyramidRings.slice(-5).forEach(ring => {
        renderRingOnPyramid(ring, pyramid)
    })
}

function renderFloatingRings(state, gameField) {
    state.floatingRings.forEach((ring) => {
        const element = renderRingElement(ring, gameField)
        if (!state.isGameOver) {
            element.draggable = true
            element.addEventListener('dragstart', e => {
                e.preventDefault()
                return false
            })
            element.addEventListener('mousedown', e => {
                const index = e.target.getAttribute('data-index')
                if (!index) {
                    return
                }
                movingRing = e.target
                movingRing.classList.toggle('moving', true)
                let shiftX = e.clientX - movingRing.getBoundingClientRect().left;
                let shiftY = e.clientY - movingRing.getBoundingClientRect().top;
                function onMouseUp(e) {
                    console.log('up start');
                    if (!movingRing) {
                        return
                    }
                    const ringIdString = movingRing.getAttribute('data-index')
                    if (!ringIdString) {
                        movingRing = null
                        return
                    }
                    const ringId = Number.parseInt(ringIdString)
                    if (elementIntersectsStick(movingRing)) {
                        putRingOnPyramid(ringId)
                    } else {
                        if (gameStore) {
                            redraw = true
                            render(gameStore.state)
                        }
                    }
                    movingRing.removeEventListener('mouseup', onMouseUp)
                    document.removeEventListener('mousemove', onMouseMove)
                    movingRing.classList.toggle('moving', false)
                    movingRing = null
                    console.log('up end');
                }
                function onMouseMove(e) {
                    if (!movingRing) {
                        return
                    }
                    movingRing.style.left = `${e.clientX - shiftX}px`
                    movingRing.style.top = `${e.clientY - shiftY}px`
                }
                movingRing.addEventListener('mouseup', onMouseUp)
                document.addEventListener('mousemove', onMouseMove)
            })
        }
    });
}

function elementIntersectsStick(element) {
    const stickRect = stickElement.getClientRects()[0]
    const elementRect = element.getClientRects()[0]
    const intersectsX = rangesIntersect(stickRect.left, stickRect.right, elementRect.left, elementRect.right)
    const intersectsY = rangesIntersect(stickRect.top, stickRect.bottom, elementRect.top, elementRect.bottom)
    return intersectsX && intersectsY
}

function rangesIntersect(a1, b1, a2, b2) {
    // First range
    if (isPointInRange(a2, a1, b1) || isPointInRange(b2, a1, b1)) {
        return true
    }
    if (isPointInRange(a1, a2, b2) || isPointInRange(b1, a2, b2)) {
        return true
    }
    return false
}

function isPointInRange(x, a, b) {
    return a <= x && b >= x
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
        const timeLeft = state.timeLeft + timeIncreaseStep
        const pyramidRings = state.pyramidRings
        pyramidRings.push(puttingRing)
        const floatingRings = generateNewFloatingBatch(pyramidRings)
        return {...state, floatingRings, pyramidRings, timeLeft}
    })
}

function generateInitialFloatingBatch() {
    return mapRingSizesToRings([45, 45])
}

function generateNewFloatingBatch(pyramidRings) {
    const peekWidth = pyramidRings.length === 0 ? 50 : pyramidRings[pyramidRings.length - 1].width

    const ringsWidths = []
    if (peekWidth * 2 + 3 < 66) {
        ringsWidths.push(peekWidth)
        ringsWidths.push(peekWidth + 1)
        ringsWidths.push(peekWidth - 1)
    } else {
        ringsWidths.push(peekWidth + 1)
        ringsWidths.push(peekWidth - 1)
    }
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
