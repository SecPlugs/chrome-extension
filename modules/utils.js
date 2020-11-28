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
        chrome.storage.local.set({"secplug_key_type": "paid"}, null)
        document.getElementById('visit_us').innerHTML = "Visit Secplugs.com"
        document.getElementById("secplug-input-div").remove()
    }
}

export const setDefaultApiKey = () => {
    let def_api_key = "ILbW1sKwPs8CWO76E8ex47TR7zCZ2a8L50oq7sPI"
    chrome.storage.local.set({"secplug_api_key": def_api_key}, null)
    chrome.storage.local.set({"secplug_key_type": "free"}, null)
}

export const getScanCount = () => {
    return new Promise(function(resolve, reject){
        chrome.storage.local.get(['secplug_scan_count'], function(key){
            if(key.secplug_scan_count){
                resolve(key.secplug_scan_count)
            }else {
                resolve(0)
            }            
        })
    })
}

export const setScanCount = (currScanCount) => {
    chrome.storage.local.set({"secplug_scan_count": currScanCount + 1}, null)
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

export const getKeyType = () => {
    return new Promise(function(resolve, reject){
        chrome.storage.local.get(['secplug_key_type'], function(key){
            if(key.secplug_key_type){
                resolve(key.secplug_key_type)
            }else {
                reject("API Key type not set")
            }            
        })
    })
}

export const doScan = (url, tabId, scanSetting) => {
    if(!url.includes("undefined") && !url.includes("chrome://")) {  
        getKey()
            .then(api_key => {                        
            let headers = {
                "accept": "application/json",
                "x-api-key": api_key
            }
            fetch(url, {method: "GET", headers: headers})
            .then(response => {
                if(response.status === 403 || response.status === 429){                    
                    chrome.tabs.executeScript(tabId, 
                        {code: 'var message = ' + '"Ensure key is correct with sufficient credits";' 
                                + 'var bg_color = "#ffff99";'
                                + 'var closeDiv = ' + closeDiv},
                        function(){chrome.tabs.executeScript(tabId, {file: "error_popup.js"})}
                    )
                }else if(!response.ok){
                    throw Error(response.status)
                }
                return response.json()
            })
            .then(data => {
                getScanCount().then(count => {
                    chrome.browserAction.setBadgeText({
                        tabId: tabId,
                        text: count.toString()
                    })
                    chrome.browserAction.setIcon({path: "./green_logo.png"});
                    setTimeout(function(){
                        chrome.browserAction.setBadgeText({
                            tabId: tabId,
                            text: ""
                        })
                        chrome.browserAction.setIcon({path: "./logo.png"});
                    }, 10000)
                    setTimeout(function(){                        
                        chrome.browserAction.setIcon({path: "./logo.png"});
                    }, 3000)
                    chrome.browserAction.setBadgeBackgroundColor({
                        tabId: tabId,
                        color: "#595959"
                    })
                    setScanCount(count)
                })              
                
                if(data["score"] <= 40){                       
                    chrome.tabs.executeScript(tabId, 
                        {code: 'var message = ' + '"This is a malicious page";' 
                                + 'var bg_color = "#ffebe6";'
                                + 'var closeDiv = ' + closeDiv},
                        function(){chrome.tabs.executeScript(tabId, {file: "error_popup.js"})}
                    )
                }else if(data["score"] > 60){                                                        
                        if(scanSetting === "manual") {
                            chrome.tabs.executeScript(tabId, 
                                {code: 'var message = ' + '"This is a clean page";' 
                                + 'var bg_color = "#e6ffcc";'
                                + 'var closeDiv = ' + closeDiv},
                                function(){chrome.tabs.executeScript(tabId, {file: "error_popup.js"})}
                            )
                        }                            
                }else if(data["score"] > 40 && data["score"] <= 60){                            
                            chrome.tabs.executeScript(tabId, 
                                {code: 'var message = ' + '"We do not have threat info of this page";' + 
                                'var bg_color = "#e6f2ff";'
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
                        + 'var bg_color = "#ffff99";'
                        + 'var closeDiv = ' + closeDiv},
                function(){chrome.tabs.executeScript(tabId, {file: "error_popup.js"})}
            )
        })
    }else{
        console.log(url + " is not to be scanned")
    }
}