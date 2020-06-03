var body   = document.body || document.getElementsByTagName('body')[0],
    newpar = document.createElement('div');
    style = document.createElement('style');
    img = document.createElement('img')

img.setAttribute("src", chrome.runtime.getURL("./popup-logo.png"))
img.style.height = "25px"
img.style.width = "25px"
img.style.float = "left"

style.type = 'text/css';
var keyFrames = '\
@-webkit-keyframes fadein {\
    from {top: 0; opacity: 0;}\
    to {top: 30px; opacity: 1;}\
}\
@keyframes fadein {\
    from {top: 0; opacity: 0;}\
    to {top: 30px; opacity: 1;}\
}\
@-webkit-keyframes fadeout {\
    from {top: 30px; opacity: 1;} \
    to {top: 0; opacity: 0;}\
}\
@keyframes fadeout {\
    from {top: 30px; opacity: 1;}\
    to {top: 0; opacity: 0;}\
}\
';
style.innerHTML = keyFrames;
document.getElementsByTagName('head')[0].appendChild(style);

newpar.setAttribute("id", "secplug-error-div")
newpar.style.visibility = "visible"
newpar.style.minWidth = "20%"
newpar.style.marginLeft = "-125px"
newpar.style.backgroundColor = bg_color
newpar.style.textAlign = "center"
newpar.style.borderWidth = "thick"
newpar.style.borderStyle = "solid"
newpar.style.borderRadius = "12px"
newpar.style.borderColor = "#219bd9"
newpar.style.padding = "16px"
newpar.style.position = "fixed"
newpar.style.fontWeight = "500"
newpar.style.zIndex = "10000"
newpar.style.left = "45%"
newpar.style.top = "30px"
newpar.style.fontSize = "17px"
newpar.style.fontFamily = "apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol";
newpar.innerHTML = message;
if(message.indexOf("malicious") === -1){
    newpar.style.webkitAnimation = "fadein 0.5s, fadeout 0.5s 2.8s"
    newpar.style.animation = "fadein 0.5s, fadeout 0.5s 2.8s"
}

newpar.addEventListener("click", function(){
    closeDiv("secplug-error-div")
}, false)

if(document.getElementById('secplug-error-div')){
    document.getElementById('secplug-error-div').remove()
}
newpar.appendChild(img)
body.insertBefore(newpar,body.childNodes[0]);
setTimeout(function(){
    if(document.getElementById('secplug-error-div') && message.indexOf("malicious") === -1){
        closeDiv("secplug-error-div")
    }
}, 3000)
