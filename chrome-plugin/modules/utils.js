export const getKey = () => {
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
    let text_val = document.getElementById('secplug-input-box').value
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
    try{
        document.getElementById(id).remove()
    }catch(err){
        return
    }

}

export const setScan = (scanOpt) => {
    chrome.storage.local.set({"secplug_scan_opt": scanOpt}, null)
}

export const getScan = () => {
    return new Promise(function(resolve, reject){
        chrome.storage.local.get(['secplug_scan_opt'], function(key){
            if(key.secplug_scan_opt){
                resolve(key.secplug_scan_opt)
            }else {
                reject("Scan Option not selected")
            }            
        })
    })
}

export const setScanning = (state) => {
    chrome.storage.local.set({"secplug_under_scan": state}, null)
}

export const isScanning = () => {
    return new Promise(function(resolve, reject){
        chrome.storage.local.get(['secplug_under_scan'], function(key){
            if(key.secplug_under_scan === true){
                resolve(key.secplug_under_scan)
            }else {
                return false
            }            
        })
    })
}
