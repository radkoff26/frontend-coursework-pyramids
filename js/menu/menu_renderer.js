import { Mode } from "../game/mode.js"
import { getRecord } from "../record.js"
import { getSessionUser } from "../storage.js"

export function renderMenu() {
    const user = getSessionUser()
    const menu = generateMenuElement(
        getRecord(Mode.Static, user),
        getRecord(Mode.Dynamic, user),
        getRecord(Mode.Resizing, user)
    )
    document.getElementById('app').appendChild(menu)
    return menu
}

export function renderAuthorizationPopup(isClosable) {
    const auth = document.createElement('div')
    auth.classList.add('auth')

    const popup = document.createElement('div')
    popup.classList.add('auth-popup')
    
    const input = document.createElement('input')
    input.placeholder = 'Имя'
    
    const button = document.createElement('button')
    button.innerText = 'Войти'

    if (isClosable) {
        const closeButton = document.createElement('div')
        closeButton.classList.add('close')
        closeButton.innerHTML = '&times;'
        popup.appendChild(closeButton)
    }

    popup.appendChild(input)
    popup.appendChild(button)
    auth.appendChild(popup)
    document.getElementById('app').appendChild(auth)
    
    return popup
}

function generateMenuElement(recordStatic, recordDynamic, recordResizing) {
    const menu = document.createElement('div')
    menu.classList.add('menu')

    const header = document.createElement('h1')
    header.innerText = 'Pyramids'

    const linksContainer = document.createElement('div')
    linksContainer.classList.add('links-container')

    const recordsLink = document.createElement('a')
    recordsLink.href = './pages/records.html'
    recordsLink.innerText = 'Рекорды'

    const rulesLink = document.createElement('a')
    rulesLink.href = './pages/rules.html'
    rulesLink.innerText = 'Правила игры'

    const relogin = document.createElement('div')
    relogin.classList.add('relogin')
    relogin.innerText = 'Сменить аккаунт'

    const staticGameButton = document.createElement('button')
    staticGameButton.setAttribute('data-mode', Mode.Static)
    staticGameButton.innerHTML = `Режим "Статический" <br> Рекорд: ${recordStatic}`

    const dynamicGameButton = document.createElement('button')
    dynamicGameButton.setAttribute('data-mode', Mode.Dynamic)
    dynamicGameButton.innerHTML = `Режим "Динамический" <br> Рекорд: ${recordDynamic}`

    const resizingGameButton = document.createElement('button')
    resizingGameButton.setAttribute('data-mode', Mode.Resizing)
    resizingGameButton.innerHTML = `Режим "Увеличительный" <br> Рекорд: ${recordResizing}`
    
    linksContainer.appendChild(recordsLink)
    linksContainer.appendChild(rulesLink)
    menu.appendChild(linksContainer)
    menu.appendChild(relogin)
    menu.appendChild(header)
    menu.appendChild(staticGameButton)
    menu.appendChild(dynamicGameButton)
    menu.appendChild(resizingGameButton)

    return menu
}