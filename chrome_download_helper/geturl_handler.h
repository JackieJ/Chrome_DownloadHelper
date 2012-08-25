#ifndef GETURL_GETURL_HANDLER_H_
#define GETURL_GETURL_HANDLER_H_

//c++ utils
#include <string>
#include <cstring>
#include <stdio.h>
#include <stdlib.h>

//ppapi
#include "ppapi/c/pp_errors.h"
#include "ppapi/c/ppb_instance.h"
#include "ppapi/cpp/module.h"
#include "ppapi/cpp/var.h"
#include "ppapi/cpp/completion_callback.h"
#include "ppapi/cpp/url_loader.h"
#include "ppapi/cpp/url_request_info.h"
#include "ppapi/cpp/instance.h"
#include "ppapi/utility/completion_callback_factory.h"

//NACL fs libs

/*
#include "ppapi/c/pp_file_info.h"
#include "ppapi/c/ppb_file_io.h"
#include "ppapi/cpp/file_io.h"
#include "ppapi/cpp/file_ref.h"
#include "ppapi/cpp/file_system.h"
*/

#define READ_BUFFER_SIZE 32768

class GetURLHandler {
 public:
  static GetURLHandler* Create(pp::Instance* instance_,
                               const std::string& url, const std::string& conversionType, const std::string& vidID);
  // Initiates page (URL) download.
  void Start();

  //NACL sandbox file system
  pp::FileIO* file_io;
  pp::FileSystem* file_system;
  pp::FileRef* file_ref;
  
 private:
  GetURLHandler(pp::Instance* instance_, const std::string& url, const std::string& conversionType, const std::string& vidID);
  ~GetURLHandler();

  //nacl sandbox fs: put them outside the class
  
  /*
  void fileFlushCallback(int32_t result, void* data) {}
  void fileSystemOpenCallback(int32_t result, void* data) {}
  void fileOpenCallback(int32_t result, void* data) {}
  void fileWriteCallback(int32_t bytes_written, void* data) {}
  void fileReadCallback(int32_t bytes_read, void* data) {}
  */

  //read url 
  void OnOpen(int32_t result);
  void OnRead(int32_t result);
  void ReadBody();
  void AppendDataBytes(const char* buffer, int32_t num_bytes);
  void ReportResult(const std::string& fname,
                    const std::string& fdata,
                    bool success);
  void ReportResultAndDie(const std::string& fname,
                          const std::string& fdata,
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

