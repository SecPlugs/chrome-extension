Object.assign(global, require('jest-chrome'));
Object.defineProperty(document, 'currentScript', {
    value: document.createElement('script'),
});
