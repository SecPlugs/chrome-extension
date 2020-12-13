import * as utils from './modules/utils.js';

/*

todo: fix issue after you enter key there is space below 
todo: fix Unchecked runtime.lastError: No tab with id: 159.
todo: Fix Scan Now so it shows results 
todo: check test detection pages
todo: Fix and test api key
todo: UI
    - redo tool tip text
    - Scan Active Page - Scan Now
    - Add status
        version
        scan count 
        last scanned & status
        key type
    - merge go Premium and add api key
        
todo: show scan history
todo: support asynchronous results
todo: show last scanned items
todo: produce dev, staging and production builds

todo: make CICD post to chrome store 

Done but needs testing
todo: fix 'we have no info on this page issue'
todo: fix 'default to detection on failure'
todo: add tests for some urls fail to submit 
todo: move images to a folder
todo: build number version info etc
todo: make passive scanning a toggle 


Tested
todo: add client id 
todo: Uncaught ReferenceError: setKey is not defined
todo: put default secplugs api and key in config file
todo: clean up lint errors

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
chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason === "install") {
        utils.setDefaults();
    }
});

/* 
    Handler - User scans the current tab 
*/
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "scan_url") {
        chrome.tabs.query({ active: true }, function(tabs) {

            // todo:bug is this the correct tab?
            const url_to_scan = tabs[0].url;
            let tab_id = tabs[0].tabId;

            // Check its valid scheme (i.e. not chrome://)
            if (!utils.isUrlSchemeSupported(url_to_scan)) {
                console.log(`'${url_to_scan}' unsupported scheme`);
                return;
            }
            // Get the stored data
            utils.getLocalState()
                .then(local_state => {

                    // Do the scan
                    const show_message = true;
                    return utils.doWebQuickScan(
                        url_to_scan,
                        tab_id,
                        local_state,
                        show_message);

                })
                .catch(data => {

                    // Failed 
                    console.log('scan_url Failed to get local storage data.');
                });

        });
    }
});

/* 
    Handler - Scan new urls loaded in a tab
*/
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    utils.closeDiv("secplugs-error-div");

    // todo: pendingUrl

    // Check for url
    if (!changeInfo.url) {
        console.log("Skipping, no url.");
        return;
    }

    // Get the stored data
    utils.getLocalState()
        .then(local_state => {


            // Set up the scan 
            const url_to_scan = changeInfo.url;
            const tab_id = tabId;
            if (local_state['secplugs_auto_scan_enabled'] === "true") {
                return utils.doWebQuickScan(url_to_scan, tab_id, local_state);
            }

        })
        .catch(exception => {

            // Failed 
            console.error(`onTabUpdate ${exception}`);

        });

});
