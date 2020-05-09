var body   = document.body || document.getElementsByTagName('body')[0],
    newpar = document.createElement('div');
    inputBox = document.createElement('input')
    buttonKey = document.createElement('input')

newpar.setAttribute("id", "secplug-input-div")
newpar.style.width = "100%"
newpar.style.zIndex = "10000"
newpar.style.backgroundColor = "#ffff33"
newpar.style.fontSize = "15"
newpar.style.textAlign = "center"
newpar.style.verticalAlign = "middle"
newpar.style.fontFamily = "sans-serif, Lato, Times New Roman"
newpar.style.position = "-webkit-sticky"
newpar.style.position = "sticky"
newpar.style.top = "0"
newpar.addEventListener("click", function(event){
    if (event.target == event.currentTarget){
        closeDiv("secplug-input-div")
    }
}, false)

inputBox.setAttribute("id", "secplug-input-box")
inputBox.setAttribute("type", "text")
inputBox.setAttribute("placeholder", "Enter Secplug API Key")
inputBox.style.position = "-webkit-sticky"
inputBox.style.position = "sticky"
inputBox.style.top = "0"

buttonKey.setAttribute("id", "secplug-button-key")
buttonKey.setAttribute("type", "submit")
buttonKey.setAttribute("value", "Done")
buttonKey.style.border = "None"
buttonKey.style.backgroundColor = "black"
buttonKey.style.color = "White"
buttonKey.style.marginLeft = "5px"
buttonKey.style.position = "-webkit-sticky"
buttonKey.style.position = "sticky"
buttonKey.style.top = "0"
buttonKey.addEventListener("click", function(event){
    if(event.target == event.currentTarget){
        setKey()
    }
})

if(document.getElementById('secplug-input-div')){
    document.getElementById('secplug-input-div').remove()
}

newpar.appendChild(inputBox)
newpar.appendChild(buttonKey)
body.insertBefore(newpar,body.childNodes[0]);
