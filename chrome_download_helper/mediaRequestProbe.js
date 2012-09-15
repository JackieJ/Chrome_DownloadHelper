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

//animation definitions
var setIcon = function(imgData,tab) {
    chrome.browserAction.setIcon({
	tabId:tab.id,
	path:imgData
    }, function(){
	console.log("Icon Updated!");
    });  
};

var iconSequence = [
    "UI/img/icon_sequence/01.png",
    "UI/img/icon_sequence/02.png",
    "UI/img/icon_sequence/03.png",
    "UI/img/icon_sequence/04.png",
    "UI/img/icon_sequence/05.png",
    "UI/img/icon_sequence/06.png",
    "UI/img/icon_sequence/07.png",
    "UI/img/icon_sequence/08.png",
    "UI/img/icon_sequence/09.png",
    "UI/img/icon_sequence/10.png",
    "UI/img/icon_sequence/11.png",
    "UI/img/icon_sequence/12.png",
    "UI/img/icon_sequence/13.png",
    "UI/img/icon_sequence/14.png",
    "UI/img/icon_sequence/15.png",
    "UI/img/icon_sequence/16.png",
    "UI/img/icon_sequence/17.png",
    "UI/img/icon_sequence/18.png",
    "UI/img/icon_sequence/19.png",
    "UI/img/icon_sequence/20.png"
];

var frames = [];

//acitve tab and url check
var activeURL = null;
var activeTabId = null;

var mediaRequestsMap = {};
//media file extensions regex

var mediaFormats = [
    "mp2",
    "mpeg2",
    "rmvb",
    "mpg",
    "mpeg",
    "avi",
    "rm",
    "wmv",
    "mov",
    "flv",
    "mpg3",
    "mp4",
    "mpeg4",
    "mp3",
    "mpeg3"
];

var siteExceptions = {
    "youtube.com":{"keyword":"videoplayback","format":"flv"}
};

var patternPartial = {
    "prefix":"\.+\\.",
    "suffix":"[^A-Za-z]*"
};

var patterns = [];
for (var index = 0; index < mediaFormats.length ; index++) {
    patterns.push(new RegExp("("+patternPartial["prefix"]+mediaFormats[index]+")"+patternPartial["suffix"]));
}

var doAnimation = false;
var targetTab = null;
//list updater
var listUpdater = function (tab) {
    targetTab = tab;
    var hasTab = false;
    var tabMeta = mediaRequestsMap[tab.id];
    if (tabMeta) {
	hasTab = true;
    }
    if (hasTab) {
	var num = 0;
	var iter;
	for (iter in tabMeta) {
	    //skip the requestNum entry and iter through requests
	    if(iter !== "requestNum") {
		var requests = tabMeta[iter].requests;
		for (i in requests) {
		    num++;
		}
	    }
	}
	mediaRequestsMap[tab.id].requestNum = num;
    }
    //change icon tooltip based on the media request number
    if (mediaRequestsMap[tab.id].requestNum !== 0) {
	setIcon("UI/img/18x_icon_on.png", tab);
	//doAnimation = true;
	//animateIcon(tab);
	chrome.browserAction.setTitle({
	    tabId:tab.id,
	    title:mediaRequestsMap[tab.id].requestNum
		+" audio/videos available!"
	});
	chrome.browserAction.setBadgeText({
	    tabId:tab.id,
	    text:mediaRequestsMap[tab.id].requestNum.toString()
	});
	
    } else {
	//doAnimation = false;
	setIcon("UI/img/18x_icon_off.png", tab);
	chrome.browserAction.setTitle({
	    tabId:tab.id,
	    title:"Downdload/Transcode Audio&Videos"
	});
    }
    
    //debugging
    console.log(JSON.stringify(mediaRequestsMap));
};

var updateMeta = function(tab,tabId) {
    if (tab.active) {
	activeURL = tab.url;
	//update url activision state
	//change the state of active url
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
    }
    else {
	if (mediaRequestsMap.hasOwnProperty(tabId.toString())
	    && mediaRequestsMap[tabId.toString()].hasOwnProperty(tab.url)) {
	    (mediaRequestsMap[tabId.toString()])[tab.url].active = false;
	} 
    }
};

