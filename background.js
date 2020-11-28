import { closeDiv, setDefaultApiKey, setScan, getScan, doScan, setScanCount } from './modules/utils.js'

/*
todo: build number version info etc
todo: add client id 
todo: fix Unchecked runtime.lastError: No tab with id: 159.
todo: make CICD post to chrome store 
todo: support asynchronous results
todo: show last scanned items
todo: show scan history
todo: produce dev, staging and production builds
todo: clean up lint errors

Done but needs testing
todo: fix 'we have no info on this page issue'
todo: fix 'default to detection on failure'
todo: add tests for some urls fail to submit 
todo: move images to a folder

Won't do 
todo: auto pin 


*/

// These imports are required for webpack
import logo from './images/logo.png';
import icon16 from './images/icon16.png';
import icon32 from './images/icon32.png';
import icon48 from './images/icon48.png';
import icon128 from './images/icon128.png';
import popup from './images/popup-logo.png';
import green_logo from './images/green_logo.png';
import background from './background.html';
import popup_html from './popup.html';

/* global chrome */

chrome.runtime.onInstalled.addListener(function (details){
    if(details.reason === "install"){
        setDefaultApiKey();
        setScan("passive");
        setScanCount(-1);
    }
});


chrome.runtime.onMessage.addListener(function(request,sender,sendResponse) {
    if(request.action === "scan_url"){               
        chrome.tabs.query({active:true}, function(tabs){            
            let url = "https://api.live.secplugs.com/security/web/quickscan?url=" + encodeURIComponent(tabs[0].url);
            let tabId = tabs[0].tabId;               
            doScan(url, tabId, "manual");
        });
    }    
});

chrome.tabs.onUpdated.addListener(function onTabUpdate(tabId, changeInfo, tab) {
    closeDiv("secplug-error-div");
    
    // todo: pendingUrl
    
    // Check for url
    if (!changeInfo.url) {
        console.log("Skipping, no url.");
        return;
    }
    
    // Needs to be http(s)
    var uriPattern = /^((http|https):\/\/)/;
    if (!uriPattern.test(changeInfo.url)){
        console.log("Skipping, not a url.");
        return;
    }
        
    // Set up the scan 
    let url = "https://api.live.secplugs.com/security/web/quickscan?url=" + encodeURIComponent(changeInfo.url);    
    getScan()
        .then(scanSetting => {            
        if (scanSetting === "passive"){                     
            doScan(url, tabId, "passive");
        }                     
    }); 

 
});


