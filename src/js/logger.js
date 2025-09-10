class Logger {
    constructor() {
        this.isDev = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname === '0.0.0.0';
    }
    
    log(...args) {
        if (this.isDev) console.log(...args);
    }
    
    error(...args) {
        if (this.isDev) console.error(...args);
    }
    
    warn(...args) {
        if (this.isDev) console.warn(...args);
    }
    
    info(...args) {
        if (this.isDev) console.info(...args);
    }
}

if (!window.logger) {
    window.logger = new Logger();
}