/*
//animation
var animateIcon = (function() {
    //animation using canvas
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    var img = document.createElement('img');
    img.setAttribute('height', 19);
    img.setAttribute('width', 19);
    canvas.setAttribute('height', img.height);
    canvas.setAttribute('width', img.width);
    
    for (var sequenceIndex = 0; sequenceIndex < iconSequence.length; sequenceIndex++) {
	img.src = iconSequence[sequenceIndex];
	console.log(img.src);
	ctx.drawImage(img, 0, 0);
	frames.push(ctx.getImageData(0,0,img.width,img.height));
    }
    var speed = 2000;
    return function(){
	if(doAnimation) {
	    for (var i=0, length=frames.length; i<length; i++) {
		setTimeout(function(){
		    setIcon(frames[i], targetTab);
		}, speed*i);
	    }
	    setTimeout(function(){animateIcon();}, speed*frames.length);
	}
    };
})();
*/

window.onload = function() {
    var queryInfo = {
	"currentWindow":true
    };
    
    chrome.tabs.query(queryInfo, function(tabArray) {
	for(var arrayIndex = 0; arrayIndex < tabArray.length; arrayIndex++) {
	    mediaRequestsMap[tabArray[arrayIndex].id] = {requestNum:0};
	    listUpdater(tabArray[arrayIndex]);
	}
    });
    
    //watch tab status
    //add tab into the map
    chrome.tabs.onCreated.addListener(function(tab) {
	mediaRequestsMap[tab.id] = {requestNum:0};
	listUpdater(tab);
	
	//debugging
	console.log("Created!");
	
    });
    
    //remove tab from the map if user closes the tab, no access to the media url
    chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
	delete mediaRequestsMap[tabId];
    });
    
    //issue:when url changes, the tabid changes as well,
    //changing the url === remove original tab and create a new tab.
    chrome.tabs.onActivated.addListener(function(activeInfo) {
	activeTabId = activeInfo.tabId;
	var tabID = activeInfo.tabId;
	chrome.tabs.get(tabID, function(tab) {
	    activeURL = tab.url;
	    updateMeta(tab,tabID);
	    listUpdater(tab);
	});
    });
    
    //update the active url info when the active tab completes updating
    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	
	//inspect url change
	var tabMeteData = mediaRequestsMap[tabId];
	var inspectedURL = null;
	var key;
	for(key in tabMeteData) {
	    if(key !== "requestNum") {
		inspectedURL = key;
		break;
	    }	   
	}
	//wipe out previous meta if the url changes
	if(changeInfo.hasOwnProperty("url") 
	   && changeInfo.url !== inspectedURL) {
	    delete tabMeteData[inspectedURL];
	}
	
	updateMeta(tab,tabId);
	listUpdater(tab);
	
	//debugging
	console.log("Updated!");
	
    });
    
    //media request mapping
    chrome.webRequest.onBeforeRequest.addListener(function(details) {
	//threshholds
	if (details.tabId === -1) return;//return if the request if not  related to a tab
	if (!mediaRequestsMap.hasOwnProperty(details.tabId)) return;//return if tab is no longer open
	
	var isMatched = false;
	var mediaPattern;
	for (var pIndex = 0 ; pIndex < patterns.length ; pIndex++) {
	    if(patterns[pIndex].test(details.url)) {
		isMatched = true;
		mediaPattern = patterns[pIndex];
		//console.log(mediaPattern);
		break;
	    }
	}
	
	//console.log(details.type);
	
	if(isMatched) {
	    //console.log("Inside webRequest:"+activeURL);
	    //console.log("Inside webRequest:"+details.tabId);
	    if(mediaRequestsMap.hasOwnProperty(details.tabId)) {
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
		    
		    var captureGroup = mediaPattern;
		    
		    //console.log(captureGroup);
		    //console.log(details.url);
		    
		    var mediaID = (captureGroup.exec(details.url))[1];
		    urlMeta.requests[mediaID] = details.url;
		    listUpdater(tab);
		});
	    }
	}
	return;
    },{urls: ["<all_urls>"]});
};

var metaToNotification = null;
//message passing bewtween popup and notification
chrome.extension.onConnect.addListener(function(port) {
    if (port.name === "popupToNotification") {
	port.onMessage.addListener(function(msg) {
	    
	    metaToNotification = msg;
	    
	    var notification = webkitNotifications.createHTMLNotification("notification.html");
	    notification.show();
	    
	});
    } else if (port.name === "debug") {
	port.onMessage.addListener(function(msg) {
	    console.log("====Debug Message====");
	    console.log(msg);
	    console.log("=====================");
	});
    } else if (port.name === "progress") {
	//track download progress from chrome download page
	port.onMessage.addListener(function(msg) {
	    
	});
    }
});

