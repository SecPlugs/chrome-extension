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
