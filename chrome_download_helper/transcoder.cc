#include <sstream>
#include <iostream>

#include "transcoder.h"


//libav
extern "C" {
#include "libavformat/avformat.h"
#include "libavcodec/avcodec.h"
#include "libavutil/mathematics.h"
}

using namespace std;

Transcoder* Transcoder::Create(pp::Instance* instance, 
			       const string& url, 
			       const string& conversionType,
			       const string& vidID) {
  return new Transcoder(instance, url, conversionType, vidID);
}

//constructor
Transcoder::Transcoder(pp::Instance* instance, 
		       const string& url, 
		       const string& conversionType,
		       const string& vidID)
  : instance_(instance),
    url_(url),
    vidID_(vidID),
    conversionType_(conversionType),
    url_request_(instance),
    url_loader_(instance),
    buffer_(new char[READ_BUFFER_SIZE]),
    cc_factory_(this) {
  url_request_.SetURL(url);
  url_request_.SetMethod("GET");
  url_request_.SetRecordDownloadProgress(true);
}

Transcoder::~Transcoder() {
  delete [] buffer_;
  buffer_ = NULL;
}

void Transcoder::Start() {
  pp::CompletionCallback cc = cc_factory_.NewCallback(Transcoder::OnOpen);
  url_loader_.Open(url_request_, cc);
}

void Transcoder::OnOpen(int32_t result) {
  if (result != PP_OK) {
    Die(buffer_, false);
    return;
  }
  
  
  
}

void Transcoder::FinalReport(BUFFER buffer, bool success) {
  if (!success) {
    Printf("Error!");
  } else {
    
  }
}

void Transcoder::Die(BUFFER buffer, bool success) {
  FinalReport(buffer, success);
  delete this;
}
