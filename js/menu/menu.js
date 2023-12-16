import { renderAuthorizationPopup, renderMenu } from "./menu_renderer.js"
import { Mode } from "../game/mode.js"
import { isUserLoggedIn, saveSessionUser } from "../storage.js"

function toAuthorizationPopup(isClosable) {
    rerenderApp()
    const popup = renderAuthorizationPopup(isClosable)
    const input = popup.querySelector('input')
    const button = popup.querySelector('button')
    button.addEventListener('click', () => {
        const userName = input.value.trim()
        if (userName.length > 0) {
            saveSessionUser(userName)
            toMenu()
        } else {
            alert('Имя пользователя не может быть пустым!')
        }
    })
    if (isClosable) {
        const closeButton = popup.querySelector('.close')
        closeButton.addEventListener('click', () => {
            toMenu()
        })
    }
}

function toRules() {
    
}

function toMenu() {
    rerenderApp()
    const menu = renderMenu()
    const reloginElement = menu.querySelector('.relogin')
    reloginElement.addEventListener('click', () => toAuthorizationPopup(true))
    for (const child of menu.children) {
        child.addEventListener('click', e => {
            const mode = e.target.getAttribute('data-mode')
            if (!mode) {
                return
            }
            switch (mode) {
                case Mode.Static:
                    toStaticGame()
                    break
                case Mode.Dynamic:
                    toDynamicGame()
                    break
                case Mode.Resizing:
                    toResizingGame()
                    break
            }
        })
    }
}

function rerenderApp() {
    document.body.removeChild(document.querySelector('#app'))
    const newAppElement = document.createElement('div')
    newAppElement.id = 'app'
    document.body.insertAdjacentElement('afterbegin', newAppElement)
}

function toStaticGame() {
    localStorage.setItem('current_mode', Mode.Static)
    goToGamePage()
}

function toDynamicGame() {
    localStorage.setItem('current_mode', Mode.Dynamic)
    goToGamePage()
}

function toResizingGame() {
    localStorage.setItem('current_mode', Mode.Resizing)
    goToGamePage()
}

function goToGamePage() {
    window.location.href = "./pages/game.html"
}

function initMenu() {
    if (isUserLoggedIn()) {
        toMenu()
    } else {
        toAuthorizationPopup(false)
    }
}

document.addEventListener('DOMContentLoaded', () => initMenu())