//UI components


//nacl message handling
DownloadHelperModule = null;//initialization                                                                                                                                                                                                                                
var headTitle = 'Initiliazing';

var loadURL = function(mediaStr) {
    DownloadHelperModule.postMessage(mediaStr);
};

var moduleDidLoad = function() {	
    DownloadHelperModule = document.getElementById('chrome_download_helper');	
    updateStatus('Download Helper');
};

var handleMessage = function(message_event) {
    
    var report = document.getElementById("testContent");
    report.textContent = message_event.data;

};

var pageDidLoad = function() {
    if (DownloadHelperModule === null) {
        updateStatus('LOADING...');
    } else {
        updateStatus();
    }
};

var updateStatus = function(opt_message) {
    if (opt_message)
        headTitle = opt_message;
    var statusField = document.getElementById('headTitle');
    if (statusField) {
        statusField.innerHTML = headTitle;
    }
};

//meta data comparator(only compare the meta in the active tab)
var metaComparator = function(newMeta) {
    //compare pick out active tab
    for (tabIndex in newMeta) {
	var isActive = false;
	var tMeta = newMeta[tabIndex];
	for (contentIndex in tMeta) {
	    if(contentIndex !== "requestNum") {
		var contentMeta = tMeta[contentIndex];
		if (contentMeta.hasOwnProperty("active") && 
		    contentMeta.active === true) {
		    isActive = true;
		}
	    }
	}
	
	if (isActive) {
	    return newMeta[tabIndex];
	}
    }
    return null;
};

var rMeta = {};

var mediaAndTypeSelector = function(vidID, conversionType, mediaURL) {
    
    //send message to NACL
    var mstr = vidID + "((--))" + conversionType + "((--))" + mediaURL; 
    loadURL(mstr);
};

var conversionOptions = [
			 "MP3",
			 "MP4",
			 "Original"
			 ];
var listContructor = function(requestsMeta) {
    
    rMeta = requestsMeta;
    
    var iter;
    for(iter in requestsMeta) { 
	
	var name = iter.length < 20 ? iter : ("..." + iter.substring(iter.length - 20));
	
	var inlineButtons = "";
	for (var iterator = 0 ; iterator < conversionOptions.length ; iterator++) {
	    inlineButtons += 
		"<a onclick=\"mediaAndTypeSelector(\'"+iter+"\',\'"+conversionOptions[iterator]+"\',\'"
		+rMeta[iter]+"\')\" "
		+"href=\"#test\" class=\"conversionTypes\">"+conversionOptions[iterator]+"</a>"
	}
	
	var content = "<li "
	+"class=\"ui-li ui-li-static ui-body-c\" data-role=\"ui-bar-a\">"
	+"<span id=\""+iter+"\">"+name+"<br>"+inlineButtons+"</span></li>";
	
	$('#downloadList').append(content);
    }
};

$(document).ready(function() {
	
	var tabMeta;
	var bgp = chrome.extension.getBackgroundPage();
	tabMeta = metaComparator(bgp.mediaRequestsMap);
	
	var counterTag = document.getElementById("counter");
	if(tabMeta) {
	    counterTag.textContent = tabMeta.requestNum;
	    for(reqMetaID in tabMeta) {
		var subMeta = tabMeta[reqMetaID];
		if(reqMetaID !== "requestNum") {
		    listContructor(subMeta.requests);
		}
	    }
	} else {
	    counterTag.textContent = 0;
	}
	
    });