/*========================NACL Client=============================*/
DownloadHelperModule = null;//initialization                                                                                                                 statusText = 'NO-STATUS';

var url = "www.test.com";

var moduleDidLoad = function() {
    DownloadHelperModule = document.getElementById('chrome_download_helper');
    updateStatus('SUCCESS');
    DownloadHelperModule.postMessage(url);
};

var handleMessage = function(message_event) {
    var vidList = document.getElementById("vidList");
    var li = document.createElement("li");
    li.textContent = message_event.data;
    vidList.appendChild(li);
};

var pageDidLoad = function() {
    if (DownloadHelperModule == null) {
        updateStatus('LOADING...');
    } else {
        updateStatus();
    }
};

var updateStatus = function(opt_message) {
    if (opt_message)
        statusText = opt_message;
    var statusField = document.getElementById('status_field');
    if (statusField) {
        statusField.innerHTML = statusText;
    }
}

/*=====================Extension API==========================*/
//save media links
var medialinks = [];
var medialinksMap = {};
//media file extensions regex
var mediaPattern = /\.rmvb|\.mpg|\.mpeg|\.avi|\.rm|\.wmv|\.mov|\.flv|\.mpg3|\.mp4|\.mp3/;

//debugging functions/vars

//error exception
chrome.webRequest.onErrorOccurred.addListener(function(details) {
	if (mediaPattern.test(details.url)) {
	    console.log("failed to processing request " + details.url);
	    if (!medialinksMap[details.url]) {
		medialinks.push(details.url);
	    }
	}
	return;
    },  
    {urls: ["<all_urls>"]});

chrome.webRequest.onBeforeRequest.addListener(function(details) {
	if(mediaPattern.test(details.url)) {
	    //check repetition
	    if (!medialinksMap[details.url]) {
		console.log(details.url);
		medialinks.push(details.url);
	    }
	}
	return;
    },
    {urls: ["<all_urls>"]});


/*chrome.webRequest.onCompleted.addListener(function(details) {
	console.log(JSON.stringify(details.url));
      	return;
    },
    {urls: ["<all_urls>"]});*/