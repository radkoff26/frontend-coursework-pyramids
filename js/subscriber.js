export default class Subscriber {
    #callback

    constructor(callback) {
        this.#callback = callback
    }

    notify(state) {
        this.#callback(state)
    }
}