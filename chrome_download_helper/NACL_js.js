DownloadHelperModule = null;//initialization
statusText = 'NO-STATUS';

var url = "www.thedailyshow.com"

var moduleDidLoad = function() {
    DownloadHelperModule = document.getElementById('chrome_download_helper');
    DownloadHelperModule.addEventListener('message', handleMessage, false);
    updateStatus('SUCCESS');
    DownloadHelperModule.postMessage(url);
};

var handleMessage = function(message_event) {
    alert(message_event.data);
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