export const fetchGet = (url, headers_obj) => {
    const request =  fetch(url, {method: "GET", headers: headers_obj})
                          .then(response => response.json())
                          .catch()
    return request
}