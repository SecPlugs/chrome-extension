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
        document.body.remove('secplug-input-div')
    })
})
