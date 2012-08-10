//UI components


//nacl message handling
DownloadHelperModule = null;//initialization                                                                         
var headTitle = 'Initiliazing';

var loadURL = function(mediaStr) {
    DownloadHelperModule.postMessage(mediaStr);
};

var moduleDidLoad = function() {	
    DownloadHelperModule = document.getElementById('chrome_download_helper');	
    updateStatus('Available Downloads');
};

var handleMessage = function(message_event) {
    var NACLMessage = message_event.data;
    console.log(NACLMessage);
    if(/^progress---->/.test(NACLMessage)) {
	var mediaProgressInfo = /^progress---->(.*)---->(\d+)$/.exec(NACLMessage);
	if(mediaProgressInfo) {
	    var mediaID = mediaProgressInfo[1];
	    var psValue = mediaProgressInfo[2];
	    var progressBarTag = document.getElementById(mediaID);
	    progressBarTag.querySelector('.meter span').style.width = (psValue + "%").toString();
	}
    }
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
    var statusField = document.getElementById('downloads');
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


//file saver blob
/*
var xhr = new XMLHttpRequest();
var saveFile = function() {
    saveAs(xhr.response, xhr.filename);
};
xhr.onload = function(e) {
    saveFile();
};
xhr.onerror = function() {
    console.log("error getting the file");
};
*/
var rMeta = {};
var metaToNotification = {
    "vidID":null,
    "mediaURL":null
};
var mediaAndTypeSelector = function(vidID, conversionType, mediaURL) {
    
    //send message to NACL
    var mstr = vidID + "((--))" + conversionType + "((--))" + mediaURL; 
    
    //hide the conversion options
    var buttonTagClass = vidID+"_buttons";
    var buttonTags = document.getElementsByClassName(buttonTagClass);
    for(var btTagIndex = 0 ; btTagIndex < buttonTags.length ; btTagIndex++) {
	buttonTags[btTagIndex].style.visibility = "hidden";
    }
    
    
    //status text
    var statusTagID = vidID + "_status";
    var conversionDownloadStatusBox = document.getElementById(statusTagID);
    
    //mini progress bar                   
    var progressTagID = vidID + "_progress";
    //console.log(progressTagID);         
    var progressTag = document.getElementById(progressTagID);
    var progressBarInit = "<div class=\"meter animate\"><span style=\"width:0%\"></span></div>"
    
    $(progressTag).append(progressBarInit);
    
    //debugging
    //console.log(JSON.stringify(rMeta));
    
    //download directly if raw file format is chosen otherwise push file in the NACL transcoder
    if(conversionType === "original") {
	conversionDownloadStatusBox.textContent = "downloading";
	
	//send file saver to notification
	metaToNotification.vidID = vidID;
	metaToNotification.mediaURL = mediaURL;
	
	//debugging
	console.log(JSON.stringify(metaToNotification));
	
	var notification = webkitNotifications.createHTMLNotification('notification.html');
	notification.show();
	
	/*
	var downloadName = "";
	
	var downloadNameCaptured = /.*\/([^\/]+)$/.exec(vidID);
	if (downloadNameCaptured) {
	    downloadName = downloadNameCaptured[1];
	} else {
	    downloadName = vidID;
	}
	
	xhr.open('GET', mediaURL, true);
	xhr.filename = purl(downloadName).attr('file');
	xhr.responseType = 'blob';
	xhr.send();
	*/
	
    } else {
	conversionDownloadStatusBox.textContent = "converting"
	loadURL(mstr);
    }
};

var conversionOptions = {
    "mp3":{tooltip:"Convert and download as MP3 audio format",href:"#"},
    "mp4":{tooltip:"Convert and download as MP4 video format",href:"#"},
    "original":{tooltip:"Download as current format",href:"#"}
};

var listConstructor = function(requestsMeta) {
    
    rMeta = requestsMeta;
    
    var iter;
    for(iter in requestsMeta) { 
	
	var name = iter.length < 20 ? iter : ("..." + iter.substring(iter.length - 20));
	
	var inlineButtons = "";
	var iterator;
	for (iterator in conversionOptions) {
	    if (iterator === "original") {
		conversionOptions[iterator].href = rMeta[iter];
	    }
	    inlineButtons += 
		"<a title=\""+conversionOptions[iterator].tooltip+"\" "
		+"onclick=\"mediaAndTypeSelector(\'"+iter+"\',\'"+iterator+"\',\'"
		+rMeta[iter]+"\')\" style=\"visibility:\'visible\'\" "
		+"href=\""+conversionOptions[iterator].href+"\" class=\""
		+iter+"_buttons conversionTypes\">"+iterator+"</a>";
	}
	
	var content = "<li "
	    +"class=\"ui-li ui-li-static ui-body-c\" data-role=\"ui-bar-a\">"
	    +"<span id=\""+iter+"\">"+name+"<br>"+inlineButtons+"<span id=\""+iter
	    +"_status\" style=\"float:left;padding:2px;font-size:9px\"></span><br><span id=\""
	    +iter+"_progress\"></span></span></li>";
	
	$('#downloadList').append(content);
    }
};

$(document).ready(function() {
	
	var tabMeta;
	var bgp = chrome.extension.getBackgroundPage();
	tabMeta = metaComparator(bgp.mediaRequestsMap);
	
	var counterTag = document.getElementById("downloadnumber");
	if(tabMeta) {
	    counterTag.textContent = tabMeta.requestNum;
	    for(reqMetaID in tabMeta) {
		var subMeta = tabMeta[reqMetaID];
		if(reqMetaID !== "requestNum") {
		    listConstructor(subMeta.requests);
		}
	    }
	} else {
	    counterTag.textContent = 0;
	}
	
    });