DownloadHelperModule = null;//initialization
statusText = 'NO-STATUS';

var url = "www.thedailyshow.com";

var moduleDidLoad = function() {
    DownloadHelperModule = document.getElementById('chrome_download_helper');
    updateStatus('SUCCESS');
    DownloadHelperModule.postMessage(url);
};

var handleMessage = function(message_event) {
    var vidList = document.getElementById("vidList");
    var li = document.createElement("li");
    li.textContent = message_event.data;
    vidList.appendChild(li);
};

var pageDidLoad = function() {
    if (DownloadHelperModule == null) {
        updateStatus('LOADING...');
    } else {
	updateStatus();
    }
};

var updateStatus = function(opt_message) {
    if (opt_message)
        statusText = opt_message;
    var statusField = document.getElementById('status_field');
    if (statusField) {
        statusField.innerHTML = statusText;
    }
}