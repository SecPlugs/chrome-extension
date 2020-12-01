import * as utils from './modules/utils.js';

/*

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
todo: build number version info etc

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

/* 
    Handler - Post install
*/
chrome.runtime.onInstalled.addListener(function (details){
    if(details.reason === "install"){
        utils.setDefaultApiKey();
        utils.setScan("passive");
        utils.setScanCount(-1);
    }
});

/* 
    Handler - User scans the current tab 
*/
chrome.runtime.onMessage.addListener(function(request,sender,sendResponse) {
    if(request.action === "scan_url"){               
        chrome.tabs.query({active:true}, function(tabs){    
            
            // todo:bug is this the correct tab?
            const url_to_scan = tabs[0].url;
            let tabId = tabs[0].tabId;               
            utils.doScan(url_to_scan, tabId);
        });
    }    
});

/* 
    Handler - Scan url of new tab
*/
chrome.tabs.onUpdated.addListener(function onTabUpdate(tabId, changeInfo, tab) {
    utils.closeDiv("secplug-error-div");
    
    // todo: pendingUrl
    
    // Check for url
    if (!changeInfo.url) {
        console.log("Skipping, no url.");
        return;
    }
    
   // Test catch is called
    utils.getLocalStorageData(['secplug_scan_opt'])
    .then(stored_data => {
        
        // Set up the scan 
        const url_to_scan = changeInfo.url;    
        if (stored_data['secplug_scan_opt'] === "passive"){                     
            utils.doScan(url_to_scan, tabId, "passive");
        }                     
    
    })
    .catch(data => {
        // Failed 
        console.log('Failed to get local storage data.');
    });
 
   

 
});


