import {setKey, closeDiv, setScan, getScan, getKeyType} from "./utils.js";
document.addEventListener('DOMContentLoaded', function () {    
    document.getElementById("api_link").addEventListener("click", inputKey)
    document.getElementById("auto_link").addEventListener("click", function(){
        setScan("passive")
        document.getElementById("auto_link").style.backgroundColor = "#6666ff"
        window.close()
    })
    document.getElementById("manual_link").addEventListener("click", function(){
        setScan("manual")
        console.log("manual")
        document.getElementById("manual_link").style.backgroundColor = "#6666ff"
        window.close()
    })
    getScan()
         .then(scanSetting => {
             if(scanSetting === "manual"){
                document.getElementById("manual_link").style.backgroundColor = "#6666ff"
             }else{
                document.getElementById("auto_link").style.backgroundColor = "#6666ff"
             }
         })
    getKeyType()
         .then(keyType => {
             if(keyType !== "paid"){
                document.getElementById('visit_us').innerHTML = "Go Premium!"
             }
         })
    document.getElementById("scan_link").addEventListener("click", function(){
        chrome.runtime.sendMessage({action: "scan_url"}, null)
        window.close()
    })
});

export const inputKey = () => {
    var body   = document.body || document.getElementsByTagName('body')[0];
    var newpar = document.createElement('div');
    var inputBox = document.createElement('input');
    var buttonKey = document.createElement('input');

    newpar.setAttribute("id", "secplug-input-div");
    newpar.style.height = "20%";
    newpar.style.width = "100%";
    newpar.style.zIndex = "10000";
    newpar.style.backgroundColor = "#ffeb99";
    newpar.style.fontSize = "15";
    newpar.style.textAlign = "center";
    newpar.style.verticalAlign = "middle";
    newpar.style.fontFamily = "sans-serif, Lato, Times New Roman";
    newpar.style.position = "-webkit-sticky";
    newpar.style.position = "sticky";
    newpar.style.bottom = "0";
    newpar.addEventListener("click", function(event){
        if (event.target == event.currentTarget){
            closeDiv("secplug-input-div");
        }
    }, false);

    inputBox.setAttribute("id", "secplug-input-box");
    inputBox.setAttribute("type", "text");
    inputBox.setAttribute("placeholder", "Enter Secplug API Key");
    inputBox.style.position = "-webkit-sticky";
    inputBox.style.position = "sticky";
    inputBox.style.top = "5%";

    buttonKey.setAttribute("id", "secplug-button-key");
    buttonKey.setAttribute("type", "submit");
    buttonKey.setAttribute("value", "Done");
    buttonKey.style.border = "None";
    buttonKey.style.backgroundColor = "black";
    buttonKey.style.color = "White";
    buttonKey.style.marginLeft = "5px";
    buttonKey.style.position = "-webkit-sticky";
    buttonKey.style.position = "sticky";
    buttonKey.style.top = "5%";
    buttonKey.addEventListener("click", function(event){
        if(event.target == event.currentTarget){
            setKey();
        }
    });

    if(document.getElementById('secplug-input-div')){
        document.getElementById('secplug-input-div').remove();
    }

    newpar.appendChild(inputBox);
    newpar.appendChild(buttonKey);
    body.insertBefore(newpar,body.childNodes[0]);

}
