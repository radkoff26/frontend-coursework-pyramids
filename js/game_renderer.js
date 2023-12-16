import stringifySeconds from "./time.js"

export function renderGameField(isGameOver) {
    const game = document.createElement('div')
    game.classList.add('game')
    if (!isGameOver) {
        game.classList.add('running')
    }

    const pyramid = document.createElement('div')
    pyramid.classList.add('pyramid')

    const stand = document.createElement('div')
    stand.classList.add('stand')

    const stick = document.createElement('div')
    stick.classList.add('stick')
    
    stand.appendChild(stick)
    pyramid.appendChild(stand)
    game.appendChild(pyramid)
    document.body.insertAdjacentElement('beforeend', game)

    return game
}

export function renderGameOverPopup(record) {
    const popupContainer = document.createElement('div')
    popupContainer.classList.add('popup-container')

    const popup = document.createElement('div')
    popup.classList.add('popup')
    
    const title = document.createElement('h1')
    title.classList.add('title')
    title.innerText = 'Игра окончена!'

    const result = document.createElement('h2')
    result.classList.add('result')
    result.innerText = `Рекорд: ${record}`

    const homeButton = document.createElement('div')
    homeButton.classList.add('button')
    homeButton.innerText = 'Закончить'

    const restartButton = document.createElement('div')
    restartButton.classList.add('button')
    restartButton.innerText = 'Заново'

    popup.appendChild(title)
    popup.appendChild(result)
    popup.appendChild(homeButton)
    popup.appendChild(restartButton)
    popupContainer.appendChild(popup)
    document.body.appendChild(popupContainer)

    return [homeButton, restartButton]
}

export function renderClock(timeLeft) {
    const clockElement = document.createElement('div')
    clockElement.classList.add('clock')

    clockElement.innerText = stringifySeconds(timeLeft)

    document.body.appendChild(clockElement)

    return clockElement
}

export function renderRecord(record) {
    const recordElement = document.createElement('div')
    recordElement.classList.add('record')

    recordElement.innerText = `Рекорд: ${record}`

    document.body.appendChild(recordElement)
}

export function renderHome() {
    const homeElement = document.createElement('div')
    homeElement.classList.add('home')

    document.body.appendChild(homeElement)

    return homeElement
}

export function renderRingOnPyramid(ring, pyramid) {
    const ringElement = generateRingElement(ring)

    pyramid.appendChild(ringElement)
}

export function renderRingElement(ring, gameField) {
    const ringElement = generateRingElement(ring)

    ringElement.setAttribute('data-index', ring.id)
    gameField.appendChild(ringElement)

    return ringElement
}

export function generateRingElement(ring) {
    const ringElement = document.createElement('div')
    ringElement.classList.add('pyramid-ring')

    ringElement.style.width = `${ring.width}%`
    ringElement.style.left = `${ring.left}%`
    ringElement.style.top = `${ring.top}%`
    ringElement.style.backgroundColor = ring.colorHex

    return ringElement
}
