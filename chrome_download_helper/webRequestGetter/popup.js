//send request to the background page

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

var listContructor = function(requestsMeta) {
    for(iter in requestsMeta) { 
	var name = iter.length < 25 ? iter : iter.substring(0,25) + "...";
	
	var content = 
	    "<li class=\"ui-li ui-li-static ui-body-c\" data-role=\"ui-bar-a\">"
	    +"<a href="
	    +requestsMeta[iter]+">"+name+"</a>"
	    +"</li>";
	
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