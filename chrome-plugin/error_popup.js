var body   = document.body || document.getElementsByTagName('body')[0],
    newpar = document.createElement('div');

newpar.setAttribute("id", "secplug-error-div")
newpar.style.width = "100%"
newpar.style.zIndex = "10000"
newpar.style.backgroundColor = bg_color
newpar.style.color = "black"
newpar.style.opacity = "0.8"
newpar.style.textAlign = "center"
newpar.style.verticalAlign = "middle"
newpar.style.fontFamily = "Courier New, Courier, monospace"
newpar.style.position = "-webkit-sticky"
newpar.style.position = "sticky"
newpar.style.top = "0"
newpar.style.maxHeight = "20px"
newpar.style.minHeight = "20px"
newpar.style.fontSize = "15px"
newpar.style.fontStretch = "expanded"
newpar.innerHTML = message;
newpar.addEventListener("click", function(){
    closeDiv("secplug-error-div")
}, false)


if(document.getElementById('secplug-error-div')){
    document.getElementById('secplug-error-div').remove()
}

body.insertBefore(newpar,body.childNodes[0]);