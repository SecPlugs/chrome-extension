import { fetchKey, setKey, closeDiv, setDefaultApiKey } from './modules/utils.js'
chrome.runtime.onInstalled.addListener(function (details){
    if(details.reason === "install"){
        setDefaultApiKey()
    }
})


chrome.tabs.onUpdated.addListener(function onTabUpdate(tabId, changeInfo, tab) {    
    if(changeInfo.url && !changeInfo.url.includes("chrome")) {  
        // chrome.storage.local.remove(["secplug_api_key"], null)     
        let url = "https://api.live.secplugs.com/security/web/quickscan?url=" + changeInfo.url       
        fetchKey()
         .then(api_key => {                        
            let headers = {
                "accept": "application/json",
                "x-api-key": api_key
            }
            fetch(url, {method: "GET", headers: headers})
            .then(response => {
                if(response.status === 403){
                    chrome.tabs.executeScript(tabId, 
                        {code: 'var setKey = ' + setKey + '; var closeDiv = ' + closeDiv},
                        function() {chrome.tabs.executeScript(tabId, {file: "input_key.js"})}
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
                                + 'var bg_color = "#33ff33";'
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
                {code: 'var setKey = ' + setKey + '; var closeDiv = ' + closeDiv},
                function() {chrome.tabs.executeScript(tabId, {file: "input_key.js"})}
            )
        })
    }})

