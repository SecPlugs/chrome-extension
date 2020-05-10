export const fetchKey = () => {
    return new Promise(function(resolve, reject){
        chrome.storage.local.get(['secplug_api_key'], function(key){
            if(key.secplug_api_key){
                resolve(key.secplug_api_key)
            }else {
                reject("API Key needs to be set")
            }            
        })
    })
}

export const setKey = () => {    
    text_val = document.getElementById('secplug-input-box').value
    if(text_val && text_val.length){
        chrome.storage.local.set({"secplug_api_key": text_val}, null)
        document.getElementById("secplug-input-div").remove()
    }
}

export const setDefaultApiKey = () => {
    let def_api_key = "HPWYXrUoZe1IorJe5Lfwt1TACtqquW0q57EbIQRz"
    chrome.storage.local.set({"secplug_api_key": def_api_key}, null)
}

export const closeDiv = (id) => {    
    document.getElementById(id).remove()
}