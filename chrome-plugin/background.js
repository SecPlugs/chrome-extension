import { closeDiv, setDefaultApiKey, setScan, getScan, doScan } from './modules/utils.js'

// These imports are required for webpaack
import logo from './logo.png'
import popup from './popup-logo.png'
import background from './background.html'
import popup_html from './popup.html'

chrome.runtime.onInstalled.addListener(function (details){
    if(details.reason === "install"){
        setDefaultApiKey()
        setScan("passive")
    }
})

chrome.runtime.onMessage.addListener(function(request,sender,sendResponse) {
    if(request.action === "scan_url"){        
        chrome.tabs.query({active:true}, function(tabs){
            let url = "https://api.live.secplugs.com/security/web/quickscan?url=" + tabs[0].url
            let tabId = tabs[0].tabId   
            doScan(url, tabId)
        })
    }    
})

chrome.tabs.onUpdated.addListener(function onTabUpdate(tabId, changeInfo, tab) {
    closeDiv("secplug-error-div")
    let url = "https://api.live.secplugs.com/security/web/quickscan?url=" + changeInfo.url     
    getScan()
        .then(scanSetting => {            
        if (scanSetting === "passive"){
            doScan(url, tabId)
        }                     
    })  
})

