/* global chrome, fetch */

/**
 * Utilities for Secplugs Browse Secure Chrome Extension
 * @author stig@secplugs.com
 * @license MIT License
 * @link https://seclugs.com
 **/


/**
 * Fast UUID generator, RFC4122 version 4 compliant.
 * http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136
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
 * Returns true if the url is a supported scheme
 **/
export function isUrlSchemeSupported(url) {

    // Check its a supported scheme
    var uriPattern = /^((http|https):\/\/)/;
    if (uriPattern.test(url)) {
        return true;
    }

    return false;
}

/**
 * Returns true of the url is excluded from scanning
 **/
export function isUrlExcluded(url) {

    // Check its a valid scheme
    if (!isUrlSchemeSupported(url)) {
        return true;
    }

    // Check its not secplugs.com
    var secplugsPattern = /^((http|https):\/\/(www.|)secplugs.com(\/[^\n]*|))$/;
    if (secplugsPattern.test(url)) {
        return true;
    }

    // Check its not a local ip addesss
    var localIPPattern = /^(http|https):\/\/((127)|(10)|(172\.(1[6-9]|2[0-9]|3[0-1]))|(192\.168))\./;
    if (localIPPattern.test(url)) {
        return true;
    }

    // Ok to scan
    return false;
}

/**
 *   Get the headers for a secplugs API call
 **/
export function getSecplugsAPIHeaders(api_key) {

    let headers = {
        "accept": "application/json",
        "x-api-key": api_key
    };

    return headers;
}

/**
 *   Format the url for the request
 * todo: pass variables and not local state
 **/
export function buildSecplugsAPIRequestUrl(url, local_state, capability) {

    // Check valid url
    console.assert(
        typeof url == 'string' &&
        url.startsWith('http'),
        'url with scheme expected');

    // Check valid capability
    const capabilities = ['/web/score', '/web/quickscan', '/web/deepscan'];
    console.assert(capabilities.includes(capability));

    // Scan context
    const scan_context = {
        'client_uuid': local_state['secplugs_client_uuid'],
        'plugin_version': local_state['secplugs_plugin_version']
    };
    const encoded_scancontext = encodeURIComponent(JSON.stringify(scan_context));

    // Build and return the url
    const endpoint = local_state['secplugs_security_api'] + capability;
    const encoded_url = encodeURIComponent(url);
    let request_url = `${endpoint}?url=${encoded_url}&scancontext=${encoded_scancontext}`;
    return request_url;
}

/**
 * Maps an api response to a scan status
 **/
function map_json_response_2_scan_status(json_response) {

    // Build status object
    const scan_status = {
        url: json_response['threat_object']['url'],
        status: json_response['status'],
        score: json_response['score'],
        verdict: json_response['verdict'],
        report_id: json_response['report_id'],
        message: ""
    };

    // Done
    return scan_status;
}

/**
 * Call back function that will poll for a report 
 * until success or failure
 * status reported back via scan_progress_callback 
 **/
function poll_for_report(security_api, api_key, report_id, scan_progress_callback, polling_interval = 500) {

    // Timeout when interval is too large
    const max_interval = 60 * 1000 * 5; // 5 mins
    if (polling_interval > max_interval) {
        console.assert(false, `timed out waiting for ${report_id}`);
    }

    // Get the headers
    const headers = getSecplugsAPIHeaders(api_key);

    // Build the url to poll for the report
    let poll_request_url = security_api + `/${report_id}`;
    fetch(poll_request_url, { method: "GET", headers: headers })
        .then(response => {

            // todo: report failure to scan_progress_callback
            console.assert(response.ok);

            // Load json
            response.json()
                .then(json_response => {

                    // Check status and report back
                    var scan_status = map_json_response_2_scan_status(json_response);
                    scan_progress_callback && scan_progress_callback(scan_status);

                    // Reschedule if still pending
                    if (json_response['status'] == 'pending') {

                        // Call with exponential back off polling_interval
                        setTimeout(() => {

                                poll_for_report(
                                    report_id,
                                    security_api,
                                    api_key,
                                    scan_progress_callback,
                                    polling_interval * 2);
                            },
                            polling_interval
                        );
                    }
                });
        });

}

/** 
 *  Process the response from Secplugs scan 
 *  
 **/
function processAPIResponse(security_api, api_key, response, scan_progress_callback) {


    // First handle api failure
    if (!response.ok) {

        // Format message
        var message = "";
        const status_code = response.status;
        if (status_code === 403 || status_code === 429) {
            message = "Ensure key is correct with sufficient credits.";
        }
        else {
            message = `The request to the service failed with ${status_code}`;
        }

        // Send failure status if we have a call back
        if (scan_progress_callback) {

            // Build status
            const scan_status = {
                url: null,
                status: 'failure',
                score: null,
                verdict: null,
                report_id: null,
                message: message
            };

            // Update progress 
            scan_progress_callback(scan_status);
        }

        // Done
        return;
    }

    // Load json
    response.json()
        .then(json_response => {

            // Check status and report back
            var scan_status = map_json_response_2_scan_status(json_response);
            if (scan_progress_callback) {
                scan_progress_callback(scan_status);
            }

            // Get report id
            const report_id = json_response['report_id'];

            // Reschedule if still pending
            if (json_response['status'] == 'pending') {

                // Call with exponential back off polling_interval
                setTimeout(() => {
                    poll_for_report(
                        report_id,
                        security_api,
                        api_key,
                        scan_progress_callback);
                }, 0 /* todo: what should the initial poll interval be */ );
            }
        });


    // Handle invalid json case
    // todo:

    // Handle pending case 
    // todo:


    // Handle success case 
    // todo:

    // Handle failure case 
    // todo:

}


