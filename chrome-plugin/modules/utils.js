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
    let def_api_key = "2VJIWQkIm67Dsk5Hl5jAB8vPPYSxhNun3ftKYxsl"
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

export const doScan = (url, tabId) => {
    if(!url.includes("undefined") && !url.includes("chrome")) {  
        getKey()
            .then(api_key => {                        
            let headers = {
                "accept": "application/json",
                "x-api-key": api_key
            }
            fetch(url, {method: "GET", headers: headers})
            .then(response => {
                if(response.status === 403){
                    chrome.tabs.executeScript(tabId, 
                        {code: 'var message = ' + '"Please set up a Secplug API Key for continuing scanning";' 
                                + 'var bg_color = "#ff8533";'
                                + 'var closeDiv = ' + closeDiv},
                        function(){chrome.tabs.executeScript(tabId, {file: "error_popup.js"})}
                    )
                }else if(!response.ok){
                    throw Error(response.status)
                }
                return response.json()
            })
            .then(data => {                
                if(data["score"] <= 40){
                    chrome.tabs.executeScript(tabId, 
                        {code: 'var message = ' + '"Secplug Analysis: This is a malicious page";' 
                                + 'var bg_color = "#ff8533";'
                                + 'var closeDiv = ' + closeDiv},
                        function(){chrome.tabs.executeScript(tabId, {file: "error_popup.js"})}
                    )
                }else if(data["score"] > 60){
                            chrome.tabs.executeScript(tabId, 
                                {code: 'var message = ' + '"Secplug Analysis: This is a clean page";' 
                                + 'var bg_color = "#1aff1a";'
                                + 'var closeDiv = ' + closeDiv},
                                function(){chrome.tabs.executeScript(tabId, {file: "error_popup.js"})}
                            )
                }else if(data["score"] > 40 && data["score"] <= 60){
                            chrome.tabs.executeScript(tabId, 
                                {code: 'var message = ' + '"Secplug Analysis: We do not have threat info of this page";' + 
                                'var bg_color = "#66ffcc";'
                                + 'var closeDiv = ' + closeDiv},
                                function(){chrome.tabs.executeScript(tabId, {file: "error_popup.js"})}
                            )
                }
            })
            .catch(error => {                
                console.log(error)
            })
        })
        .catch(error => {
            chrome.tabs.executeScript(tabId, 
                {code: 'var message = ' + '"Please set up a Secplug API Key for continuing scanning";' 
                        + 'var bg_color = "#ff8533";'
                        + 'var closeDiv = ' + closeDiv},
                function(){chrome.tabs.executeScript(tabId, {file: "error_popup.js"})}
            )
        })
    }else{
        console.log(url + " is not to be scanned")
    }
}