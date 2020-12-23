/* global chrome */
import * as utils from "./utils.js";

// Show hide the specified elements
function showHideControls(show_ids, hide_ids) {

    // Show
    show_ids.forEach(show_id => {
        var element = document.getElementById(show_id);
        console.assert(element, `element ${show_id} not found`);
        console.assert(!hide_ids.includes(show_id));
        element.style.display = 'flex';
    });

    // Hide
    hide_ids.forEach(hide_id => {
        var element = document.getElementById(hide_id);
        console.assert(element, `element ${hide_id} not found`);
        console.assert(!show_ids.includes(hide_id));
        element.style.display = 'none';
    });

}

// Set the correct text and state of the controls based on the local_state
// Note: Does not change visibility
function setControlState(local_state) {
    // Auto scanning enabled button
    if (local_state['secplugs_auto_scan_enabled'] === "false") {
        document.getElementById("secplugs_main_menu_btn_toggle_auto_scan").checked = false;
    }
    else {
        document.getElementById("secplugs_main_menu_btn_toggle_auto_scan").checked = true;
    }

    // Anonymous
    if (local_state['secplugs_key_type'] !== "registered") {

        // Version text under title
        const version_text = 'Version: ' + local_state['secplugs_plugin_version'] + ', anonymous.';
        document.getElementById('version_text').innerHTML = version_text;

        // Enter Api key 
        document.getElementById('secplugs_main_menu_btn_enter_api_key').innerHTML = "Enter API Key..";

        // Visit us button on the main menu
        document.getElementById('secplugs_main_menu_btn_visit_us').innerHTML = "Upgrade...";

        // Description text on the api key menu
        const api_key_menu_description_text = "Enter your API key to upgrade and enable <a href=''> registered features </a>";
        document.getElementById('secplugs_api_key_menu_description').innerHTML = api_key_menu_description_text;

        // Apply API Key
        document.getElementById('secplugs_api_key_menu_btn_ok').innerHTML = 'Apply API Key';

        // Get API Key
        document.getElementById('secplugs_api_key_menu_btn_get_api_key').innerHTML = 'Get API Key...';

    }

    // Registered
    else {

        // Version text under title
        const version_text = 'Version: ' + local_state['secplugs_plugin_version'] + ', registered.';
        document.getElementById('version_text').innerHTML = version_text;

        // Change Api key 
        document.getElementById('secplugs_main_menu_btn_enter_api_key').innerHTML = "Change API Key..";

        // Visit us button on the main menu
        document.getElementById('secplugs_main_menu_btn_visit_us').innerHTML = "Visit Secplus.com";

        // Description text on the api key menu
        const api_key_menu_description_text = "You're using an api key and have access to <a href=''> registered features </a>";
        document.getElementById('secplugs_api_key_menu_description').innerHTML = api_key_menu_description_text;

        // Update API Key
        document.getElementById('secplugs_api_key_menu_btn_ok').innerHTML = 'Update API Key';

        // Get New API Key
        document.getElementById('secplugs_api_key_menu_btn_get_api_key').innerHTML = 'Get New API Key...';

    }

}

