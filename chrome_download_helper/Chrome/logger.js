chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    if(details.url.indexOf("mp4")!=-1)
    {
      console.log(details.url);      
    }
  },
  {urls: ["<all_urls>"]});
  
