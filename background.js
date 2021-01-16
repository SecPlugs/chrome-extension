import * as utils from './modules/utils.js';

/*

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
            err_message: null,
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

    // Check for url
    if (!changeInfo.url) {
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
