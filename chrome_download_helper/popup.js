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
    
    var report = document.getElementById("");
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
    
    //hide the conversion options
    var buttonTagClass = vidID+"_buttons";
    var buttonTags = document.getElementsByClassName(buttonTagClass);
    for(var btTagIndex = 0 ; btTagIndex < buttonTags.length ; btTagIndex++) {
	buttonTags[btTagIndex].style.visibility = "hidden";
    }
    
    
    //status text
    var statusTagID = vidID + "_status";
    var conversionDownloadStatusBox = document.getElementById(statusTagID);
    
    if(conversionType === "Original") {
	conversionDownloadStatusBox.textContent = "Downloading";
    } else {
	conversionDownloadStatusBox.textContent = "Converting"
    }
    
    //mini progress bar
    var progressTagID = vidID + "_progress";
    var progressBarInit = "<div class=\"meter animate\"><span style=\"width:0%\"></span></div>"
    $(progressTagID).append(progressBarInit);
    
    loadURL(mstr);
};

var conversionOptions = {
    "MP3":"Download as MP3 audio format",
    "MP4":"Download as MP4 video format",
    "Original":"Download as current format"
};

var listContructor = function(requestsMeta) {
    
    rMeta = requestsMeta;
    
    var iter;
    for(iter in requestsMeta) { 
	
	var name = iter.length < 22 ? iter : ("..." + iter.substring(iter.length - 22));
	
	var inlineButtons = "";
	var iterator;
	for (iterator in conversionOptions) {
	    inlineButtons += 
		"<a title=\""+conversionOptions[iterator]+"\" "
		+"onclick=\"mediaAndTypeSelector(\'"+iter+"\',\'"+iterator+"\',\'"
		+rMeta[iter]+"\')\" style=\"visibility:\'visible\'\" "
		+"href=\"#\" class=\""+iter+"_buttons conversionTypes\">"+iterator+"</a>"
	}
	
	var content = "<li "
	    +"class=\"ui-li ui-li-static ui-body-c\" data-role=\"ui-bar-a\">"
	    +"<span id=\""+iter+"\">"+name+"<br>"+inlineButtons+"<span id=\""+iter
	    +"_status\" style=\"float:left;padding:2px;font-size:10px\"></span><br><span id=\""
	    +iter+"_progress\"></span></span></li>";
	
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