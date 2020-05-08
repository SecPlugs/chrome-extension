export const fetchGet = (url, headers_obj) => {
    const request =  fetch(url, {method: "GET", headers: headers_obj})
                          .then(response => response.json())
                          .catch()
    return request
}

export const fetchKey = () => {
    return new Promise(function(resolve, reject){
        chrome.storage.local.get({'secplug_api_key': ''}, function(key){            
            resolve(key.secplug_api_key)
        })
    })
}