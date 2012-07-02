//send request to the background page
var mediaMeta = {};

console.log("Debug!");

chrome.extension.onConnect.addListener(function(port) {
    console.log("Request number");
    if (port.name) {
        console.log("Port Name " + port.name);
	port.onMessage.addListener(function(msg) {
            if(msg.reqNumber) {
                var counterDisplay = document.getElementById("counter");
                counterDisplay.span.textContent = msg.reqNumber.toString();
                window.location.reload();
            }
        });
    }
    
});