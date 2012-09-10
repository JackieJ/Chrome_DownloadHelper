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
var metaToNotification = {
    "vidID":null,
    "mediaURL":null
};

//connect to the background script
var port = chrome.extension.connect({name: "popupToNotification"});
var downloadedMedia = {};
var mediaAndTypeSelector = function(vidID, mediaURL) {
    if(!downloadedMedia.hasOwnProperty(mediaURL)) {
	metaToNotification.vidID = vidID;
	metaToNotification.mediaURL = mediaURL;
	port.postMessage(metaToNotification);
	downloadedMedia[mediaURL] = true; 
    }
};

var listConstructor = function(requestsMeta) {
    rMeta = requestsMeta;
    //get rid of dups
    var i;
    for (i in requestsMeta) {
	var isDup = false;
	var rMetaIndex;
	for (rMetaIndex in rMeta) {
	    if (rMeta[rMetaIndex] === requestsMeta[i]) {
		isDup = true;
		break;
	    }
	}
	if(!isDup) {
	    rMeta[i] = requestsMeta[rMetaIndex];
	}
    }
    
    var iter;
    for(iter in rMeta) { 
	var name = iter.length < 20 ? iter : ("..." + iter.substring(iter.length - 20));
	
	/*
	var content = "<div"+" class=\"foundcontainer\"><div class=\"downloadandfilenametomove\">"
	    +"<p class=\"downloadthis\">Grab through the dialog window</p><p class=\"filename\">"
		+name+"</p>"+"</div></div>";
	*/
	
	var entryDiv = document.createElement("div");
	entryDiv.className = "foundcontainer";
	entryDiv.addEventListener('click', function(e) {
	    mediaAndTypeSelector(iter,rMeta[iter]);
	});
	var insideEntry = document.createElement("div");
	insideEntry.className = "downloadandfilenametomove";
	var paragraphInside1 = document.createElement("p");
	paragraphInside1.className = "downloadthis";
	var paragraphInside2 = document.createElement("p");
	paragraphInside2.className = "filename";
	paragraphInside1.innerText = "Grab through the dialog window";
	paragraphInside2.innerText = name;
	insideEntry.appendChild(paragraphInside1);
	insideEntry.appendChild(paragraphInside2);
	entryDiv.appendChild(insideEntry);
	$("#textareabottom").append(entryDiv);
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
    
    var filenameHover = function(){
	$(this).parent().parent().toggleClass('foundcontainer-on');
    };
    $('p.filename').on('hover', filenameHover);
    $('p.filename').click(function(){
	$(this).off('hover', filenameHover);
	$(this).parent().parent().addClass('foundcontainer-on');
	$(this).parent().animate({left:'-1'}, 1000);
    });
});