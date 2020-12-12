/* global chrome */
import * as utils from "./utils.js";
document.addEventListener('DOMContentLoaded', function() {

    // Get the stored data
    utils.getLocalState()
        .then(local_state => {

            /* Set control state */

            // The manual scanning button
            if (local_state['secplugs_scan_opt'] === "manual") {
                document.getElementById("manual_link").style.backgroundColor = "#ddf1fb";
            }
            else {
                document.getElementById("auto_link").style.backgroundColor = "#ddf1fb";
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
            document.getElementById("auto_link").addEventListener("click", function() {
                utils.setScan("passive");
                document.getElementById("auto_link").style.backgroundColor = "#ddf1fb";
                window.close();
            });

            // Toggle to manual scanning
            document.getElementById("manual_link").addEventListener("click", function() {
                utils.setScan("manual");
                document.getElementById("manual_link").style.backgroundColor = "#ddf1fb";
                window.close();
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
    var body = document.body || document.getElementsByTagName('body')[0];
    var newpar = document.createElement('div');
    var inputBox = document.createElement('input');
    var buttonKey = document.createElement('input');

    newpar.setAttribute("id", "secplugs-input-div");
    newpar.style.height = "20%";
    newpar.style.width = "100%";
    newpar.style.zIndex = "10000";
    newpar.style.backgroundColor = "#ffeb99";
    newpar.style.fontSize = "15";
    newpar.style.textAlign = "center";
    newpar.style.verticalAlign = "middle";
    newpar.style.fontFamily = "sans-serif, Lato, Times New Roman";
    newpar.style.position = "-webkit-sticky";
    newpar.style.position = "sticky";
    newpar.style.bottom = "0";
    newpar.addEventListener("click", function(event) {
        if (event.target == event.currentTarget) {
            utils.closeDiv("secplugs-input-div");
        }
    }, false);

    inputBox.setAttribute("id", "secplugs-input-box");
    inputBox.setAttribute("type", "text");
    inputBox.setAttribute("placeholder", "Enter Secplug API Key");
    inputBox.style.position = "-webkit-sticky";
    inputBox.style.position = "sticky";
    inputBox.style.top = "5%";

    buttonKey.setAttribute("id", "secplugs-button-key");
    buttonKey.setAttribute("type", "submit");
    buttonKey.setAttribute("value", "Done");
    buttonKey.style.border = "None";
    buttonKey.style.backgroundColor = "black";
    buttonKey.style.color = "White";
    buttonKey.style.marginLeft = "5px";
    buttonKey.style.position = "-webkit-sticky";
    buttonKey.style.position = "sticky";
    buttonKey.style.top = "5%";
    buttonKey.addEventListener("click", function(event) {
        if (event.target == event.currentTarget) {
            utils.setKey();
        }
    });

    if (document.getElementById('secplugs-input-div')) {
        document.getElementById('secplugs-input-div').remove();
    }

    newpar.appendChild(inputBox);
    newpar.appendChild(buttonKey);
    body.insertBefore(newpar, body.childNodes[0]);

};
