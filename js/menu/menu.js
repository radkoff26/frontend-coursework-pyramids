import { renderAuthorizationPopup, renderMenu } from "./menu_renderer.js"
import { Mode } from "../game/mode.js"
import startDynamicGame from "../game/modes/dynamic_game.js"
import startResizingGame from "../game/modes/resizing_game.js"
import startStaticGame from "../game/modes/static_game.js"
import Store from "../store.js"
import { isUserLoggedIn, saveSessionUser } from "../storage.js"

function toAuthorizationPopup() {
    rerenderApp()
    const popup = renderAuthorizationPopup()
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
}

function toRules() {
    
}

function toMenu() {
    rerenderApp()
    const menu = renderMenu()
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
        toAuthorizationPopup()
    }
}

document.addEventListener('DOMContentLoaded', () => initMenu())