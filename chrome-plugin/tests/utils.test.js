afterEach(() => {
    jest.clearAllMocks();
 });
 
const utils = require('../modules/utils')

describe('Test getKey in utils.js', () => {
    it('Test reject', () => {
        const message = ['a']
        const response = "b"
        chrome.storage.local.get.mockImplementation(
            (message, callback) => {
                callback(response)
            }
        )
        return utils.getKey().catch(data => {        
            expect(data).toEqual("API Key needs to be set")
        })
    })
    
    it('Test resolve', () => {
        const message = ['a']
        const response = {"secplug_api_key": "invalid_key"}
        chrome.storage.local.get.mockImplementation(
            (message, callback) => {
                callback(response)
            }
        )
        return utils.getKey().then(data => {        
            expect(data).toEqual("invalid_key")
        })
    })
})

describe('Test setKey in utils.js', ()=> {
    it('setKey in local storage', () => {
        let div = document.createElement('div')
        div.setAttribute("id", "secplug-input-div")
        let input = document.createElement('input')
        input.setAttribute("id", "secplug-input-box")
        input.setAttribute("value", "new_key")
        div.appendChild(input)
        document.body.appendChild(div)
        utils.setKey()
        expect(chrome.storage.local.set).toHaveBeenCalledWith({"secplug_api_key": "new_key"}, null)

        div = document.createElement('div')
        div.setAttribute("id", "secplug-input-div")
        input = document.createElement('input')
        input.setAttribute("id", "secplug-input-box")
        input.setAttribute("value", "")
        div.appendChild(input)
        document.body.appendChild(div)
        utils.setKey()
        expect(chrome.storage.local.set).not.toHaveBeenCalledWith()
    })
})

describe('Test setDefaultAPIKey in utils.js', () => {
    it('setKey in local storage', () => {
        utils.setDefaultApiKey()
        expect(chrome.storage.local.set).toHaveBeenCalledWith({"secplug_api_key": "2VJIWQkIm67Dsk5Hl5jAB8vPPYSxhNun3ftKYxsl"}, null)
    })
})

describe('Test closeDiv in utils.js', () => {
    const originalDoc = global.document;
    const getElementById = jest.fn();
    beforeEach(() => {
        global.document.getElementById = getElementById;
    });
    afterAll(() => {
        global.document = originalDoc;
    })

    it('closeDiv will remove an element from DOM', () => {  
        const div = document.createElement('div')
        div.setAttribute("id", "secplug-input-div")      
        document.body.appendChild(div)
        const divParams = { "id": "secplug-input-div" }
        getElementById.mockReturnValue(divParams);
        utils.closeDiv("secplug-input-div")        
        expect(document.getElementById).toHaveBeenCalledWith("secplug-input-div")
    })
})

describe("setScan in utils.js", () => {
    it('test if secplug_scan_opt gets set', () => {
        utils.setScan("my-option")
        expect(chrome.storage.local.set).toHaveBeenCalledWith({"secplug_scan_opt": "my-option"}, null)
    })
})

describe('Test getScan in utils.js', () => {
    it('Test reject', () => {
        const message = ['a']
        const response = "b"
        chrome.storage.local.get.mockImplementation(
            (message, callback) => {
                callback(response)
            }
        )
        return utils.getScan().catch(data => {        
            expect(data).toEqual("Scan Option not selected")
        })
    })
    
    it('Test resolve', () => {
        const message = ['a']
        const response = {"secplug_scan_opt": "invalid_opt"}
        chrome.storage.local.get.mockImplementation(
            (message, callback) => {
                callback(response)
            }
        )
        return utils.getScan().then(data => {
            expect(data).toEqual("invalid_opt")
        })
    })
})

describe('Test doScan in utils.js', () => {
    it('url includes chrome', () => {
        let url = "chrome-url"
        let tabId = 1
        console.log = jest.fn()
        utils.doScan(url, tabId)
        expect(console.log).toHaveBeenCalledWith(url + ' is not to be scanned')
    })

    it('url doesnt include chrome', async() => {
        let url = "http://invalid.com"
        let tabId = 1
        
        const response = {"secplug_api_key": "invalid_key"}
        chrome.storage.local.get.mockImplementation(
            (message, callback) => {
                callback(response)
            }
        )
        global.fetch = jest.fn()
        let headers = {
            "accept": "application/json",
            "x-api-key": "invalid_key"
        }
        await utils.doScan(url, tabId)
        expect(global.fetch).toHaveBeenCalledWith(url, {method: "GET", headers: headers})
        global.fetch.mockClear();
        delete global.fetch        

        let responseBody = {response: {data: 20}}
        global.fetch = jest.fn(() => Promise.resolve({
            'status': 200,
            json: () => JSON.parse('{"score": 20}'),
            ok: true

        }))
        await utils.doScan(url, tabId)
        expect(global.fetch).toHaveBeenCalledWith(url, {method: "GET", headers: headers})

        global.fetch = jest.fn(() => Promise.resolve({
            'status': 200,
            json: () => JSON.parse('{"score": 50}'),
            ok: true

        }))
        await utils.doScan(url, tabId)
        expect(global.fetch).toHaveBeenCalledWith(url, {method: "GET", headers: headers})

        global.fetch = jest.fn(() => Promise.resolve({
            'status': 200,
            json: () => JSON.parse('{"score": 80}'),
            ok: true

        }))
        await utils.doScan(url, tabId)
        expect(global.fetch).toHaveBeenCalledWith(url, {method: "GET", headers: headers})

    })



})