Setup Steps    
===========

##Install NACL      

  * Download NACL SDK [here](http://commondatastorage.googleapis.com/nativeclient-mirror/nacl/nacl_sdk/nacl_sdk.zip)     
  * `unzip nacl_sdk.zip` and run `./nacl_sdk list` to check available versions and `./nacl_sdk update` to download     
  * set environment variable `NACL_SDK_ROOT=/where/nacl_sdk/is`    

##Install NACLPort    
  
  * Download NACLPort and follow the instruction [here](http://code.google.com/p/naclports/wiki/HowTo_Checkout?tm=4)      


##Install Dependencies through NACLPort     

  * Direct to `naclport/src/libraries`      
  * Install `libogg, libtheora, libvorbis, lame` by running `export NACL_PACKAGES_BITSIZE=32; ./shellscript.sh; export NACL_PACKAGES_BITSIZE=64; ./shellscript.sh`     
  * Install `ffmpeg-0.5` and run the same shell scripts above  