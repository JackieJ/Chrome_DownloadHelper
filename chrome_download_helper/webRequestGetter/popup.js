//send request to the background page

var port = chrome.extension.connect({"name":"popup"});
port.postMessage({"init":true});
port.onMessage.addListener(function(msg) {
    
    //if(msg["update"] && msg["update"] === true) {
	
	console.log("updated!!");
	
    //
    
});