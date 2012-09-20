`P.S.Will not be released until NACL is supported as part of Chrome extension development`     
`P.S.A .patch file needs to be created for the ffmpeg-0.5 from NACLPort. Bug: Trailing commas in some of the lib file`     
Setup Steps
===========

##Install NACL

  * Download NACL SDK [here](http://commondatastorage.googleapis.com/nativeclient-mirror/nacl/nacl_sdk/nacl_sdk.zip)
  * `unzip nacl_sdk.zip` and run `./nacl_sdk list` to check available versions and `./nacl_sdk update` to download
  * set environment variable `NACL_SDK_ROOT=/where/nacl_sdk/is`

##Install NACLPort

  * Download NACLPort and follow the instruction [here](http://code.google.com/p/naclports/wiki/HowTo_Checkout?tm=4)


##Install Dependencies through NACLPort

    * Export `NACL_PORTS` env variable to point to where you installed nacl ports.
    * Run `./deps.sh`.         

##Compile and Run       

  * Run `make`. `.nexe` and `_32.o/_64.o` files should be generated.      

Development Documentation     
=========================     

###*[mediaRequestProbe.js](https://github.com/CloudClown/Chrome_DownloadHelper/blob/master/chrome_download_helper/mediaRequestProbe.js)*     

  * This is the background script.     
  * `chrome.webRequest.onBeforeRequest` gets web requests. mediaReqeustsMap holds request metadata.      
  * Message passing, icon animation, triggering notifications.     

###*[popup.html](https://github.com/CloudClown/Chrome_DownloadHelper/blob/master/chrome_download_helper/popup.html)/[popup.js](https://github.com/CloudClown/Chrome_DownloadHelper/blob/master/chrome_download_helper/popup.js)*     

  * Display available download entries if available.      
  * Pass message back to the background script triggering notification windows for download options      

###*[notification.html](https://github.com/CloudClown/Chrome_DownloadHelper/blob/master/chrome_download_helper/notification.html)/[notification.js](https://github.com/CloudClown/Chrome_DownloadHelper/blob/master/chrome_download_helper/notification.js)*      

  * Display download options according the original file format.e.g.if the file is .mp4, `mp3` and `original` show up as download options      
  * Passing download meta data(URL, vidID, current format and the conversion format,etc) to the NACL transcoder.      

###*[listener.js](https://github.com/CloudClown/Chrome_DownloadHelper/blob/master/chrome_download_helper/listener.js)*      
 
  * Communication between NACL and client-side js.

###*[transcoder.cc](https://github.com/CloudClown/Chrome_DownloadHelper/blob/master/chrome_download_helper/transcoder.cc)/[transcoder.h](https://github.com/CloudClown/Chrome_DownloadHelper/blob/master/chrome_download_helper/transcoder.h)*      

  * transcoding(*In Progresss*) options: MP4->MP3, FLV->MP4/MP3.      
  * TODO: implement using ffmpeg/libav.      
  * libav libs need to be patched due to the trailing comma bug.(will see the errors when first time compile, after porting libav from the NACLPort)