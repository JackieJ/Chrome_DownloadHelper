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
