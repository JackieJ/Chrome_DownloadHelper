/*=====================Extension API==========================*/
//info hash for media requests
/*
  {
    tabId:{
      URL:{
        url:url-string,
        active:true/false,
	requests:{
	  requestHeading1:request1,
	  requestHeading2:request2,
	  ...
	}
      }
    }
  }
*/

var mediaRequestsMap = {};
//media file extensions regex
var mediaPattern = /\.rmvb|\.mpg|\.mpeg|\.avi|\.rm|\.wmv|\.mov|\.flv|\.mpg3|\.mp4|\.mp3/;

//watch tab status
//add tab into the map
chrome.tabs.onCreated.addListener(function(tab) {
	mediaRequestMap[tab.id] = {};
    });

//remove tab from the map
chrome.tabs.onRemoved.addListener(function(tab) {
	delete mediaRequestMap[tab.id];
	
    });

//acitve tab and url check
var activeURL = null;
var activeTabId = null;
chrome.tabs.onActivated.addListener(function(activeInfo) {
	activeTabId = activeInfo.tabId;
	var tabID = activeInfo.tabId;
	console.log(tabID);
	chrome.tabs.get(tabID, function(tabInfo) {
		activeURL = tabInfo.url;
		//console.log(activeURL);
	    });
    });

//media request mapping
chrome.webRequest.onBeforeRequest.addListener(function(details) {
	
	if(mediaPattern.test(details.url)) {
	    //console.log(details.url);
	    //console.log("Inside webRequest:"+this.activeURL);
	    //console.log("Inside webRequest:"+details.tabId);
	    
	    if(mediaRequestsMap.hasProperty(details.tabId)) {
		//add request into existing slot
	    }
	    
	    var vidList = document.getElementById("videoReq");
	    var li = document.createElement("li");
	    li.textContent = details.url;
	    vidList.appendChild(li);
	    medialinks.push(details.url);
	}
	return;
    },{urls: ["<all_urls>"]});