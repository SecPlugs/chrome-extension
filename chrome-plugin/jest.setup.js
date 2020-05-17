Object.assign(global, require('@bumble/jest-chrome'))
Object.defineProperty(document, 'currentScript', {
    value: document.createElement('script'),
});