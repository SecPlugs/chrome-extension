/* global chrome, fetch */



if (typeof exports == "undefined") {

    exports = {};
    exports.displayMessage = displayMessage;
    exports.setScanCount = setScanCount;
}

/**
 * Fast UUID generator, RFC4122 version 4 compliant.
 * @author Jeff Ward (jcward.com).
 * @license MIT license
 * @link http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136
 **/
export function generateUUID() {
    var lut = [];
    for (var i = 0; i < 256; i++) { lut[i] = (i < 16 ? '0' : '') + (i).toString(16); }

    function generate() {
        var d0 = Math.random() * 0xffffffff | 0;
        var d1 = Math.random() * 0xffffffff | 0;
        var d2 = Math.random() * 0xffffffff | 0;
        var d3 = Math.random() * 0xffffffff | 0;
        return lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + '-' +
            lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + '-' + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + '-' +
            lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + '-' + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] +
            lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];
    }
    return generate();
}


/**
 * Returns true of the url is excluded from scanning
 **/
export function isUrlExcluded(url) {

    // Check its a valid url
    var uriPattern = /^((http|https):\/\/)/;
    if (url.includes("undefined") ||
        !uriPattern.test(url)) {
        return true;
    }

    // Check its not secplugs.com
    var secplugsPattern = /^((http|https):\/\/(www.|)secplugs.com(\/[^\n]*|))$/;
    if (secplugsPattern.test(url)) {
        return true;
    }

    // Ok to scan
    return false;
}

/**
 *   Get the headers for a secplugs API call
 **/
export function getSecPlugsAPIHeaders(api_key) {

    let headers = {
        "accept": "application/json",
        "x-api-key": api_key
    };

    return headers;
}

/**
 *   Put up a message box 
 **/
export function displayMessage(message, tab_id, type) {

    chrome.tabs.executeScript(tab_id, {
            code: `var message = "${message}";` +
                'var bg_color = "#ffebe6";' +
                'var closeDiv = ' + closeDiv
        },
        function() { chrome.tabs.executeScript(tab_id, { file: "error_popup.js" }) }
    );
}

/**
 *   Format the url for the request
 **/
export function buildSecPlugsAPIRequestUrl(url, local_state) {

    // Check input
    console.assert(
        typeof url == 'string' &&
        url.startsWith('http'),
        'url with scheme expected');

    // Scan context
    const scan_context = {
        'client_uuid': local_state['secplugs_client_uuid'],
        'plugin_version': local_state['secplugs_plugin_version']
    };
    const encoded_scancontext = encodeURIComponent(JSON.stringify(scan_context));

    // Build and return the url
    const endpoint = 'https://api.live.secplugs.com/security/web/quickscan';
    const encoded_url = encodeURIComponent(url);
    let request_url = `${endpoint}?url=${encoded_url}&scancontext=${encoded_scancontext}`;
    return request_url;
}

/**
 *   Returns promise that returns key value pairs for the provided
 *   key_list from chrome storage
 **/
export const getLocalStorageData = (key_list) => {

    // Check its an array of key names
    console.assert(Array.isArray(key_list));

    // Return the promise
    return new Promise((resolve, reject) => {

        // Read them from storage
        chrome.storage.local.get(key_list, (items) => {

            // Check for error
            if (chrome.runtime.lastError) {
                const msg = chrome.runtime.lastError.message;
                console.warn(`getLocalStorageData() - '${msg}'`);
                reject(msg);
            }
            // Resolve it with the data
            else {
                resolve(items);
            }

        });
    });
};

/**
 * Reads the local state data
 **/
export const getLocalState = () => {

    // The keys with our data
    const key_list = [
        'secplugs_scan_opt',
        'secplugs_key_type',
        'secplugs_api_key',
        'secplugs_client_uuid',
        'secplugs_scan_count'
    ];


    return getLocalStorageData(key_list)
        .then(storage_data => {

            // Read version from manifest
            const manifestData = chrome.runtime.getManifest();
            storage_data["secplugs_plugin_version"] = manifestData.version;
            return Promise.resolve(storage_data);
        });

};


