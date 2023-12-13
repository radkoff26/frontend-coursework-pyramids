import { Mode } from "./mode.js"
import { getRecord } from "./record.js"

export default function renderMenu() {
    const menu = generateMenuElement(
        getRecord(Mode.Static),
        getRecord(Mode.Dynamic),
        getRecord(Mode.Resizing)
    )
    document.body.insertAdjacentElement('beforeend', menu)
    return menu
}

function generateMenuElement(recordStatic, recordDynamic, recordResizing) {
    const menu = document.createElement('div')
    menu.classList.add('menu')

    const header = document.createElement('h1')
    header.innerText = 'Pyramids'

    const staticGameButton = document.createElement('button')
    staticGameButton.setAttribute('data-mode', Mode.Static)
    staticGameButton.innerHTML = `Режим "Статический" <br> Рекорд: ${recordStatic}`

    const dynamicGameButton = document.createElement('button')
    dynamicGameButton.setAttribute('data-mode', Mode.Dynamic)
    dynamicGameButton.innerHTML = `Режим "Динамический" <br> Рекорд: ${recordDynamic}`

    const resizingGameButton = document.createElement('button')
    resizingGameButton.setAttribute('data-mode', Mode.Resizing)
    resizingGameButton.innerHTML = `Режим "Увеличительный" <br> Рекорд: ${recordResizing}`
    
    menu.insertAdjacentElement('beforeend', header)
    menu.insertAdjacentElement('beforeend', staticGameButton)
    menu.insertAdjacentElement('beforeend', dynamicGameButton)
    menu.insertAdjacentElement('beforeend', resizingGameButton)

    return menu
}