/** 
 * Update the ui with status 
 */
function updateUIWithScanStatus(tab_id, local_state, scan_status) {


    const status = scan_status['status'];
    if (status == 'pending') {
        // todo:
    }
    else if (status == 'failure') {
        // todo:
    }
    else if (status == 'success') {

        // Cur count 
        const cur_scan_count = local_state['secplugs_scan_count'];


        chrome.browserAction.setBadgeText({
            tabId: tab_id,
            text: (cur_scan_count + 1).toString()
        });

        chrome.browserAction.setIcon({ path: "./images/green_logo.png" });
        setTimeout(function() {
            chrome.browserAction.setBadgeText({
                tabId: tab_id,
                text: ""
            });
            chrome.browserAction.setIcon({ path: "./images/logo.png" });
        }, 10000);

        setTimeout(function() {
            chrome.browserAction.setIcon({ path: "./images/logo.png" });
        }, 3000);

        chrome.browserAction.setBadgeBackgroundColor({
            tabId: tab_id,
            color: "#595959"
        });

        // Increment
        setScanCount(cur_scan_count + 1);

    }
    else {
        console.assert(false, 'bad status');
    }

}

/** 
 *  Initiate a quick scan on a url via the secplugs api 
 *  Optionally takes a progress call back
 **/
export function doWebAnalysis(url_to_scan, tabId, local_state, capability = '/web/quickscan', scan_progress_callback = null) {

    // Check for urls we should not scan
    if (isUrlExcluded(url_to_scan)) {
        console.log(`
                url '${url_to_scan}'
                excluded.
                `);
        if (scan_progress_callback) {

            // Build status
            const scan_status = {
                url: url_to_scan,
                status: 'failure',
                score: null,
                verdict: null,
                report_id: null,
                message: 'This URL is excluded from scanning.'
            };

            // Send update
            scan_progress_callback(scan_status);
        }
        return;
    }

    // Get the headers
    const headers = getSecplugsAPIHeaders(local_state['secplugs_api_key']);

    // Build the url
    const request_url = buildSecplugsAPIRequestUrl(url_to_scan, local_state, capability);

    // Make the request
    fetch(request_url, { method: "GET", headers: headers })
        .then(response => {

            // Process the response
            processAPIResponse(
                local_state['secplugs_security_api'],
                local_state['secplugs_api_key'],
                response,

                // Progress call back
                (scan_status) => {

                    // Update the ui
                    scan_status['url'] = url_to_scan;
                    updateUIWithScanStatus(tabId, local_state, scan_status);
                    scan_progress_callback && scan_progress_callback(scan_status);

                });
        })
        .catch(error => {

            // Log the error
            console.error(error);
        });

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
                console.warn(`
                getLocalStorageData() - '${msg}'
                `);
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
        'secplugs_auto_scan_enabled',
        'secplugs_key_type',
        'secplugs_api_key',
        'secplugs_client_uuid',
        'secplugs_scan_count',
        'secplugs_security_api'
    ];


    return getLocalStorageData(key_list)
        .then(storage_data => {

            // Read version from manifest
            const manifestData = chrome.runtime.getManifest();
            storage_data["secplugs_plugin_version"] = manifestData.version;
            return Promise.resolve(storage_data);
        });

};

/**
 *  Returns a promise that stores the api key and flags as registered if its valid and passes health check
 *  otherwise rejects with error messsage
 **/
export const setKey = (new_api_key, local_state) => {

    return new Promise((resolve, reject) => {

        // Check for invalid string
        if (!new_api_key || !new_api_key.length) {

            // Bad key
            reject('The key is invalid or empty.');
        }

        // Check it is an authorised api-key by calling health check
        const headers = getSecplugsAPIHeaders(new_api_key);

        // Build the end point url for the health check
        const healthcheck_request_url = local_state['secplugs_security_api'] + '/healthcheck';

        // Make the request
        fetch(healthcheck_request_url, { method: "GET", headers: headers })
            .then(response => {

                // handle failure
                if (!response.ok) {

                    reject('That api key is not authorised.');
                }
                else {

                    // Success - store the key and flag as registered
                    const data_to_store = {
                        "secplugs_api_key": new_api_key,
                        "secplugs_key_type": "registered"
                    };

                    // Store it then resolve
                    chrome.storage.local.set(data_to_store, null);
                    resolve(new_api_key);
                }
            });

    });

};

/**
 *   Sets up the defaults for the installation
 **/
export function setDefaults() {

    // Load defaults from our data file 
    const data_file_url = chrome.runtime.getURL('data.json');

    // Load the file
    return fetch(data_file_url)
        .then((response) => response.json()) //assuming file contains json
        .then((json_defaults) => {

            // Read the default values
            let default_api_key = json_defaults["default_api_key"];
            let default_security_api = json_defaults["security_api"];
            const defaults = {
                "secplugs_auto_scan_enabled": "true",
                "secplugs_key_type": "anonymous",
                "secplugs_api_key": default_api_key,
                "secplugs_client_uuid": generateUUID(),
                "secplugs_scan_count": 0,
                "secplugs_security_api": default_security_api
            };

            // Write the values to defaults
            return chrome.storage.local.set(defaults, null);
        });
}

/**
 *   Sets the scan counter - e.g. to increment after a submission
 **/
export const setScanCount = (newScanCount) => {
    chrome.storage.local.set({ "secplugs_scan_count": newScanCount }, null);
};

/**
 *   Enables auto scanning (enabled = 'true' or 'false') 
 **/
export const setAutoScan = (enabled) => {
    console.assert(['true', 'false'].includes(enabled));
    chrome.storage.local.set({ "secplugs_auto_scan_enabled": enabled }, null);
};
