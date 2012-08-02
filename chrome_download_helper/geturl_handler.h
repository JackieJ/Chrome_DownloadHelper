#ifndef GETURL_GETURL_HANDLER_H_
#define GETURL_GETURL_HANDLER_H_

#include <string>
#include <cstring>
#include "ppapi/cpp/completion_callback.h"
#include "ppapi/cpp/url_loader.h"
#include "ppapi/cpp/url_request_info.h"
#include "ppapi/cpp/instance.h"
#include "ppapi/cpp/file_io.h"
#include "ppapi/utility/completion_callback_factory.h"
#define READ_BUFFER_SIZE 32768

class GetURLHandler {
 public:
  // Creates instance of GetURLHandler on the heap.
  // GetURLHandler objects shall be created only on the heap (they
  // self-destroy when all data is in).
  static GetURLHandler* Create(pp::Instance* instance_,
                               const std::string& url, const std::string& conversionType, const std::string& vidID);
  // Initiates page (URL) download.
  void Start();

 private:
  GetURLHandler(pp::Instance* instance_, const std::string& url, const std::string& conversionType, const std::string& vidID);
  ~GetURLHandler();

  // Callback fo the pp::URLLoader::Open().
  // Called by pp::URLLoader when response headers are received or when an
  // error occurs (in response to the call of pp::URLLoader::Open()).
  // Look at <ppapi/c/ppb_url_loader.h> and
  // <ppapi/cpp/url_loader.h> for more information about pp::URLLoader.
  void OnOpen(int32_t result);

  // Callback fo the pp::URLLoader::ReadResponseBody().
  // |result| contains the number of bytes read or an error code.
  // Appends data from this->buffer_ to this->url_response_body_.
  void OnRead(int32_t result);

  // Reads the response body (asynchronously) into this->buffer_.
  // OnRead() will be called when bytes are received or when an error occurs.
  void ReadBody();
 
  // Append data bytes read from the URL onto the internal buffer.  Does
  // nothing if |num_bytes| is 0.
  void AppendDataBytes(const char* buffer, int32_t num_bytes);
  
  // Post a message back to the browser with the download results.
  void ReportResult(const std::string& fname,
                    const std::string& text,
                    bool success);
  // Post a message back to the browser with the download results and
  // self-destroy.  |this| is no longer valid when this method returns.
  void ReportResultAndDie(const std::string& fname,
                          const std::string& text,
                          bool success);
  
  pp::Instance* instance_;  // Weak pointer.
  std::string url_;  // URL to be downloaded.
  std::string vidID_;
  std::string conversionType_; //conversion type to be transcoded to
  pp::URLRequestInfo url_request_;
  pp::URLLoader url_loader_;  // URLLoader provides an API to download URLs.
  char* buffer_;  // Temporary buffer for reads.
  std::string url_response_body_;  // Contains accumulated downloaded data.
  pp::CompletionCallbackFactory<GetURLHandler> cc_factory_;

  GetURLHandler(const GetURLHandler&);
  void operator=(const GetURLHandler&);
};

#endif  //GETURL_GETURL_HANDLER_H_

