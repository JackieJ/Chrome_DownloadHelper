#include <stdio.h>
#include <stdlib.h>
#include <sstream>
#include "ppapi/c/pp_errors.h"
#include "ppapi/c/ppb_instance.h"
#include "ppapi/cpp/module.h"
#include "ppapi/cpp/var.h"
#include <fstream>
#include <iostream>

#include "geturl_handler.h"

extern "C" {
#include "libavformat/avformat.h"
#include "libavcodec/avcodec.h"
#include "libavutil/mathematics.h"
}

using namespace std;

namespace {
  bool IsError(int32_t result) {
    return ((PP_OK != result) && (PP_OK_COMPLETIONPENDING != result));
  }
}  // namespace

GetURLHandler* GetURLHandler::Create(pp::Instance* instance,
                                     const std::string& url, const std::string& conversionType, const std::string& vidID) {
  return new GetURLHandler(instance, url, conversionType, vidID);
}

GetURLHandler::GetURLHandler(pp::Instance* instance,
                             const std::string& url, const std::string& conversionType, const std::string& vidID)
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
  
  //debugging
  avcodec_init();
  avcodec_register_all();
  //instance_->PostMessage(conversionType_);
}

GetURLHandler::~GetURLHandler() {
  delete [] buffer_;
  buffer_ = NULL;
}

void GetURLHandler::Start() {
  pp::CompletionCallback cc =
    cc_factory_.NewCallback(&GetURLHandler::OnOpen);
  url_loader_.Open(url_request_, cc);
}

void GetURLHandler::OnOpen(int32_t result) {
  if (result != PP_OK) {
    ReportResultAndDie(url_, "pp::URLLoader::Open() failed", false);
    return;
  }
  
  int64_t bytes_received = 0;
  int64_t total_bytes_to_be_received = 0;
  if (url_loader_.GetDownloadProgress(&bytes_received,
                                      &total_bytes_to_be_received)) {
    if (total_bytes_to_be_received > 0) {
      url_response_body_.reserve(total_bytes_to_be_received);
    }
  }
  // We will not use the download progress anymore, so just disable it.
  url_request_.SetRecordDownloadProgress(true);
  
  // Start streaming.
  ReadBody();
}

void GetURLHandler::AppendDataBytes(const char* buffer, int32_t num_bytes) {
  if (num_bytes <= 0)
    return;
  
  num_bytes = std::min(READ_BUFFER_SIZE, num_bytes);
  
  url_response_body_.insert(url_response_body_.end(),
                            buffer,
                            buffer + num_bytes);
}

void GetURLHandler::OnRead(int32_t result) {
  if (result == PP_OK) {
    //reclaim memory
    delete [] buffer_;
    buffer_ = NULL;
    ReportResultAndDie(url_, url_response_body_, true);
  } else if (result > 0) {
    // The URLLoader just filled "result" number of bytes into our buffer.
    // Save them and perform another read.
    AppendDataBytes(buffer_, result);
    ReadBody();
  } else {
    //read error handling
    ReportResultAndDie(url_,
                       "pp::URLLoader::ReadResponseBody() result<0",
                       false);
  }
}

void GetURLHandler::ReadBody() {
  
  pp::CompletionCallback cc =
      cc_factory_.NewOptionalCallback(&GetURLHandler::OnRead);
  int32_t result = PP_OK;
  do {
    result = url_loader_.ReadResponseBody(buffer_, READ_BUFFER_SIZE, cc);
  
    if (result > 0) {
      AppendDataBytes(buffer_, result);
      
      //send progress message to client side js
      int64_t bytes_received = 0;
      int64_t total_bytes_to_be_received = 0;
      url_loader_.GetDownloadProgress(&bytes_received, &total_bytes_to_be_received);
      
      int64_t totalBytes = bytes_received + total_bytes_to_be_received;
      if (totalBytes != 0) {  
		
	double percentage = (double)((bytes_received * 100) / total_bytes_to_be_received);
	ostringstream strs;
	strs << percentage;
	string percentageStr = strs.str();
	string progressReport("progress---->");
	progressReport.append(vidID_);
	progressReport.append("---->");
	progressReport.append(percentageStr);
	pp::Var progressReportBack(progressReport);
	instance_->PostMessage(progressReportBack);
      }
    }
  } while (result > 0);

  if (result != PP_OK_COMPLETIONPENDING) {
    // Either we reached the end of the stream (result == PP_OK) or there was
    // an error. We want OnRead to get called no matter what to handle
    // that case, whether the error is synchronous or asynchronous. If the
    // result code *is* COMPLETIONPENDING, our callback will be called
    // asynchronously.
    cc.Run(result);
  }
}

void GetURLHandler::ReportResultAndDie(const std::string& fname,
                                       const std::string& text,
                                       bool success) {
  ReportResult(fname, text, success);
  delete this;
}

void GetURLHandler::ReportResult(const std::string& fname,
                                 const std::string& text,
                                 bool success) {
  if (success)
    printf("GetURLHandler::ReportResult(Ok).\n");
  else
    printf("GetURLHandler::ReportResult(Err). %s\n", text.c_str());
  fflush(stdout);

  //debug:write data into a file
  ofstream outputFile;
  const char* fileName = "output.mp3";
  //strcpy(fileName, conversionType_.c_str());
  outputFile.open(fileName);
  outputFile << text;
  outputFile.close();
  pp::Var report("Writing File");
  instance_->PostMessage(report);
  
  if (instance_) {
    
    string progressReport("progress---->");
    progressReport.append(vidID_);
    progressReport.append("---->100");
    pp::Var progressReportBack(progressReport);
    instance_->PostMessage(progressReportBack);
    
  }
}