// Handle messages
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    // Scan progress update
    if (request.action === "scan_progress_update") {

        const scan_status = request.scan_status;

        // Status text 
        const status = scan_status['status'];
        var status_display_text = "...";
        if (status == "success") {
            status_display_text = 'Success';
        }
        else if (status == 'pending') {
            status_display_text = "In Progress";
        }
        else if (status == 'failure') {
            status_display_text = "Failed";
        }
        else {
            console.assert(false, `bad status ${status}`);
        }

        // Verdict text 
        const verdict = scan_status['verdict'];
        var verdict_display_text = "...";
        var verdict_display_class = "";
        if (status == 'pending') {
            verdict_display_text = "In Progress";
            verdict_display_class = "verdict_pending";
        }
        else if (verdict == 'clean') {
            verdict_display_text = "Clean";
            verdict_display_class = "verdict_clean";
        }
        else if (verdict == 'malware') {
            verdict_display_text = "Malware";
            verdict_display_class = "verdict_malware";
        }
        else if (verdict == 'suspicious') {
            verdict_display_text = "Suspicious";
            verdict_display_class = "verdict_suspicious";
        }
        else if (verdict == 'untrusted') {
            verdict_display_text = "Untrusted";
            verdict_display_class = "verdict_untrusted";
        }
        else if (verdict == 'trusted') {
            verdict_display_text = "Trusted";
            verdict_display_class = "verdict_trusted";
        }
        else {
            console.assert(false, `bad verdict ${verdict}`);
        }


        // Set status text
        document.getElementById('secplugs_scan_now_menu_progress_status').innerHTML = status_display_text;

        // Set verdict text and class
        var verdictElement = document.getElementById('secplugs_scan_now_menu_progress_verdict');
        verdictElement.innerHTML = verdict_display_text;
        verdictElement.classList.remove('verdict_clean', 'verdict_malware', 'verdict_suspicious', 'verdict_untrusted', 'verdict_trusted');
        verdictElement.classList.add(verdict_display_class);

        // Set the view report button's class to secplugs-primary-link if its completed
        var viewReportElement = document.getElementById('secplugs_scan_now_menu_btn_view_report');
        if (status == 'success') {
            viewReportElement.classList.add('secplugs-primary-link');
        }
        else {
            viewReportElement.classList.remove('secplugs-primary-link');
        }



    }
});

// Handle setup of options UI
document.addEventListener('DOMContentLoaded', function() {

    // Get the stored data
    utils.getLocalState()
        .then(local_state => {

            // Set control state
            setControlState(local_state);

            /* Handlers for the main menu buttons */

            // Toggle to auto scanning
            document.getElementById("secplugs_main_menu_btn_toggle_auto_scan").addEventListener("click", function() {

                if (document.getElementById("secplugs_main_menu_btn_toggle_auto_scan").checked) {
                    utils.setAutoScan("true");
                    local_state['secplugs_auto_scan_enabled'] = "true";
                }
                else {
                    utils.setAutoScan("false");
                    local_state['secplugs_auto_scan_enabled'] = "false";
                }
            });

            // Show enter Api Key menu
            document.getElementById("secplugs_main_menu_btn_enter_api_key").addEventListener("click", () => {
                showHideControls(['secplugs_popup_api_key_menu'], ['secplugs_popup_main_menu', 'secplugs_popup_scan_now_menu']);
            });


            // Show Scan Now menu and start a scan
            document.getElementById("secplugs_main_menu_btn_scan_now").addEventListener("click", function() {
                showHideControls(['secplugs_popup_scan_now_menu'], ['secplugs_popup_api_key_menu', 'secplugs_popup_main_menu']);
                chrome.runtime.sendMessage({ action: "scan_url" }, null);

            });

            /* Handlers for the api key Menu */

            // Validate and set the api key
            document.getElementById("secplugs_api_key_menu_btn_ok").addEventListener("click", function() {
                if (event.target == event.currentTarget) {
                    const new_api_key = document.getElementById('secplugs_api_key_menu_input_api_key').value;
                    utils.setKey(new_api_key, local_state)
                        .then(() => {

                            // Success
                            alert('The api key has been validated and saved. \nYou are all set.');
                            local_state['secplugs_key_type'] = "registered";

                            // Set control state
                            setControlState(local_state);

                        })
                        .catch((message) => {

                            // Failed
                            alert(`${message}. \nPlease try again.`);
                        });
                }
            });

            // Back to main menu
            document.getElementById("secplugs_api_key_menu_btn_go_back").addEventListener("click", () => {
                showHideControls(['secplugs_popup_main_menu'], ['secplugs_popup_api_key_menu', 'secplugs_popup_scan_now_menu']);
            });


            /* Handlers for Scan Now Menu*/


            // Start a deep scan
            document.getElementById("secplugs_scan_now_menu_btn_deep_scan").addEventListener("click", function() {
                chrome.runtime.sendMessage({ action: "scan_url" }, null);
            });

            // Back to main menu
            document.getElementById("secplugs_scan_now_menu_btn_go_back").addEventListener("click", () => {
                showHideControls(['secplugs_popup_main_menu'], ['secplugs_popup_api_key_menu', 'secplugs_popup_scan_now_menu']);
            });

        });

});
