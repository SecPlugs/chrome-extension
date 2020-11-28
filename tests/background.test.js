afterEach(() => {
    jest.clearAllMocks();
});

const background = require('../background.js')
const utils = require('../modules/utils.js')

describe('test chrome onInstalled event', () => {
    it('test chrome.storage.local.set is called', () => {
        const listenerSpy = jest.fn()
        chrome.runtime.onInstalled.addListener(listenerSpy)
        chrome.runtime.onInstalled.callListeners({reason: "install"})
        
        expect(listenerSpy).toBeCalledWith({reason: "install"})
        expect(chrome.storage.local.set).toBeCalledWith({"secplug_scan_opt": "passive"}, null)
    })

    it('test chrome.storage.local.set is not called', () => {
        const listenerSpy = jest.fn()
        chrome.runtime.onInstalled.addListener(listenerSpy)
        chrome.runtime.onInstalled.callListeners({reason: "updated"})
        
        expect(listenerSpy).toBeCalledWith({reason: "updated"})
        expect(chrome.storage.local.set).not.toBeCalled()
    })
})

describe('test chrome onMessage event', () => {
    it('test chrome.runtime.onMessage is called', () => {
        const messageListenerSpy = jest.fn()
        const sendResponse = jest.fn()
        let response = [{tabId: 1, url: "http://invalid.com"}]
        let message = {active: true}

        chrome.tabs.query.mockImplementation((message, callback) => callback(response))
        chrome.runtime.onMessage.addListener(messageListenerSpy)
        chrome.runtime.onMessage.callListeners({action: "scan_url"}, null, sendResponse)        
        expect(messageListenerSpy).toBeCalledWith({action: "scan_url"}, null, sendResponse)
        expect(chrome.storage.local.get).toBeCalled()
    })
    it('test action is not scan_url', () => {
        const messageListenerSpy = jest.fn()
        const sendResponse = jest.fn()
        let response = [{tabId: 1, url: "http://invalid.com"}]
        let message = {active: true}

        chrome.tabs.query.mockImplementation((message, callback) => callback(response))
        chrome.runtime.onMessage.addListener(messageListenerSpy)
        chrome.runtime.onMessage.callListeners({action: "not_scan_url"}, null, sendResponse)        
        expect(messageListenerSpy).toBeCalledWith({action: "not_scan_url"}, null, sendResponse)
        expect(chrome.storage.local.get).not.toBeCalled()
    })
})

describe('test chrome onUpdated event', () => {
    it('test chrome.tabs.onUpdated is called', () => {
        const updatedListenerSpy = jest.fn()
        let response = {"secplug_scan_opt": "passive"}
        chrome.storage.local.get.mockImplementation(
            (message, callback) => {
                callback(response)
            }
        )
        chrome.tabs.onUpdated.addListener(updatedListenerSpy)
        chrome.tabs.onUpdated.callListeners(1, {url: "http://invalid.com"}, null)
        expect(updatedListenerSpy).toBeCalledWith(1, {url: "http://invalid.com"}, null)
        expect(chrome.storage.local.get).toBeCalled()        
    })

    it('test scanopt is not passive', () => {
        const updatedListenerSpy = jest.fn()
        let response = {"secplug_scan_opt": "invalid"}
        chrome.storage.local.get.mockImplementation(
            (message, callback) => {
                callback(response)
            }
        )
        chrome.tabs.onUpdated.addListener(updatedListenerSpy)
        chrome.tabs.onUpdated.callListeners(1, {url: "http://invalid.com"}, null)
        expect(updatedListenerSpy).toBeCalledWith(1, {url: "http://invalid.com"}, null)
        expect(chrome.storage.local.get).toBeCalled()
    })
})

