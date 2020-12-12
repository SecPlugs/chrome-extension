'use strict';

/* global chrome, jest, expect */

// Common post test clean up
afterEach(() => {
    jest.clearAllMocks();
});

require('../background.js');
const utils = require('../modules/utils');

describe('test chrome onInstalled event', () => {

    it('sets up defaults when installed', () => {

        utils.setDefaults = jest.fn();
        chrome.runtime.onInstalled.callListeners({ reason: "install" });
        expect(utils.setDefaults).toBeCalled();

    });
    it('does not set defaults when updated', () => {

        utils.setDefaults = jest.fn();
        chrome.runtime.onInstalled.callListeners({ reason: "updated" });
        expect(utils.setDefaults).not.toBeCalled();

    });
});


describe('test chrome onMessage event', () => {
    it('test chrome.runtime.onMessage is called', () => {
        const messageListenerSpy = jest.fn();
        const sendResponse = jest.fn();
        let response = [{ tabId: 1, url: "http://invalid.com" }];

        chrome.tabs.query.mockImplementation((message, callback) => callback(response));
        chrome.runtime.onMessage.addListener(messageListenerSpy);
        chrome.runtime.onMessage.callListeners({ action: "scan_url" }, null, sendResponse);
        expect(messageListenerSpy).toBeCalledWith({ action: "scan_url" }, null, sendResponse);
        expect(chrome.storage.local.get).toBeCalled();
    });

    it('test action is not scan_url', () => {
        const messageListenerSpy = jest.fn();
        const sendResponse = jest.fn();
        let response = [{ tabId: 1, url: "http://invalid.com" }];

        chrome.tabs.query.mockImplementation((message, callback) => callback(response));
        chrome.runtime.onMessage.addListener(messageListenerSpy);
        chrome.runtime.onMessage.callListeners({ action: "not_scan_url" }, null, sendResponse);
        expect(messageListenerSpy).toBeCalledWith({ action: "not_scan_url" }, null, sendResponse);
        expect(chrome.storage.local.get).not.toBeCalled();
    });
});



describe('test chrome.tabs.onUpdated events', () => {

    it('correctly sends new urls to utils.doWebQuickScanfor scanning', () => {

        expect.assertions(2);

        // Mock getLocalState
        let mock_local_state = {
            "secplugs_scan_opt": "passive",
            "secplugs_api_key": "test_api_key",
            "secplugs_scan_count": 5
        };
        utils.getLocalState = jest.fn(() => Promise.resolve(mock_local_state));

        // Mock doWebQuickScan
        utils.doWebQuickScan = jest.fn();

        const test_url = "http://test.url.com/folder";
        const tab_id = 1;

        // Call it
        return Promise.resolve(chrome.tabs.onUpdated.callListeners(tab_id, { url: test_url }, null))
            .then(result => {
                expect(utils.getLocalState).toBeCalled();
                expect(utils.doWebQuickScan).toBeCalledWith(test_url, tab_id, mock_local_state);
            });
    });

    it('does not scan when disabled', () => {

    });
});
