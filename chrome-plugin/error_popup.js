var body   = document.body || document.getElementsByTagName('body')[0],
    newpar = document.createElement('div');

newpar.setAttribute("id", "secplug-error-div")
newpar.style.width = "100%"
newpar.style.zIndex = "100"
newpar.style.backgroundColor = bg_color
newpar.style.fontSize = 15
newpar.style.fontWeight = 500
newpar.style.textAlign = "center"
newpar.style.verticalAlign = "middle"
newpar.style.fontFamily = "sans-serif, Lato, Times New Roman"
newpar.innerHTML = message;

if(document.getElementById('secplug-error-div')){
    document.getElementById('secplug-error-div').remove()
}

body.insertBefore(newpar,body.childNodes[0]);