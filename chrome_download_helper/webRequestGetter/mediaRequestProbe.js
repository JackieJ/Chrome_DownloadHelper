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

//acitve tab and url check
var activeURL = null;
var activeTabId = null;

var mediaRequestsMap = {};
//media file extensions regex
var mediaPattern = /.*\.rmvb|.*\.mpg|.*\.mpeg|.*\.avi|.*\.rm|.*\.wmv|.*\.mov|.*\.flv|.*\.mpg3|.*\.mp4|.*\.mp3/;

/*************Helper functions********************/
// add timeout function for sanity checking

//list updater
//messaging port
var port = chrome.extension.connect({"name":"mediaMeta"});
var listUpdater = function (tab) {
    if (tab.active) {
	
	var hasMedia = false;
	
	var tabMeta = mediaRequestsMap[tab.id];
	if (tabMeta) {
	    hasMedia = true;
	}
	if (hasMedia) {
	    //media request exists
	    var num = 0;
	    
	    var tabURLKey;
	    for (tabURLKey in tabMeta) {
		var requests = tabMeta[tabURLKey].requests;
		var requestKey;
		for (requestKey in requests) {
		    
		    //increment the number of downloadables
		    num++;
	    	}
	    } 
	    //send request to popup
	    console.log("LISTUPDATE:number of requests-"+num);
	    port.postMessage({"reqNumber":num});
	}
    }
}

var updateMeta = function(tab,tabId) {
    if (tab.active) {
	activeURL = tab.url;
	console.log("HELPER:"+activeURL);
	console.log("HELPER-TABID:"+tabId+" "+ typeof tabId);
	//update url activision state
	//change the state of active url
	console.log("=========CHANGE STATE=========");
	var tabKey;
	for (tabKey in mediaRequestsMap) {
	    var urlKey;
	    for (urlKey in mediaRequestsMap[tabKey]) {
		(mediaRequestsMap[tabKey])[urlKey].active = false;
	    }
	}
	if (mediaRequestsMap.hasOwnProperty(tabId.toString())
	    && mediaRequestsMap[tabId.toString()].hasOwnProperty(activeURL)) {
	    (mediaRequestsMap[tabId.toString()])[activeURL].active = true;
	}
	console.log("META:"+JSON.stringify(mediaRequestsMap));
    }
    else {
	console.log("non-active tab:"+tabId.toString());
	if (mediaRequestsMap.hasOwnProperty(tabId.toString())
	    && mediaRequestsMap[tabId.toString()].hasOwnProperty(tab.url)) {
	    (mediaRequestsMap[tabId.toString()])[tab.url].active = false;
	} 
    }
    console.log("HELPER-METAUPDATE:"+JSON.stringify(mediaRequestsMap));
};
/************************************************/

//watch tab status
//add tab into the map
chrome.tabs.onCreated.addListener(function(tab) {
    mediaRequestsMap[tab.id] = {};
    console.log("onCreated Meta:"+JSON.stringify(mediaRequestsMap));
    listUpdater(tab);
});

//remove tab from the map if user closes the tab, no access to the media url
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    console.log("onRemoved tabId:"+tabId);
    delete mediaRequestsMap[tabId];
    console.log("onRemoved Meta:"+JSON.stringify(mediaRequestsMap));
});

//issue:when url changes, the tabid changes as well,
//changing the url === remove original tab and create a new tab.
chrome.tabs.onActivated.addListener(function(activeInfo) {
    activeTabId = activeInfo.tabId;
    var tabID = activeInfo.tabId;
    chrome.tabs.get(tabID, function(tab) {
	console.log("ONACTIVATED URL:"+tab.url);
	activeURL = tab.url;
	updateMeta(tab,tabID);
	listUpdater(tab);
    });
    console.log("ONACTIVATED tab id:"+tabID);
    console.log("ONACTIVATED META:"+JSON.stringify(mediaRequestsMap));
    
});

//update the active url info when the active tab completes updating
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    console.log("ONUPDATED:updated tab id:"+tabId);
    updateMeta(tab,tabId);
    listUpdater(tab);
});

//media request mapping
chrome.webRequest.onBeforeRequest.addListener(function(details) {
    //threshholds
    if (details.tabId === -1) return;//return if the request if not  related to a tab
    if (!mediaRequestsMap.hasOwnProperty(details.tabId)) return;//return if tab is no longer open
    if(mediaPattern.test(details.url)) {
	//console.log("Inside webRequest:"+activeURL);
	//console.log("Inside webRequest:"+details.tabId);
	console.log("requests:"+details.url);
	if(mediaRequestsMap.hasOwnProperty(details.tabId)) {
	    //match tab with the tabId
	    chrome.tabs.get(details.tabId, function(tab) {
		targetTab = mediaRequestsMap[details.tabId];
		if (!targetTab.hasOwnProperty(tab.url)) {
		    targetTab[tab.url] = {};
		}
		console.log("webrequest tab url:"+tab.url);
		console.log("webrequest active URL:"+activeURL);
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
		
		var captureGroup = new RegExp("("+mediaPattern+")"+".*");
		var mediaID = (captureGroup.exec(details.url))[1];
		urlMeta.requests[mediaID] = details.url;
		console.log("webrequest mediaTabAndUrlMeta:"+JSON.stringify(mediaRequestsMap));
	    });
	}
    }
    return;
},{urls: ["<all_urls>"]});