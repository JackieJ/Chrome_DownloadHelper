//NACL module
vagModule = null;
var sText = null;

//messaging to the background page
var debugPort = chrome.extension.connect({name:"debug"});

var moduleDidLoad = function() {
    vagModule = document.getElementById("NACL_Module");
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
};

var transcodeOptions = {
    "flv":["mp3","mp4", "original"],
    "mp4":["mp3","original"],
    "mpeg4":["mp3","original"]
};

var conversionOptions = {
    "mp3":{tooltip:"Convert to MP3 audio format"},
    "mp4":{tooltip:"Convert to MP4 video format"},
    "original":{tooltip:"Download as current format"}
};

var globleStatusText = "";
var decideAction = function(DOMElement, fileName, mediaURL, convertType, vidID) {
    DOMElement.title = conversionOptions[convertType].tooltip;
    
    DOMElement.addEventListener("mouseover", function() {
	    
	    var downloadType = "current";
	    var fmatCaptured = /[^\.]+\.([^\.]+)$/.exec(fileName);
	    
	    if (fmatCaptured) {
		downloadType = fmatCaptured[1];
	    }
	    
	    if (convertType !== "original") {
		document.getElementById("saving").textContent = conversionOptions[convertType].tooltip;
	    } else {
		document.getElementById("saving").textContent = "Download as " + downloadType + " format";
	    }
	}, false);
    
    DOMElement.addEventListener("mouseout", function() {
	    document.getElementById("saving").textContent = globleStatusText;
	}, false);
    
    var buttons = document.querySelectorAll('.btn');
    //direct download if no conversion is needed
    if (convertType === "original") {
	DOMElement.href = mediaURL;
	DOMElement.download = fileName;
	
	//change status text
	DOMElement.addEventListener("click",function() {
		var statusTag = document.getElementById("saving");
		statusTag.textContent = "Download and Save!"
		globleStatusText = statusTag.textContent;
		document.querySelector('p.downloadthis em b').textContent = "Downloading......";
	    }, false);
    }
    else {
	//send the url to NACL for transcoding
	DOMElement.addEventListener("click", function() {
		
		for (var buttonIndex = 0 ; buttonIndex < buttons.length ; buttonIndex++) {
		    $(buttons[buttonIndex]).fadeOut('slow', function() {
			    // Animation complete.
			});
		}
		
		$('.downloadandfilenametomove').animate({left:'-1'}, 1000);
		
		var statusTag = document.getElementById("saving");
		statusTag.textContent = "Converting '"+fileName+"'...";
		globleStatusText = statusTag.textContent;
		document.querySelector('p.downloadthis em b').textContent = "Conversion In Progress......"
		
		var mstr = vidID + "((--))" 
		+ convertType + "((--))" + mediaURL;
		
		loadURL(mstr);
		
	    }, false);
    }
    
};

$(document).ready(function() {
	//media meta from background page
	var bgView = chrome.extension.getBackgroundPage();
	var mediaMeta = bgView.metaToNotification;
	
	//generate buttons
	
	var paIter;
	var detected = false;
	var selectContainer = document.querySelector(".selectcontainer");
	
	for (paIter in transcodeOptions) {
	    if ((mediaMeta.vidID).indexOf(paIter) !== -1) {
		detected = true;
		var formats = transcodeOptions[paIter];
		var selections = "";
		if (formats.length === 2) {
		    var selection1 = 
			"<a id=\""+formats[0]+"\"><div style=\"left:45px;border-radius: 6px 0px 0px 6px;\" class=\"btn "
			+formats[0]+"\">"+formats[0]+"</div></a>";
		    var selection2 = 
			"<a id=\""+formats[1]+"\"><div style=\"left:85px;border-radius: 0px 6px 6px 0px;\" class=\"btn "
			+formats[1]+"\">"+formats[1]+"</div></a>";
		    selections = selection1+selection2;
		} else if (formats.length === 3) {
		    for (var fIndex = 0 ; fIndex < formats.length ; fIndex++) {
			selections += "<a id=\""+formats[fIndex]+"\"><div class=\"btn "
			    +formats[fIndex]+"\">"+formats[fIndex]+"</div></a>";
		    }
		}
		
		$(selectContainer).append(selections);
	    }
	}
	
	if (!detected) {
	    //Download directly
	    var directDownload = "<a id=\"original\"><div class=\"btn original\" "
		+"style=\"left:61px;border-radius: 6px 6px 6px 6px\""
		+">Download</div></a>";
	    $(selectContainer).append(directDownload);
	}
	
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
	    text = "Save  \'"+trimmedName+"\' as";
	    
	    globleStatusText = text;
	    
	} else {
	    text = "Oops! Error on loading the file!";
	}
	savingStatusTag.textContent = text;
	
	/*
	document.querySelector(".cancel").addEventListener("mouseover", function() {
		savingStatusTag.textContent = "Cancel";
	    }, false);
	*/
	
	//append tooltips to conversion formats
	var mp3Tag = document.getElementById("mp3");
	var mp4Tag = document.getElementById("mp4");
	var originalTag = document.getElementById("original");
	if (mp3Tag) decideAction(mp3Tag, trimmedName, mediaMeta.mediaURL, "mp3", mediaMeta.vidID);
	if (mp4Tag) decideAction(mp4Tag, trimmedName, mediaMeta.mediaURL, "mp4", mediaMeta.vidID);
	if (originalTag) decideAction(originalTag, trimmedName, mediaMeta.mediaURL, "original", mediaMeta.vidID);
	
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


