export class Logger {
    #devHostnames = new Set(['localhost', '127.0.0.1', '0.0.0.0']);
    #isDev;

    constructor() {
        this.#isDev = this.#devHostnames.has(window.location.hostname);
    }
    
    log(...args) {
        if (this.#isDev) console.log(...args);
    }
    
    error(...args) {
        if (this.#isDev) console.error(...args);
    }
    
    warn(...args) {
        if (this.#isDev) console.warn(...args);
    }
    
    info(...args) {
        if (this.#isDev) console.info(...args);
    }
}

