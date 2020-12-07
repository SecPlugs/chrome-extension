'use strict';

/* global chrome, jest, expect, afterAll, URL */

// Testing constants
const regex_uudiv4 = new RegExp(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i);

// Common post test clean up
afterEach(() => {
    jest.clearAllMocks();
});

const utils = require('../modules/utils');

describe('Test setKey in utils.js', () => {
    it('setKey in local storage', () => {
        let div = document.createElement('div');
        div.setAttribute("id", "secplug-input-div");
        let input = document.createElement('input');
        input.setAttribute("id", "secplug-input-box");
        input.setAttribute("value", "new_key");
        let label = document.createElement('label');
        label.setAttribute("id", "visit_us");
        div.appendChild(input);
        div.appendChild(label);
        document.body.appendChild(div);
        utils.setKey();
        expect(chrome.storage.local.set).toHaveBeenCalledWith({ "secplugs_api_key": "new_key" }, null);
        div = document.createElement('div');
        div.setAttribute("id", "secplug-input-div");
        input = document.createElement('input');
        input.setAttribute("id", "secplug-input-box");
        input.setAttribute("value", "");
        label = document.createElement('label');
        label.setAttribute("id", "visit_us");
        div.appendChild(input);
        div.appendChild(label);
        document.body.appendChild(div);
        utils.setKey();
        expect(chrome.storage.local.set).not.toHaveBeenCalledWith();
    });
});

describe('Test utils.generateUUID', () => {

    it('generates different each time', () => {
        const uuid_1 = utils.generateUUID();
        const uuid_2 = utils.generateUUID();
        expect(uuid_1).toEqual(uuid_1);
        expect(uuid_1).not.toEqual(uuid_2);
    });

    it('matches uuid4 regex', () => {
        const uuid_1 = utils.generateUUID();
        expect(uuid_1).toMatch(regex_uudiv4);
    });

});

describe('Test setDefaults', () => {

    afterAll(() => {
        // Clear these mocks
        chrome.storage.local.set = jest.fn();
        chrome.storage.local.get = jest.fn();
        chrome.runtime.getManifest = jest.fn();
    });

    it('sets up the values returned by getLocalState', () => {

        // Mock the chrome storage get 
        var mock_chrome_storage = {};
        chrome.storage.local.get.mockImplementation(
            (key_list, callback) => {
                callback(mock_chrome_storage);
            }
        );

        // Mock the chrome storage set 
        chrome.storage.local.set.mockImplementation(
            (key_dict, callback) => {
                mock_chrome_storage = Object.assign(mock_chrome_storage, key_dict);
            }
        );

        // Mock the plugin version in manifest
        const test_version = '3.1.4.9';
        chrome.runtime.getManifest.mockImplementation(
            () => { return { "version": test_version }; }
        );

        // Get the state before ...
        return utils.getLocalState()
            .then(local_state => {

                expect.assertions(5);

                // .. should be version only
                const manifestData = chrome.runtime.getManifest();
                expect(local_state).toEqual({ "secplugs_plugin_version": manifestData.version });

                // Setup defaults
                utils.setDefaults();

                // .. now get state
                return utils.getLocalState()
                    .then(local_state => {

                        // .. other values should be setup
                        expect(local_state['secplugs_key_type']).toEqual("free");
                        expect("secplugs_api_key" in local_state).toBe(true);
                        expect(local_state["secplugs_plugin_version"]).toBe(test_version);
                        expect(local_state["secplugs_client_uuid"]).toMatch(regex_uudiv4);
                    });
            });
    });
});

describe('Test closeDiv in utils.js', () => {
    const originalDoc = global.document;
    const getElementById = jest.fn();
    beforeEach(() => {
        global.document.getElementById = getElementById;
    });
    afterAll(() => {
        global.document = originalDoc;
    });

    it('closeDiv will remove an element from DOM', () => {
        const div = document.createElement('div');
        div.setAttribute("id", "secplug-input-div");
        document.body.appendChild(div);
        const divParams = { "id": "secplug-input-div" };
        getElementById.mockReturnValue(divParams);
        utils.closeDiv("secplug-input-div");
        expect(document.getElementById).toHaveBeenCalledWith("secplug-input-div");
    });
});

describe("setScan in utils.js", () => {
    it('test if secplugs_scan_opt gets set', () => {
        chrome.storage.local.set = jest.fn();
        utils.setScan("my-option");
        expect(chrome.storage.local.set).toHaveBeenCalledWith({ "secplugs_scan_opt": "my-option" }, null);
    });
});

describe('Test isUrlExcluded ', () => {

    // Test excluded urls
    let excluded_urls = [
        "chrome://someurl.com",
        "https://secplugs.com",
        "https://secplugs.com/someparam",
        "http://www.secplugs.com",
        "http://www.secplugs.com/",
        "http://www.secplugs.com/path",
        "ftp://ftp.com"
    ];
    for (const url of excluded_urls) {
        it(`${url} is excluded`, () => {
            expect(utils.isUrlExcluded(url)).toBe(true);
        });
    }

    // Test excluded urls
    let normal_urls = [
        "http://someurl.com",
        "https://www.com",
        "http://www.secplugs.com.bad.uk"
    ];
    for (const url of normal_urls) {
        it(`${url} is NOT excluded`, () => {
            expect(utils.isUrlExcluded(url)).toBe(false);
        });
    }

});

