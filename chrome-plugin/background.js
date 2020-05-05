import { fetchGet } from './modules/utils.js'
let tabArray = []
chrome.tabs.onUpdated.addListener(function onTabUpdate(tabId, changeInfo, tab) {    
    if(changeInfo.url && !changeInfo.url.includes("chrome")) {       
        let url = "https://api.live.secplugs.com/security/web/quickscan?url=" + changeInfo.url
        let headers = {
            "accept": "application/json",
            "x-api-key": "02Kryf0eidI4c6gNdiUwakibspl8gRm5yTtst69d"
        }
        fetchGet(url, headers)
        .then(data => {
            if(data["score"] <= 40 && tabArray.indexOf(tabId) === -1){
                chrome.tabs.executeScript(tabId, 
                    {code: 'var message = ' + '"Secplug Analysis: This is a malicious page"'},
                    function(){chrome.tabs.executeScript(tabId, {file: "error_popup.js"})}
                )
                tabArray.push(tabId)
            }else if(data["score"] > 60 && tabArray.indexOf(tabId) === -1){
                        chrome.tabs.executeScript(tabId, 
                            {code: 'var message = ' + '"Secplug Analysis: This is a clean page"'},
                            function(){chrome.tabs.executeScript(tabId, {file: "error_popup.js"})}
                        )
                        tabArray.push(tabId)
            }else if(data["score"] > 40 && data["score"] <= 60 && tabArray.indexOf(tabId) === -1){
                        chrome.tabs.executeScript(tabId, 
                            {code: 'var message = ' + '"Secplug Analysis: We do not have threat info of this page"'},
                            function(){chrome.tabs.executeScript(tabId, {file: "error_popup.js"})}
                        )
                        tabArray.push(tabId)
            }
        }    
    )
    }
})
