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

    afterAll(() => {
        // Clear these mocks
        global.fetch = jest.fn();
    });

    // Test contants 
    const new_key = 'new_key';
    const expected_data = {
        "secplugs_api_key": new_key,
        "secplugs_key_type": "registered"
    };

    const local_state = {
        "secplugs_security_api": 'https://mockendpoint/path'
    };

    it('does not set the key if its empty', () => {

        expect.assertions(1);

        utils.setKey('', local_state).catch(() => {
            expect(chrome.storage.local.set).not.toHaveBeenCalledWith();
        });

    });

    it('does not set the key if healtcheck call fails', () => {

        expect.assertions(1);

        // Mock fetch to pass
        global.fetch = jest.fn(() => Promise.resolve({
            'status': 403,
            json: () => {},
            ok: false
        }));

        utils.setKey(new_key, local_state).catch(() => {
            expect(chrome.storage.local.set).not.toHaveBeenCalledWith();
        });

    });

    it('sets the key if its valid and healtcheck passes', () => {

        expect.assertions(1);

        // Mock fetch to pass
        global.fetch = jest.fn(() => Promise.resolve({
            'status': 200,
            json: () => {},
            ok: true
        }));


        utils.setKey(new_key, local_state).then(() => {
            expect(chrome.storage.local.set).toHaveBeenCalledWith(expected_data, null);
        });

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
        global.fetch = jest.fn();
    });


    it('sets up the values returned by getLocalState', () => {

        // Set mock data
        const mock_data = {
            "default_api_key": "ILbW1sKwPs8CWO76E8ex47TR7zCZ2a8L50oq7sPI",
            "security_api": "https://api.live.secplugs.com/security"
        };

        // Mock fetch
        global.fetch = jest.fn(() => Promise.resolve({
            'status': 200,
            json: () => mock_data,
            ok: true
        }));


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
                return utils.setDefaults()
                    .then(() => {

                        // .. now get state
                        return utils.getLocalState()
                            .then(local_state => {

                                // .. other values should be setup
                                expect(local_state['secplugs_key_type']).toEqual("anonymous");
                                expect("secplugs_api_key" in local_state).toBe(true);
                                expect(local_state["secplugs_plugin_version"]).toBe(test_version);
                                expect(local_state["secplugs_client_uuid"]).toMatch(regex_uudiv4);
                            });
                    });
            });
    });
});


