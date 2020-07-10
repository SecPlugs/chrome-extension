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

describe('Test getScanKey in utils.js', () => {
    it('getScanKey from local storage', () => {
        const message = ['a']
        const response = {"secplug_scan_count": "0"}
        chrome.storage.local.get.mockImplementation(
            (message, callback) => {
                callback(response)
            }
        )
        return utils.getScanCount().then(data => {
            expect(data).toEqual("0")
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
        let label = document.createElement('label')
        label.setAttribute("id", "visit_us")
        div.appendChild(input)
        div.appendChild(label)
        document.body.appendChild(div)
        utils.setKey()
        expect(chrome.storage.local.set).toHaveBeenCalledWith({"secplug_api_key": "new_key"}, null)

        div = document.createElement('div')
        div.setAttribute("id", "secplug-input-div")
        input = document.createElement('input')
        input.setAttribute("id", "secplug-input-box")
        input.setAttribute("value", "")
        label = document.createElement('label')
        label.setAttribute("id", "visit_us")
        div.appendChild(input)
        div.appendChild(label)
        document.body.appendChild(div)
        utils.setKey()
        expect(chrome.storage.local.set).not.toHaveBeenCalledWith()
    })
})

describe('Test setDefaultAPIKey in utils.js', () => {
    it('setKey in local storage', () => {
        utils.setDefaultApiKey()
        expect(chrome.storage.local.set).toHaveBeenCalledWith({"secplug_api_key": "WiYNBFppZ6nw5BwfbgSo3I4YC5dXGFH3cbvM2YTe"}, null)
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

describe('Test getKeyType in utils.js', () => {
    it('Test reject', () => {
        const message = ['a']
        const response = "b"
        chrome.storage.local.get.mockImplementation(
            (message, callback) => {
                callback(response)
            }
        )
        return utils.getKeyType().catch(data => {        
            expect(data).toEqual("API Key type not set")
        })
    })

    it('Test resolve', () => {
        const message = ['a']
        const response = {"secplug_key_type": "invalid_key_type"}
        chrome.storage.local.get.mockImplementation(
            (message, callback) => {
                callback(response)
            }
        )
        return utils.getKeyType().then(data => {
            expect(data).toEqual("invalid_key_type")
        })
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
            'status': 403,
            json: () => JSON.parse('{"score": 20}'),
            ok: false

        }))
        await utils.doScan(url, tabId)
        expect(global.fetch).toHaveBeenCalledWith(url, {method: "GET", headers: headers})

        global.fetch = jest.fn(() => Promise.resolve({
            'status': 400,
            json: () => JSON.parse('{"score": 20}'),
            ok: false

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

        const message2 = ['a']
        const response2 = {"secplug_scan_count": "1"}
        chrome.storage.local.get.mockImplementation(
            (message2, callback2) => {
                callback2(response2)
            }
        )
        await utils.doScan(url, tabId)
        expect(global.fetch).toHaveBeenCalledWith(url, {method: "GET", headers: headers})
    })
})