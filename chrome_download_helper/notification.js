$(document).ready(function() {
	var popupViews = chrome.extension.getViews({type:popup});
	var statusText = document.getElementById('textArea');
	var popupViewMeta = popupViews[0].metaToNotification;
	if (popupViewMeta.mediaURL && popupViewMeta.vidID) {
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
    });