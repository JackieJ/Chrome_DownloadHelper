#ifndef TRANSCODER_H
#define TRANSCODER_H

//c++ utils
#include <string>
#include <cstring>
#include <stdio.h>
#include <stdlib.h>
#include <vector>

//ppapi fs
#include "ppapi/c/pp_file_info.h"
#include "ppapi/c/ppb_file_io.h"
#include "ppapi/cpp/file_io.h"
#include "ppapi/cpp/file_ref.h"
#include "ppapi/cpp/file_system.h"

//ppapi utils
#include "ppapi/c/pp_errors.h"
#include "ppapi/c/ppb_instance.h"
#include "ppapi/cpp/module.h"
#include "ppapi/cpp/var.h"
#include "ppapi/cpp/var_array_buffer.h"
#include "ppapi/cpp/completion_callback.h"
#include "ppapi/cpp/url_loader.h"
#include "ppapi/cpp/url_request_info.h"
#include "ppapi/cpp/instance.h"
#include "ppapi/utility/completion_callback_factory.h"

#define READ_BUFFER_SIZE 32768
typedef std::vector<char> BUFFER;

class Transcoder {
 public:
  static Transcoder* Create(pp::Instance* instance, 
			    const std::string& url, 
			    const std::string& conversionType,
			    const std::string& vidID,
                            const std::string& cFormat);
  //start fetching content
  void Start();
  
 private:
  //constructor, securely triggered by Create()
  Transcoder(pp::Instance* instance, 
	     const std::string& url, 
	     const std::string& conversionType,
	     const std::string& vidID, 
             const std::string& cFormat);
  //destructor
  ~Transcoder();
  
  //transcoders CODECS:
  void FLVToMP3();
  void FLVToMP4();
  void MP4ToMP3();
  
  //fileIO callbacks
  pp::FileIO* file_io;
  pp::FileSystem* file_system;
  pp::FileRef* file_ref;
  void fileFlushCallback(int32_t result, void* data) {}
  void fileSystemOpenCallback(int32_t result, void* data) {}
  void fileOpenCallback(int32_t result, void* data) {}
  void fileWriteCallback(int32_t bytes_written, void* data) {}
  void fileReadCallback(int32_t bytes_read, void* data) {}
  
  //callbacks for bytes retrieval
  void OnOpen(int32_t result);
  void OnRead(int32_t result);
  void ReadBody();
  void AppendDataBytes(const char* buffer, int32_t num_bytes);
  void FinalReport(BUFFER buffer, bool success);
  void Die(BUFFER buffer, bool success);
  //weak pointer to the NACL module instance
  pp::Instance *instance_;
  
  std::string url_;
  std::string vidID_;
  std::string conversionType_;
  std::string currentFormat_;
  //url loading
  pp::URLRequestInfo url_request_;
  pp::URLLoader url_loader_;
  
  BUFFER totalBuffer;
  char* buffer_;
  char* encodingBuffer;
  pp::CompletionCallbackFactory<Transcoder> cc_factory_;
  
  Transcoder(const Transcoder&);
  void operator=(const Transcoder&);
};

#endif
