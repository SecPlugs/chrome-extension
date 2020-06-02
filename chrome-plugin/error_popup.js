var body   = document.body || document.getElementsByTagName('body')[0],
    newpar = document.createElement('div');
    style = document.createElement('style');

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
newpar.style.minWidth = "250px"
newpar.style.marginLeft = "-125px"
newpar.style.backgroundColor = bg_color
newpar.style.textAlign = "center"
newpar.style.borderRadius = "2px"
newpar.style.padding = "16px"
newpar.style.position = "fixed"
newpar.style.zIndex = "10000"
newpar.style.left = "50%"
newpar.style.top = "30px"
newpar.style.fontSize = "17px"
newpar.innerHTML = message;
if(message.indexOf("malicious") === -1){
    newpar.style.webkitAnimation = "fadein 0.5s, fadeout 0.5s 2.5s"
    newpar.style.animation = "fadein 0.5s, fadeout 0.5s 2.5s"
}

newpar.addEventListener("click", function(){
    closeDiv("secplug-error-div")
}, false)

if(document.getElementById('secplug-error-div')){
    document.getElementById('secplug-error-div').remove()
}

body.insertBefore(newpar,body.childNodes[0]);
setTimeout(function(){
    if(document.getElementById('secplug-error-div') && message.indexOf("malicious") === -1){
        closeDiv("secplug-error-div")
    }
}, 3000)
