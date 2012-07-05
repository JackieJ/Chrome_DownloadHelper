//send request to the background page

var port = chrome.extension.connect({"name":"popup"});
port.postMessage({"msg":"communication initialized!"});
port.onMessage.addListener(function(msg) {
    if (msg.msg) {
	port.postMessage({"response":"msg to popup received"});
    }
});