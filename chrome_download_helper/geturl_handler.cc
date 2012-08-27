#include <sstream>
#include <iostream>

#include "geturl_handler.h"

//libav
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
  
  /*
  //decide output name
  char outputNameBuffer[15];
  strcpy(outputNameBuffer,"");
  strcat(outputNameBuffer,"/output.");
  strcat(outputNameBuffer,conversionType_.c_str());
  const char* outputFile =  outputNameBuffer;
  
  //init fs
  file_system = new pp::FileSystem(instance_, PP_FILESYSTEMTYPE_LOCALTEMPORARY);
  file_ref = new pp::FileRef(*file_system, outputFile);
  file_io = new pp::FileIO(instance_);
  */

  //debugging
  //pp::Var debuggingMessage(outputFile);
  //instance_->PostMessage(debuggingMessage);
}

GetURLHandler::~GetURLHandler() {
  delete [] buffer_;
  buffer_ = NULL;
  
  //close and reclaim memory for the sandbox fs
  //file_io->Close();
  
  //delete file_io;
  //delete file_ref;
  //delete file_system;
  
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
    cc.Run(result);
  }
}

void GetURLHandler::ReportResultAndDie(const std::string& fname,
                                       const std::string& fdata,
                                       bool success) {
  ReportResult(fname, fdata, success);
  delete this;
}

void GetURLHandler::ReportResult(const std::string& fname,
                                 const std::string& fdata,
                                 bool success) {
  if (success)
    printf("GetURLHandler::ReportResult(Ok).\n");
  else {
    printf("GetURLHandler::ReportResult(Err). %s\n", fdata.c_str());
    return;
  }
  fflush(stdout);
  
  if (instance_) {
    
    string progressReport("progress---->");
    progressReport.append(vidID_);
    progressReport.append("---->100");
    pp::Var progressReportBack(progressReport);
    instance_->PostMessage(progressReportBack);
    
  }
  
  /*
  //callback factory for member functions
  pp::CompletionCallback fsOpenCallback = cc_factory_.NewOptionalCallback(&GetURLHandler::fileSystemOpenCallback, this);
  pp::CompletionCallback fOpenCallback = cc_factory_.NewOptionalCallback(&GetURLHandler::fileOpenCallback, this);
  pp::CompletionCallback fWriteCallback = cc_factory_.NewOptionalCallback(&GetURLHandler::fileWriteCallback, this);
  
  pp:: Var fileName(file_ref->GetName());
  instance_->PostMessage(fileName);
  
  //open sandbox fs
  file_system->Open((fdata.size()*2), fsOpenCallback);
  //open file
  file_io->Open(*file_ref, 
		PP_FILEOPENFLAG_READ|PP_FILEOPENFLAG_WRITE|PP_FILEOPENFLAG_CREATE,
		fOpenCallback);
  //write to file
  file_io->Write(0, fdata.c_str(), fdata.size(), fWriteCallback);
  instance_->PostMessage(file_ref->GetName());
  */
}

