/* global chrome */
import * as utils from "./utils.js";
document.addEventListener('DOMContentLoaded', function() {

    // Get the stored data
    utils.getLocalState()
        .then(local_state => {

            /* Set control state */

            // Auto scanning enabled button
            if (local_state['secplugs_auto_scan_enabled'] === "false") {
                document.getElementById("toggle_auto_scan").checked = false;
            }
            else {
                document.getElementById("toggle_auto_scan").checked = true;
            }

            // Version text
            const version_text = 'Version: ' + local_state['secplugs_plugin_version'];
            document.getElementById('version_text').innerHTML = version_text;

            // Anonymous or paid
            if (local_state['secplugs_key_type'] !== "paid") {
                document.getElementById('visit_us').innerHTML = "Go Premium!";
            }

            /* Handlers for the controls */

            // Add api key
            document.getElementById("api_link").addEventListener("click", inputKey);

            // Toggle to auto scanning
            document.getElementById("toggle_auto_scan").addEventListener("click", function() {

                if (document.getElementById("toggle_auto_scan").checked) {
                    utils.setAutoScan("true");
                }
                else {
                    utils.setAutoScan("false");
                }
            });

            // Scan now
            document.getElementById("scan_link").addEventListener("click", function() {
                chrome.runtime.sendMessage({ action: "scan_url" }, null);
                window.close();
            });


        })
        .catch(data => {

            // Failed 
            console.log('Failed to get local storage data.');
        });


});

export const inputKey = () => {

    var api_key_control = document.getElementById("secplugs_popup_api_key_input");
    var menu_options = document.getElementById("secplugs_popup_menu");
    var button_key = document.getElementById("secplugs-button-key");

    menu_options.style.visibility = 'hidden';
    api_key_control.style.visibility = "visible";
    button_key.addEventListener("click", function(event) {
        if (event.target == event.currentTarget) {
            utils.setKey();
        }
    });
};
