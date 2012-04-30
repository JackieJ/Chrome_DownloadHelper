/*=====================Extension API==========================*/
//info hash for media requests
/*
  {
    tabId:{
      url:{
        active:true/false,
	requests:{
	  requestId1:request1,
	  requestId2:request2,
	  ...
	}
      }
    }
  }
*/

mediaRequestsMap = {};
//media file extensions regex
var mediaPattern = /\.rmvb|\.mpg|\.mpeg|\.avi|\.rm|\.wmv|\.mov|\.flv|\.mpg3|\.mp4|\.mp3/;

//watch tab status
//add tab into the map
chrome.tabs.onCreated.addListener(function(tab) {
	mediaRequestsMap[tab.id] = {};
	console.log("onCreated Meta:"+JSON.stringify(mediaRequestsMap));
    });

//remove tab from the map if user closes the tab, no access to the media url
chrome.tabs.onRemoved.addListener(function(tab) {
	delete mediaRequestMap[tab.id];
	console.log("onRemoved Meta:"+JSON.stringify(mediaRequestsMap));
    });

//acitve tab and url check
var activeURL = null;
var activeTabId = null;
chrome.tabs.onActivated.addListener(function(activeInfo) {
	activeTabId = activeInfo.tabId;
	var tabID = activeInfo.tabId;
	console.log("activated tab id:"+tabID);
    });

//update the active url info when the active tab completes updating
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
		console.log("updated tab id:"+tabId);
		if (tabId === activeTabId) {
			activeURL = tab.url;
			console.log("active url:"+activeURL);
			//update url activision state
			if (mediaRequestsMap.hasOwnProperty(tabId)
			    && mediaRequestsMap[tabId].hasOwnProperty(activeURL)) {
				//change the state of active url
				var tabKey;
				for (tabKey in mediaRequestsMap) {
					var urlKey;
					for (urlKey in mediaRequestsMap[tabKey]) {
						(mediaRequestsMap[tabKey])[urlKey].active = false;
					}
				}
				(mediaRequestsMap[tabId])[activeURL].active = true;
			}
			console.log("META:"+JSON.stringify(mediaRequestsMap));
		}
		else {
			console.log("non-active tab"+tabId);
			if (mediaRequestsMap.hasOwnProperty(tabId)
			    && mediaRequestsMap[tabId].hasOwnProperty(tab.url)) {
				(mediaRequestsMap[tabId])[tab.url].active = false;
			} 
		}
	});

//media request mapping
chrome.webRequest.onBeforeRequest.addListener(function(details) {
	//threshholds
	if (details.tabId === -1) return;//return if the request if not  related to a tab
	if (!mediaRequestsMap.hasOwnProperty(details.tabId)) return;//return if tab is no longer open
	
	if(mediaPattern.test(details.url)) {
	    //console.log(details.url);
	    //console.log("Inside webRequest:"+activeURL);
	    //console.log("Inside webRequest:"+details.tabId);
	    
	    if(mediaRequestsMap.hasProperty(details.tabId)) {
		//match tab with the tabId
		chrome.tabs.get(details.tabId, function(tab) {
				targetTab = mediaRequestsMap[details.tabId];
				if (!targetTab.hasOwnProperty(tab.url)) {
					targetTab[tab.url] = {};
				}
				//add request to the media meta
				if (tab.url === activeURL) {
					//change url's activision state
					targetTab[tab.url].active = true;
				}
				else {
					targetTab[tab.url].active = false;
				}
				//add new request to the url meta
				urlMeta = targetTab[tab.url];
				if (!urlMeta.hasOwnProperty("requests")) {
					urlMeta.requests = {};
				}
				requestID = details.requestId;
				urlMeta.requests[requestID] = details.url;
				console.log("mediaTabAndUrlMeta:"+JSON.stringify(mediaRequestsMap));
			});
	    }
	    
	    var vidList = document.getElementById("videoReq");
	    var li = document.createElement("li");
	    li.textContent = details.url;
	    vidList.appendChild(li);
	    medialinks.push(details.url);
	}
	return;
    },{urls: ["<all_urls>"]});