import { fetchGet } from './modules/utils.js'
chrome.tabs.onUpdated.addListener(function onTabUpdate(tabId, changeInfo, tab) {
    if(changeInfo.url && !changeInfo.url.includes("chrome")) {       
        let url = "https://api.live.secplugs.com/security/web/quickscan?url=" + changeInfo.url
        let headers = {
            "accept": "application/json",
            "x-api-key": "02Kryf0eidI4c6gNdiUwakibspl8gRm5yTtst69d"
        }
        fetchGet(url, headers)
        .then(data => {
            if(data["score"] <= 60){
                alert("Score for this webpage is " + data["score"])
            }else{
                console.log("This webpage is clean")
            } 
        }
            
        )                
    }    
}); 