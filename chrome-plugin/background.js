chrome.tabs.onUpdated.addListener(function onTabUpdate(tabId, changeInfo, tab) {
    if(changeInfo.url && !changeInfo.url.includes("chrome")) {                
        url = "https://api.live.secplugs.com/security/web/quickscan?url=" + changeInfo.url
        fetch(url, {
            method: "GET",
            headers: {
                "accept": "application/json",
                "x-api-key": "02Kryf0eidI4c6gNdiUwakibspl8gRm5yTtst69d"
            }
        })
          .then(
              function(response){
                  if(response.status === 200) {
                      response.json().then(
                          function(data){
                              if(data["score"] <= 60){
                                alert("Score for this webpage is " + data["score"])
                              }else{
                                  console.log("This webpage is clean")
                              }  
                          }
                      )
                  }else{
                      return
                  }
              }
          )
          .catch()
    }    
}); 