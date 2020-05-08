import { fetchGet, fetchKey } from './modules/utils.js'

chrome.tabs.onUpdated.addListener(function onTabUpdate(tabId, changeInfo, tab) {    
    if(changeInfo.url && !changeInfo.url.includes("chrome")) {       
        let url = "https://api.live.secplugs.com/security/web/quickscan?url=" + changeInfo.url
        chrome.storage.local.set({"secplug_api_key": "HPWYXrUoZe1IorJe5Lfwt1TACtqquW0q57EbIQRz"}, null)        
        fetchKey()
         .then(api_key => {
            let headers = {
                "accept": "application/json",
                "x-api-key": api_key
            }
            fetchGet(url, headers)
            .then(data => {
                if(data["score"] <= 40){
                    chrome.tabs.executeScript(tabId, 
                        {code: 'var message = ' + '"Secplug Analysis: This is a malicious page";' 
                               + 'var bg_color = "#ff8533"'},
                        function(){chrome.tabs.executeScript(tabId, {file: "error_popup.js"})}
                    )
                }else if(data["score"] > 60){
                            chrome.tabs.executeScript(tabId, 
                                {code: 'var message = ' + '"Secplug Analysis: This is a clean page";' 
                                + 'var bg_color = "#33ff33"'},
                                function(){chrome.tabs.executeScript(tabId, {file: "error_popup.js"})}
                            )
                }else if(data["score"] > 40 && data["score"] <= 60){
                            chrome.tabs.executeScript(tabId, 
                                {code: 'var message = ' + '"Secplug Analysis: We do not have threat info of this page";' + 
                                'var bg_color = "#66ffcc"'},
                                function(){chrome.tabs.executeScript(tabId, {file: "error_popup.js"})}
                            )
                }
            })                 
        })
    }})

