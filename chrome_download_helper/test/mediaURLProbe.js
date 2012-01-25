//test under phantomjs

var siteURL = phantom.args[0];
var page = require('webpage').create();
var queue = [];

queue.push(siteURL);

page.open(queue.shift(), function(status) {
	if(status !== "success") {
	    console.log("failed to open " + siteURL);
	    console.log("Reconnecting......");
	    queue.unshift(siteURL);
	}
	else {
	    console.log("Successfully opened " + siteURL);
	    console.log("Loading......");
	}
    });

page.onLoadFinished = function(status) {
    if (queue.length !== 0) {
	//reopen siteURL
	page.open(queue.shift());
    }
    else {
	if(status !== "success") {
	    console.log("failed to load " + siteURL);
	}
	else {
	    var mediaLinks = page.evaluate(function() {
		    var linkAttrList = [];
		    //Aux function for walking through the DOM_tree
		    var domWalker = function walker(domNode, attrGetter) {
			attrGetter(domNode);
			domNode = domNode.firstChild;
			while(domNode) {
			    walker(domNode, attrGetter);
			    domNode = domNode.nextSibling;
			}
		    }
		    //media file extensions
		    var mediaSuffix = ="jpg|jpeg|gif|png|mpg|mpeg|avi|rm|wmv|mov|flv";
		    //regex for the whole src/href parts
		    var mediaPattern=new RegExp("^.*\\.(?:"+mediaSuffix+")$","i");
		    
		    //extract all href/src/data attributes
		    //walk through DOM-tree
		    domWalker(document.documentElement, function(dNode) {
			    var attributeMap = dNode.attributes;
			    if (attributeMap) {
				var srcAttrNode = attributeMap.getNamedItem('src');
				var hrefAttrNode = attributeMap.getNamedItem('href');
				var dataAttrNode = attributeMap.getNamedItem('data');
				if (srcAttrNode) {
				    linkAttrList.push(srcAttrNode.textContent);
				}
				if (hrefAttrNode) {
				    linkAttrList.push(hrefAttrNode.textContent);
				}
				if (dataAttrNode) {
				    linkAttrList.push(dataAttrNode.textContent);
				}
			    }
			});
		    return linkAttrList;
		});
	    console.log(JSON.stringify(linkAttrList));
	}
    }
}