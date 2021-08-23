const { throws } = require('assert');
const Environment = require('jest-environment-jsdom');

/**
 * A custom environment to set the TextEncoder that is required by nats.ws
 * 
 * TODO: This does not seem to be enough. "NatsError: BAD_PAYLOAD" error is still raised during tests.
 */
module.exports = class CustomTestEnvironment extends Environment {
    async setup() {
        await super.setup();
        if (typeof this.global.TextEncoder === 'undefined') {
            const { TextEncoder, TextDecoder } = require('util');
            this.global.TextEncoder = TextEncoder;
            this.global.TextDecoder = TextDecoder
        }
    }
}
