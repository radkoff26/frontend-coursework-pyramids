import Store from "../store.js"
import { Mode } from "./mode.js"
import startDynamicGame from "./modes/dynamic_game.js"
import startResizingGame from "./modes/resizing_game.js"
import startStaticGame from "./modes/static_game.js"

function startGame() {
    const mode = localStorage.getItem('current_mode')
    if (!mode) {
        onBackPressed()
        return
    }
    switch (mode) {
        case Mode.Static:
            startStaticGame(new Store(), onBackPressed)
            break
        case Mode.Dynamic:
            startDynamicGame(new Store(), onBackPressed)
            break
        case Mode.Resizing:
            startResizingGame(new Store(), onBackPressed)
            break
    }
}

function onBackPressed() {
    location.assign("..") // TODO: handle last history
}

document.addEventListener('DOMContentLoaded', () => startGame())