//send request to the background page

var port = chrome.extension.connect({"name":"popup"});
port.postMessage({"userReq":true});
port.onMessage.addListener(function(msg) {
    
});