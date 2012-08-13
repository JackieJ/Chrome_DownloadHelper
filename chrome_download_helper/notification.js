//NACL module
vagModule = null;
var sText = null;

//messaging to the background page
var debugPort = chrome.extension.connect({name:"debug"});

var moduleDidLoad = function() {
    vagModule = document.getElementById("chrome_download_helper");
    updateStatus("Transcoder successfully loaded!");
};

var pageDidLoad = function() {
    if(vagModule === null) {
	updateStatus('Initializing transcoder...');
    } else {
	updateStatus();
    }
};

var updateStatus = function(opt_message) {
    if(opt_message) {
	sText = opt_message;
    }
    
    var statusField = document.getElementById("saving");
    if(statusField && 
       (statusField.innerHTML === "Initializing transcoder...")
       || statusField.innerHTML === "") {
	statusField.innerHTML = sText;
    };
};

var loadURL = function(messageStr) {
    debugPort.postMessage(messageStr);
    vagModule.postMessage(messageStr);
};

var handleMessage = function(message_event) {
    var NACLMessage = message_event.data;
    debugPort.postMessage(NACLMessage);
}

var conversionOptions = {
    "mp3":{tooltip:"Convert and download as MP3 audio format"},
    "mp4":{tooltip:"Convert and download as MP4 video format"},
    "original":{tooltip:"Download as current format"}
};

var decideAction = function(DOMElement, fileName, mediaURL, convertType, vidID) {
    DOMElement.title = conversionOptions[convertType].tooltip;
    //direct download if no conversion is needed
    if (((/\.mpeg4$/.test(fileName) || /\.mp4$/.test(fileName))&& convertType === "mp4") || 
	((/\.mpeg3$/.test(fileName) || /\.mp3$/.test(fileName))&& convertType === "mp3") ||
	convertType === "original") {
	DOMElement.href = mediaURL;
	DOMElement.download = fileName;
	
	//change status text
	DOMElement.addEventListener("click",function() {
		var statusTag = document.getElementById("saving");
		statusTag.textContent = "Grabbing '"+fileName+"'...";
	    }, false);
    }
    else {
	//send the url to NACL for transcoding
	DOMElement.addEventListener("click", function() {
		var mstr = vidID + "((--))" 
		+ convertType + "((--))" + mediaURL;
		
		loadURL(mstr);
		
	    }, false);
    }
};

$(document).ready(function() {
	//UI
	var filenameHover = function(){
	    $(this).parent().parent().toggleClass('foundcontainer-on');
	};
	$('p.filename').on('hover', filenameHover);
	$('p.filename').click(function(){
		$(this).off('hover', filenameHover);
		$(this).parent().parent().addClass('foundcontainer-on');
		$(this).parent().animate({left:'-1'}, 1000);
	    });
	//media meta from background page
	var bgView = chrome.extension.getBackgroundPage();
	var mediaMeta = bgView.metaToNotification;
	
	//text for file saving notification
	var savingStatusTag = document.getElementById("saving");
	var text = null;
	var trimmedName = null;
	if (mediaMeta) {
	    var downloadName = null;
	    var downloadNameCaptured = /.*\/([^\/]+)$/.exec(mediaMeta.vidID);
	    if (downloadNameCaptured) {
		downloadName = downloadNameCaptured[1];
	    } else {
		downloadName = mediaMeta.vidID;
	    }
	    trimmedName = 
		downloadName.length < 10 
		? downloadName 
		: ("..." + downloadName.substring(downloadName.length - 20));
	    text = "Save  \'"+trimmedName+"\' As";
	} else {
	    text = "Oops! Error on loading the file!";
	}
	savingStatusTag.textContent = text;
	
	//append tooltips to conversion formats
	var mp3Tag = document.getElementById("mp3");
	var mp4Tag = document.getElementById("mp4");
	var originalTag = document.getElementById("original");
	decideAction(mp3Tag, trimmedName, mediaMeta.mediaURL, "mp3", mediaMeta.vidID);
	decideAction(mp4Tag, trimmedName, mediaMeta.mediaURL, "mp4", mediaMeta.vidID);
	decideAction(originalTag, trimmedName, mediaMeta.mediaURL, "original", mediaMeta.vidID);
	
	/*
	var bgView = chrome.extension.getBackgroundPage();
	var statusText = document.getElementById('textArea');
	var popupViewMeta = bgView.metaToNotification;
	if (popupViewMeta) {
	    var downloadItem = document.getElementById('downloadItem');
	    downloadItem.href = popupViewMeta.mediaURL;
	    
	    var downloadName = "";                                                                                         
	    var downloadNameCaptured = /.*\/([^\/]+)$/.exec(popupViewMeta.vidID);                     
	    if (downloadNameCaptured) {
	        downloadName = downloadNameCaptured[1];           
	    } else {                                                                                                            
		downloadName = popupViewMeta.vidID;                                 
	    }
	    
	    downloadItem.download = downloadName;
	    statusText.textContent = "click to save " + downloadName;
	} else {
	    statusText.textContent = "Oops! Error on loading the file. Please close this window and try again!"
	}
	*/
    });


