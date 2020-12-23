import * as utils from './modules/utils.js';

/*


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
        
todo: show scan history
todo: support asynchronous results
todo: show last scanned items

todo: add favicon to context 
todo: make CICD post to chrome store 
todo: add context menu 'scan with secplugs'

Done but needs testing
todo: put up alert on scan now for un scannable urls 
todo: fix 'we have no info on this page issue'
todo: fix 'default to detection on failure'
todo: add tests for some urls fail to submit 
todo: move images to a folder
todo: build number version info etc
todo: make passive scanning a toggle 
todo: produce dev, staging and production builds


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
import popup_html from './html/popup-menu.html';

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
    if (request.action === "secplugs_popup_scan_now") {

        // Get values from the message
        const url_to_scan = request.url;
        const tab_id = request.tab_id;
        const capability = request.capability;

        // Build status
        var scan_status = {
            url: url_to_scan,
            status: 'pending',
            score: null,
            verdict: null,
            report_id: null,
            message: ""
        };

        // Send starting message 
        chrome.runtime.sendMessage({ action: "scan_progress_update", scan_status: scan_status }, null);

        // Get the stored data
        utils.getLocalState()
            .then(local_state => {

                // Do the scan
                const scan_progress_callback = (scan_status) => {

                    chrome.runtime.sendMessage({ action: "scan_progress_update", scan_status: scan_status }, null);
                };
                return utils.doWebAnalysis(
                    url_to_scan,
                    tab_id,
                    local_state,
                    capability,
                    scan_progress_callback);

            })
            .catch(data => {

                // Failed 
                console.log('secplugs_popup_scan_now Failed to get local storage data.');
            });
    }

});

/* 
    Handler - Scan new urls loaded in a tab
*/
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {

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
                return utils.doWebAnalysis(url_to_scan, tab_id, local_state, '/web/quickscan');
            }

        })
        .catch(exception => {

            // Failed 
            console.error(`onTabUpdate ${exception}`);

        });

});
