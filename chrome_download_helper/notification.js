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
	if (mediaMeta) {
	    var downloadName = null;
	    var downloadNameCaptured = /.*\/([^\/]+)$/.exec(mediaMeta.vidID);
	    if (downloadNameCaptured) {
		downloadName = downloadNameCaptured[1];
	    } else {
		downloadName = mediaMeta.vidID;
	    }
	    var trimmedName = 
		downloadName.length < 10 
		? downloadName 
		: ("..." + downloadName.substring(downloadName.length - 20));
	    text = "Save  \'"+trimmedName+"\' As";
	} else {
	    text = "Oops! Error on loading the file!";
	}
	savingStatusTag.textContent = text;
	
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