describe("setAutoScan", () => {
    it('test if secplugs_auto_scan_enabled gets set', () => {
        chrome.storage.local.set = jest.fn();
        utils.setAutoScan("false");
        expect(chrome.storage.local.set).toHaveBeenCalledWith({ "secplugs_auto_scan_enabled": "false" }, null);
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
        "http://192.168.2.1",
        "https://127.0.0.1/folder",
        "ftp://ftp.com"
    ];
    for (const url of excluded_urls) {
        it(`${url} is excluded`, () => {
            expect(utils.isUrlExcluded(url)).toBe(true);
        });
    }

    // Test included urls
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

describe('Test getSecplugsAPIHeaders ', () => {

    const api_key = 'test_api_key';
    const expected_headers = {
        "accept": "application/json",
        "x-api-key": api_key
    };

    it(`headers well formed`, () => {

        expect(utils.getSecplugsAPIHeaders(api_key)).toEqual(expected_headers);
        expect(utils.getSecplugsAPIHeaders('bad_key_')).not.toEqual(expected_headers);
    });
});

describe('Test buildSecplugsAPIRequestUrl ', () => {

    const test_url = 'http://test.com/path?name=value';
    const test_capability = "/web/quickscan";

    it('request url is build ok', () => {

        const test_client_uuid = 'test_uuid';
        const test_plugin_version = '2.7.1.8';
        const mock_local_state = {
            'secplugs_client_uuid': test_client_uuid,
            'secplugs_plugin_version': test_plugin_version,
            'secplugs_security_api': 'https://api.com/path'
        };

        const request_url = utils.buildSecplugsAPIRequestUrl(test_url, mock_local_state, test_capability);
        const parsed_url = new URL(request_url);
        const scan_context = JSON.parse(decodeURIComponent(parsed_url.searchParams.get('scancontext')));
        expect(parsed_url.hostname).toEqual('api.com');
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

describe('test doWebAnalysis', () => {

    const api_key = 'test_api_key';
    const tab_id = 72;
    const mock_local_state = {
        "secplugs_auto_scan_enabled": "true",
        "secplugs_api_key": api_key,
        "secplugs_scan_count": 5
    };

    const test_url = "http://invalid.com";
    const test_capability = "/web/quickscan";
    const expected_request_url = utils.buildSecplugsAPIRequestUrl(test_url, mock_local_state, test_capability);
    const expected_headers = utils.getSecplugsAPIHeaders(api_key);
    const test_sync_result = {
        status: 'success',
        score: 20,
        verdict: 'trusted',
        report_id: 'test_report_id',
        threat_object: { url: test_url }
    };
    const test_async_result = {
        status: 'pending',
        report_id: 'test_report_id',
        threat_object: { url: test_url }
    };

    // Helper function to wrap in promise and supply mocked state
    function helperDoWebQuickScan(url_to_scan, tabId, scan_progress_callback = null) {
        return Promise.resolve(utils.doWebAnalysis(url_to_scan, tabId, mock_local_state, test_capability, scan_progress_callback));
    }



    it('does successful asynchronous lookup', done => {

        expect.assertions(5);

        // Mock fetch,  return pending then success
        global.fetch = jest.fn();
        global.fetch
            .mockReturnValueOnce(
                Promise.resolve({
                    'status': 200,
                    json: () => Promise.resolve(test_async_result),
                    ok: true
                }))
            .mockReturnValue(
                Promise.resolve({
                    'status': 200,
                    json: () => Promise.resolve(test_sync_result),
                    ok: true
                })
            );

        // Mocks
        chrome.storage.local.set = jest.fn(); // setScanCount

        function test_scan_progress_callback(scan_status) {

            if (scan_status['status'] == 'success') {
                expect(chrome.storage.local.set).toHaveBeenCalledWith({ "secplugs_scan_count": mock_local_state["secplugs_scan_count"] + 1 }, null);
                //expect(setTimeout).toHaveBeenCalledTimes(1);
                expect(global.fetch.mock.calls.length).toEqual(2);
                done();
            }

            if (scan_status['status'] == 'pending') {
                expect(chrome.storage.local.set).not.toHaveBeenCalled();
            }
        }

        // Run the test
        return helperDoWebQuickScan(test_url, tab_id, test_scan_progress_callback)
            .then(() => {

                expect(global.fetch).toHaveBeenCalledWith(
                    expected_request_url, { method: "GET", headers: expected_headers });
                expect(global.fetch.mock.calls.length).toEqual(1);

            });

    });
    it('does successful synchronous lookup', (done) => {

        expect.assertions(2);

        // Mock fetch
        global.fetch = jest.fn(() => Promise.resolve({
            'status': 200,
            json: () => Promise.resolve(test_sync_result),
            ok: true
        }));

        // Mocks
        chrome.storage.local.set = jest.fn(); // setScanCount

        function test_scan_progress_callback(scan_status) {
            if (scan_status['status'] == 'success') {
                expect(chrome.storage.local.set).toHaveBeenCalledWith({ "secplugs_scan_count": mock_local_state["secplugs_scan_count"] + 1 }, null);
                done();
            }
        }

        // Run the test
        return helperDoWebQuickScan(test_url, tab_id, test_scan_progress_callback)
            .then(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    expected_request_url, { method: "GET", headers: expected_headers });

            });

    });



    it('handles a bad api key', () => {

        expect.assertions(3);

        // Mock fetch to return 
        global.fetch = jest.fn(() => Promise.resolve({
            'status': 403,
            json: () => Promise.resolve({ message: "error message" }),
            ok: false
        }));

        // Mocks
        var scan_progress_callback = jest.fn(); // call back from progress
        chrome.storage.local.set = jest.fn(); // setScanCount

        return helperDoWebQuickScan(test_url, tab_id, scan_progress_callback)
            .then(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    expected_request_url, { method: "GET", headers: expected_headers });

                expect(scan_progress_callback.mock.calls.length).toEqual(1);
                expect(chrome.storage.local.set).not.toHaveBeenCalled();

            });
    });


});
