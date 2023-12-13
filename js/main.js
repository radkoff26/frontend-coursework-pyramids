import renderMenu from "./menu.js"
import { Mode } from "./mode.js"
import startDynamicGame from "./modes/dynamic_game.js"
import startResizingGame from "./modes/resizing_game.js"
import startStaticGame from "./modes/static_game.js"
import Store from "./store.js"

function toMenu() {
    document.body.innerHTML = ''
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

function toStaticGame() {
    startStaticGame(new Store(), onBackPressed)
}

function toDynamicGame() {
    startDynamicGame(new Store(), onBackPressed)
}

function toResizingGame() {
    startResizingGame(new Store(), onBackPressed)
}

function onBackPressed() {
    toMenu()
}

toMenu()