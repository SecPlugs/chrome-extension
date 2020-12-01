/* global chrome, jest, expect */

afterEach(() => {
    jest.clearAllMocks();
 });
 
const utils = require('../modules/utils');

describe('Test getKey in utils.js', () => {
    it('Test reject', () => {
        const message = ['a'];
        const response = "b";
        chrome.storage.local.get.mockImplementation(
            (message, callback) => {
                callback(response);
            }
        );
        return utils.getKey().catch(data => {        
            expect(data).toEqual("API Key needs to be set");
        });
    });
    
    it('Test resolve', () => {
        const message = ['a'];
        const response = {"secplug_api_key": "invalid_key"};
        chrome.storage.local.get.mockImplementation(
            (message, callback) => {
                callback(response);
            }
        );
        return utils.getKey().then(data => {        
            expect(data).toEqual("invalid_key");
        });
    });
});

describe('Test getScanKey in utils.js', () => {
    it('getScanKey from local storage', () => {
        const message = ['a'];
        const response = {"secplug_scan_count": "0"};
        chrome.storage.local.get.mockImplementation(
            (message, callback) => {
                callback(response);
            }
        );
        return utils.getScanCount().then(data => {
            expect(data).toEqual("0");
        });
    });
});

describe('Test setKey in utils.js', ()=> {
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
        expect(chrome.storage.local.set).toHaveBeenCalledWith({"secplug_api_key": "new_key"}, null);

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

describe('Test setDefaultAPIKey in utils.js', () => {
    it('setKey in local storage', () => {
        utils.setDefaultApiKey();
        expect(chrome.storage.local.set).toHaveBeenCalledWith({"secplug_api_key": "ILbW1sKwPs8CWO76E8ex47TR7zCZ2a8L50oq7sPI"}, null);
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
    it('test if secplug_scan_opt gets set', () => {
        utils.setScan("my-option");
        expect(chrome.storage.local.set).toHaveBeenCalledWith({"secplug_scan_opt": "my-option"}, null);
    });
});

describe('Test getKeyType in utils.js', () => {
    it('Test reject', () => {
        const message = ['a'];
        const response = "b";
        chrome.storage.local.get.mockImplementation(
            (message, callback) => {
                callback(response);
            }
        );
        return utils.getKeyType().catch(data => {        
            expect(data).toEqual("API Key type not set");
        });
    });

    it('Test resolve', () => {
        const message = ['a'];
        const response = {"secplug_key_type": "invalid_key_type"};
        chrome.storage.local.get.mockImplementation(
            (message, callback) => {
                callback(response);
            }
        );
        return utils.getKeyType().then(data => {
            expect(data).toEqual("invalid_key_type");
        });
    });
});

describe('Test getScan in utils.js', () => {
    it('Test reject', () => {
        const message = ['a'];
        const response = "b";
        chrome.storage.local.get.mockImplementation(
            (message, callback) => {
                callback(response);
            }
        );
        return utils.getScan().catch(data => {        
            expect(data).toEqual("Scan Option not selected");
        });
    });
    
    it('Test resolve', () => {
        const message = ['a'];
        const response = {"secplug_scan_opt": "invalid_opt"};
        chrome.storage.local.get.mockImplementation(
            (message, callback) => {
                callback(response);
            }
        );
        return utils.getScan().then(data => {
            expect(data).toEqual("invalid_opt");
        });
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
        "ftp://ftp.com"];
    for (const url of excluded_urls){
        it(`${url} is excluded`, () => {
            expect(utils.isUrlExcluded(url)).toBe(true);
        });
    }
    
    // Test excluded urls
    let normal_urls = [
        "http://someurl.com", 
        "https://www.com",
        "http://www.secplugs.com.bad.uk"];
    for (const url of normal_urls){
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
  
    it(`formated string contains api end point`, () => {
      
        const request_url = utils.buildSecPlugsAPIRequestUrl(test_url);
        const expected_request_url = 
            "https://api.live.secplugs.com/security/web/quickscan?url=http%3A%2F"
            + "%2Ftest.com%2Fpath%3Fname%3Dvalue&scancontext=%7B%22client_id%22%3"
            + "A%22test_client_id%22%2C%22plugin_version%22%3A%22test_plugin_version%22%7D";
        expect(typeof request_url).toEqual('string');
        expect(request_url).toEqual(expected_request_url);
        
    });
});

describe('Test getLocalStorageData ', () => {
    
    it('Test reject', () => {
        const key_list = ['bad_key1','bad_key2'];
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
        
        // Test reject call back called
        utils.getLocalStorageData(key_list)
        .then(data => {
            // should NOT resolve
            expect(false).toEqual(true);
        }, data => {
            // should reject
            expect(data).toEqual(last_error.message);
        });
        
        // Test catch is called
        utils.getLocalStorageData(key_list)
        .then(data => {
            // should NOT resolve
            expect(false).toEqual(true);
        })
        .catch(data => {
            // should reject
            expect(data).toEqual(last_error.message);
        });
        
    });
    
    it('Test resolve', () => {
        const key_list = ["key1","key2"];
        const returned_data = {"key1" : "value1", "key2" : "value2"};
        chrome.storage.local.get.mockImplementation(
            (key_list, callback) => {
                callback(returned_data);
            }
        );
        return utils.getLocalStorageData(key_list)
        .then(data => {  
            // should resolve
            expect(data).toEqual(returned_data);
        })
        .catch(data => {
            // should NOT reject
            expect(false).toEqual(true);
        });
    });
});

describe('Test doScan in utils.js', () => {
    
    const test_url = "http://invalid.com";
    const expected_request_url = utils.buildSecPlugsAPIRequestUrl(test_url);
    const tabId = 1;
    
    const api_key = 'test_api_key';
    const stored_secplug_api_key = {"secplug_api_key": api_key};
    const expected_headers = utils.getSecPlugsAPIHeaders(api_key);
    
    // Setup tests
    beforeEach(() => {
        
        // Mock storage get() to return stored_secplug_api_key
        chrome.storage.local.get.mockImplementation(
            (key, callback) => {
                callback(stored_secplug_api_key);
            }
        );
    });
  
    it('various url scan cases', async() => {
        
       

        
        // Mock fetch
        global.fetch = jest.fn();
        
        
        await utils.doScan(test_url);
        expect(global.fetch).toHaveBeenCalledWith(
            expected_request_url, 
            {method: "GET", headers: expected_headers});
 
    });
        
    it('various url scan cases', async() => {
        
        
        // Mock fetch
        global.fetch = jest.fn();
        
        
        await utils.doScan(test_url);
        expect(global.fetch).toHaveBeenCalledWith(
            expected_request_url, 
            {method: "GET", headers: expected_headers});
        global.fetch.mockClear();
        delete global.fetch;    

        global.fetch = jest.fn(() => Promise.resolve({
            'status': 200,
            json: () => JSON.parse('{"score": 20}'),
            ok: true

        }));
        await utils.doScan(test_url, tabId);
        expect(global.fetch).toHaveBeenCalledWith(
            expected_request_url, 
            {method: "GET", headers: expected_headers});

        global.fetch = jest.fn(() => Promise.resolve({
            'status': 403,
            json: () => JSON.parse('{"score": 20}'),
            ok: false

        }));
        await utils.doScan(test_url, tabId);
        expect(global.fetch).toHaveBeenCalledWith(
            expected_request_url, 
            {method: "GET", headers: expected_headers});

        global.fetch = jest.fn(() => Promise.resolve({
            'status': 400,
            json: () => JSON.parse('{"score": 21}'),
            ok: false

        }));
        await utils.doScan(test_url, tabId);
        expect(global.fetch).toHaveBeenCalledWith(
            expected_request_url, 
            {method: "GET", headers: expected_headers});

        global.fetch = jest.fn(() => Promise.resolve({
            'status': 200,
            json: () => JSON.parse('{"score": 50}'),
            ok: true

        }));
        await utils.doScan(test_url, tabId);
        expect(global.fetch).toHaveBeenCalledWith(
            expected_request_url,
            {method: "GET", headers: expected_headers});

        global.fetch = jest.fn(() => Promise.resolve({
            'status': 200,
            json: () => JSON.parse('{"score": 80}'),
            ok: true

        }));
        await utils.doScan(test_url, tabId);
        expect(global.fetch).toHaveBeenCalledWith(
            expected_request_url,
            {method: "GET", headers: expected_headers});

        const message2 = ['a'];
        const response2 = {"secplug_scan_count": "1"};
        chrome.storage.local.get.mockImplementation(
            (message2, callback2) => {
                callback2(response2);
            }
        );
        await utils.doScan(test_url, tabId);
        expect(global.fetch).toHaveBeenCalledWith(
            expected_request_url,
            {method: "GET", headers: expected_headers});
    });
});