describe('Test getSecPlugsAPIHeaders ', () => {

    const api_key = 'test_api_key';
    const expected_headers = {
        "accept": "application/json",
        "x-api-key": api_key
    };

    it(`headers well formed`, () => {

        expect(utils.getSecPlugsAPIHeaders(api_key)).toEqual(expected_headers);
        expect(utils.getSecPlugsAPIHeaders('bad_key_')).not.toEqual(expected_headers);
    });
});

describe('Test buildSecPlugsAPIRequestUrl ', () => {

    const test_url = 'http://test.com/path?name=value';

    it('request url is build ok', () => {

        const test_client_uuid = 'test_uuid';
        const test_plugin_version = '2.7.1.8';
        const mock_local_state = {
            'secplugs_client_uuid': test_client_uuid,
            'secplugs_plugin_version': test_plugin_version
        };

        const request_url = utils.buildSecPlugsAPIRequestUrl(test_url, mock_local_state);
        const parsed_url = new URL(request_url);
        const scan_context = JSON.parse(decodeURIComponent(parsed_url.searchParams.get('scancontext')));
        expect(parsed_url.hostname).toEqual('api.live.secplugs.com');
        expect(scan_context).toEqual({
            "client_uuid": test_client_uuid,
            "plugin_version": test_plugin_version
        });


    });
});

describe('Test getLocalStorageData ', () => {

    // Setup tests
    beforeEach(() => {

        // Mock console.warn
        global.console.warn = jest.fn();

    });

    it('handles chrome storage failure', () => {

        expect.assertions(2);

        const key_list = ['bad_key1', 'bad_key2'];
        const returned_data = {};
        const last_error = { "message": 'error message' };
        chrome.storage.local.get.mockImplementation(
            (key_list, callback) => {

                // Set the error to force failure
                chrome.runtime.lastError = last_error;
                callback(returned_data);
                delete chrome.runtime.lastError;
            }
        );


        // Test catch is called
        return utils.getLocalStorageData(key_list)
            .catch(data => {
                // should reject
                expect(data).toEqual(last_error.message);
                expect(global.console.warn).toHaveBeenCalled();
            });
    });

    it('recieves stored data correctly', () => {

        expect.assertions(2);

        const key_list = ["key1", "key2"];
        const returned_data = { "key1": "value1", "key2": "value2" };
        chrome.storage.local.get.mockImplementation(
            (key_list, callback) => {
                callback(returned_data);
            }
        );
        return utils.getLocalStorageData(key_list)
            .then(data => {
                // should resolve
                expect(data).toEqual(returned_data);
                expect(global.console.warn).not.toHaveBeenCalled();
            });
    });
});

describe('test doWebQuickScan', () => {

    const api_key = 'test_api_key';
    const tab_id = 72;
    const mock_local_state = {
        "secplugs_scan_opt": "passive",
        "secplugs_api_key": api_key,
        "secplugs_scan_count": 5
    };

    const test_url = "http://invalid.com";
    const expected_request_url = utils.buildSecPlugsAPIRequestUrl(test_url, mock_local_state);
    const expected_headers = utils.getSecPlugsAPIHeaders(api_key);

    // Helper function to wrap in promise and supply mocked state
    function helperDoWebQuickScan(url_to_scan, tabId) {
        return Promise.resolve(utils.doWebQuickScan(url_to_scan, tabId, mock_local_state));
    }

    it('does successful lookup', () => {

        expect.assertions(3);

        // Mock fetch
        global.fetch = jest.fn(() => Promise.resolve({
            'status': 200,
            json: () => JSON.parse('{"score": 20}'),
            ok: true
        }));

        // Mock displayMessage
        utils.displayMessage = jest.fn();

        // Mock setScan
        utils.setScanCount = jest.fn();

        return helperDoWebQuickScan(test_url, tab_id)
            .then(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    expected_request_url, { method: "GET", headers: expected_headers });

                expect(utils.displayMessage).not.toHaveBeenCalled();
                expect(utils.setScanCount).toHaveBeenCalledWith(mock_local_state["secplugs_scan_count"] + 1);

            });

    });


    it('handles a bad api key', () => {

        expect.assertions(3);

        // Mock fetch to return 
        global.fetch = jest.fn(() => Promise.resolve({
            'status': 403,
            json: () => JSON.parse('{}'),
            ok: false
        }));


        // Mock displayMessage
        utils.displayMessage = jest.fn();

        // Mock setScan
        utils.setScanCount = jest.fn();

        return helperDoWebQuickScan(test_url, tab_id)
            .then(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    expected_request_url, { method: "GET", headers: expected_headers });

                expect(utils.displayMessage.mock.calls.length).toEqual(1);
                expect(utils.setScanCount).not.toHaveBeenCalled();

            });
    });
});