export const setKey = () => {
    let text_val = document.getElementById('secplug-input-box').value;
    if (text_val && text_val.length) {
        chrome.storage.local.set({ "secplugs_api_key": text_val }, null);
        chrome.storage.local.set({ "secplugs_key_type": "paid" }, null);
        document.getElementById('visit_us').innerHTML = "Visit Secplugs.com";
        document.getElementById("secplug-input-div").remove();
    }
};

/**
 *   Sets up the defaults for the installation
 **/
export function setDefaults() {
    let def_api_key = "ILbW1sKwPs8CWO76E8ex47TR7zCZ2a8L50oq7sPI";
    const defaults = {
        "secplugs_scan_opt": "passive",
        "secplugs_key_type": "free",
        "secplugs_api_key": def_api_key,
        "secplugs_client_uuid": generateUUID(),
        "secplugs_scan_count": 0

    };

    // Set the defaults
    chrome.storage.local.set(defaults, null);
}

/**
 *   Sets the scan counter - e.g. to increment after a submission
 **/
export const setScanCount = (currScanCount) => {
    chrome.storage.local.set({ "secplugs_scan_count": currScanCount + 1 }, null);
};

export const setScan = (scanOpt) => {
    chrome.storage.local.set({ "secplugs_scan_opt": scanOpt }, null);
};

export const closeDiv = (id) => {
    try {
        document.getElementById(id).remove();
    }
    catch (err) {
        return;
    }

};

/** 
 *  Initiate a quick scan on a url via the secplugs api 
 *  Error handling: Prompts users for user actionable errors, logs to console for others
 **/
export function doWebQuickScan(url_to_scan, tabId, local_state) {

    // Check for urls we should not scan
    if (isUrlExcluded(url_to_scan)) {
        console.log(`url '${url_to_scan}' excluded.`);
        return;
    }

    // Get the headers
    const headers = getSecPlugsAPIHeaders(local_state['secplugs_api_key']);

    // Build the url
    const request_url = buildSecPlugsAPIRequestUrl(url_to_scan, local_state);

    // Make the request
    fetch(request_url, { method: "GET", headers: headers })
        .then(response => {

            // handle failure
            if (!response.ok) {

                // Pop up box on bad key or out of credit
                if (response.status === 403 || response.status === 429) {

                    // Display user actionable message to user 
                    exports.displayMessage("Ensure key is correct with sufficient credits.", tabId, 'alert');
                }
                else {

                    // Record error message and return false
                    const json_response = JSON.stringify(response.json());
                    const status = response.status;
                    var message = `fetch on '${request_url}' failed with status: ${status} and json :${json_response}`;
                    console.error(message);
                }

                // Done
                return;
            }

            // Load json
            const json_response = response.json();

            chrome.browserAction.setBadgeText({
                tabId: tabId,
                text: local_state['secplugs_scan_count'].toString()
            });

            chrome.browserAction.setIcon({ path: "./images/green_logo.png" });
            setTimeout(function() {
                chrome.browserAction.setBadgeText({
                    tabId: tabId,
                    text: ""
                });
                chrome.browserAction.setIcon({ path: "./images/logo.png" });
            }, 10000);

            setTimeout(function() {
                chrome.browserAction.setIcon({ path: "./images/logo.png" });
            }, 3000);

            chrome.browserAction.setBadgeBackgroundColor({
                tabId: tabId,
                color: "#595959"
            });

            // Increment
            exports.setScanCount(local_state["secplugs_scan_count"] + 1);

            // todo: only show when instigated manually?
            if (local_state['secplugs_scan_opt'] === "manual")
                if (json_response["score"] <= 40) {
                    displayMessage("This is a malicious page.", tabId, 'alert');
                }
            else {
                displayMessage("This is a clean page.", tabId, 'info');
            }

        })
        .catch(error => {

            // Log the error
            console.error(error);
        });

}
