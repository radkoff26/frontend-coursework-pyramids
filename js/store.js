export default class Store {
    state = {
        floatingRings: [],
        pyramidRings: [],
        isGameOver: false,
        timeLeft: 30
    }
    #subscribers = []
    lastAddedRingId = -1

    dispatch(processor) {
        if (!this.state.isGameOver) {
            this.state = processor(this.#copyState())
            this.#notifySubscribers()
        }
    }

    subscribe(subscriber) {
        this.#subscribers.push(subscriber)
        subscriber.notify(this.state)
    }

    unsubscribe(subscriber) {
        const index = this.#subscribers.indexOf(subscriber)
        this.#subscribers.splice(index, 1)
    }

    #notifySubscribers() {
        this.#subscribers.forEach(subscriber => subscriber.notify(this.state))
    }

    #copyState() {
        return JSON.parse(JSON.stringify(this.state))
    }
}
