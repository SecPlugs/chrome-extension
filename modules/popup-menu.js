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

        // Description text on the api key menu
        const api_key_menu_description_text = "Enter your API key to upgrade and enable <a href=''> registered features </a>";
        document.getElementById('secplugs_api_key_menu_description').innerHTML = api_key_menu_description_text;

        // Apply API Key
        document.getElementById('secplugs_api_key_menu_btn_ok').innerHTML = 'Apply API Key';

        // Get API Key
        document.getElementById('secplugs_api_key_menu_btn_get_api_key').innerHTML = 'Get API Key';

    }

    // Registered
    else {

        // Version text under title
        const version_text = 'Version: ' + local_state['secplugs_plugin_version'] + ', registered.';
        document.getElementById('version_text').innerHTML = version_text;

        // Change Api key 
        document.getElementById('secplugs_main_menu_btn_enter_api_key').innerHTML = "Change API Key..";

        // Description text on the api key menu
        const api_key_menu_description_text = "You're using an api key and have access to <a href=''> registered features </a>";
        document.getElementById('secplugs_api_key_menu_description').innerHTML = api_key_menu_description_text;

        // Update API Key
        document.getElementById('secplugs_api_key_menu_btn_ok').innerHTML = 'Update API Key';

        // Get New API Key
        document.getElementById('secplugs_api_key_menu_btn_get_api_key').innerHTML = 'Get New API Key';

    }

}

// Open a new window at the url by posting the params to it
function openLandingPage(local_state, landing_page, params) {

    // Build the url
    const action_url = local_state['secplugs_portal'] + "/plugin_landing/" + landing_page;

    // Create the form
    const target = "openLandingPage";
    var form = document.createElement("form");
    form.setAttribute("method", "post");
    form.setAttribute("action", action_url);
    form.setAttribute("target", target);

    // Copy the required values from local state into params
    params['api_key'] = local_state['secplugs_api_key'];
    params['client_uuid'] = local_state['secplugs_client_uuid'];

    // Create the hidden fields for the post
    for (const [key, value] of Object.entries(params)) {
        var hiddenField = document.createElement("input");
        hiddenField.setAttribute("type", "hidden");
        hiddenField.setAttribute("name", key);
        hiddenField.setAttribute("value", value);
        form.appendChild(hiddenField);
    }

    // Open the window and submit 
    document.body.appendChild(form);
    window.open('', target);
    form.submit();
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
        var verdict_display_class = "verdict_pending";
        if (status == 'failure' ||
            status == 'pending') {
            // no op use defaults
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

        // Set the view report button's report_id if we one, otherwise remove
        const report_id = scan_status['report_id'];
        if (report_id) {
            viewReportElement.setAttribute('report_id', report_id);
        }
        else {
            viewReportElement.removeAttribute('report_id');
        }


        // Handle error message display
        if (status == 'failure') {

            // Show error
            const err_message = scan_status.err_message || "unknown error.";
            showHideControls(['secplugs_scan_now_menu_error_message'], []);
            document.getElementById('secplugs_scan_now_menu_error_message').innerHTML = err_message;
        }
        else {

            // Clear error
            showHideControls([], ['secplugs_scan_now_menu_error_message']);
            document.getElementById('secplugs_scan_now_menu_error_message').innerHTML = "";
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

            // Toggle Auto Scanning Button
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

            // Scan Now Button
            document.getElementById("secplugs_main_menu_btn_scan_now").addEventListener("click", function() {

                // Get the current tab
                chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {

                    console.assert(tabs.length == 1);
                    const url_to_scan = tabs[0].url;

                    // Alert if its excluded
                    if (utils.isUrlExcluded(url_to_scan)) {

                        alert('The current page is safe and excluded from scanning. Choose another page.');
                    }
                    else {

                        // Switch to the sub menu 
                        showHideControls(['secplugs_popup_scan_now_menu'], ['secplugs_popup_api_key_menu', 'secplugs_popup_main_menu']);

                        // and kick off the scan
                        const message = {
                            action: "secplugs_popup_scan_now",
                            url: url_to_scan,
                            tab_id: tabs[0].tabId,
                            capability: "/web/quickscan"
                        };
                        chrome.runtime.sendMessage(message, null);
                    }
                });

            });

            // View Scan History Button
            document.getElementById("secplugs_main_menu_btn_view_scan_history").addEventListener("click", function() {
                openLandingPage(local_state, "viewscanhistory.php", {});
            });

            // Enter API Key Button
            document.getElementById("secplugs_main_menu_btn_enter_api_key").addEventListener("click", () => {
                showHideControls(['secplugs_popup_api_key_menu'], ['secplugs_popup_main_menu', 'secplugs_popup_scan_now_menu']);
            });

            // Visit Secplugs Button
            document.getElementById("secplugs_main_menu_btn_visit_us").addEventListener("click", () => {
                openLandingPage(local_state, "visitus.php", {});
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

            // Get API key Button
            document.getElementById("secplugs_api_key_menu_btn_get_api_key").addEventListener("click", () => {
                openLandingPage(local_state, "getapikey.php", {});
            });

            // Back to main menu
            document.getElementById("secplugs_api_key_menu_btn_go_back").addEventListener("click", () => {
                showHideControls(['secplugs_popup_main_menu'], ['secplugs_popup_api_key_menu', 'secplugs_popup_scan_now_menu']);
            });


            /* Handlers for Scan Now Menu*/

            // Start a deep scan
            document.getElementById("secplugs_scan_now_menu_btn_deep_scan").addEventListener("click", function() {

                // Get the current tab
                chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {

                    console.assert(tabs.length == 1);
                    const url_to_scan = tabs[0].url;

                    // and kick off the scan
                    const message = {
                        action: "secplugs_popup_scan_now",
                        url: url_to_scan,
                        tab_id: tabs[0].tabId,
                        capability: "/web/deepscan"
                    };
                    chrome.runtime.sendMessage(message, null);
                });
            });

            // View the report
            var viewReportElement = document.getElementById("secplugs_scan_now_menu_btn_view_report");
            viewReportElement.addEventListener("click", () => {
                const report_id = viewReportElement.getAttribute('report_id');
                if (report_id) {
                    openLandingPage(local_state, "viewreport.php", { report_id: report_id });
                }
                else {
                    console.warn('No report_id');
                }
            });

            // Back to main menu
            document.getElementById("secplugs_scan_now_menu_btn_go_back").addEventListener("click", () => {
                showHideControls(['secplugs_popup_main_menu'], ['secplugs_popup_api_key_menu', 'secplugs_popup_scan_now_menu']);
            });

        });

});
