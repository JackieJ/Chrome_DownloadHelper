/*=====================Extension API==========================*/
//save media links
var medialinks = [];
var medialinksMap = {};
//media file extensions regex
var mediaPattern = /\.rmvb|\.mpg|\.mpeg|\.avi|\.rm|\.wmv|\.mov|\.flv|\.mpg3|\.mp4|\.mp3/;

//display current tab info 
chrome.tabs.onActivated.addListener(function(activeInfo) {
	chrome.tabs.get(activeInfo.tabId, function(tabInfo) {
		//error exception                                                                                                                                         
		chrome.webRequest.onErrorOccurred.addListener(function(details) {
			if (mediaPattern.test(details.url)) {
			    console.log("failed to processing request " + details.url);
			    if (!medialinksMap[details.url]) {
				medialinks.push(details.url);
			    }
			}
			return;
		    },{urls: ["<all_urls>"]});

		chrome.webRequest.onBeforeRequest.addListener(function(details) {
			if(mediaPattern.test(details.url)) {
			    //check repetition                                                                                                     
			    if (!medialinksMap[details.url]) {
				console.log(details.url);
				var vidList = document.getElementById("videoReq");
				var li = document.createElement("li");
				li.textContent = details.url;
				li.class = activeInfo.url;
				vidList.appendChild(li);
				medialinks.push(details.url);
			    }
			}
			return;
		    },{urls: ["<all_urls>"]});
	    });
    });
