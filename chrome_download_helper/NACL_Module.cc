#include <cstdio>
#include <string>
#include "ppapi/cpp/instance.h"
#include "ppapi/cpp/module.h"
#include "ppapi/cpp/var.h"
#include "ppapi/cpp/url_loader.h"

//#include "geturl_handler.h"
#include "transcoder.h"

class NACL_ModuleInstance : public pp::Instance {
public:
  explicit NACL_ModuleInstance(PP_Instance instance) : pp::Instance(instance)
  {}
  virtual ~NACL_ModuleInstance() {}
  virtual void HandleMessage(const pp::Var& var_message);
};

void NACL_ModuleInstance::HandleMessage(const pp::Var& var_message) {
  if (!var_message.is_string()) {
    return;
  }
  std::string mediaEntry = var_message.AsString();
  
  //split conversion type and media url
  size_t foundFirstColon;
  size_t foundSecondColon;
  size_t foundCformat;
  std::string vidID;
  std::string url;
  std::string conversionType;
  std::string currentFormat;
  foundFirstColon = mediaEntry.find("((--))");
  foundSecondColon = mediaEntry.find("((--))", foundFirstColon + 1);
  if (foundFirstColon != std::string::npos) {
    vidID = mediaEntry.substr(0,foundFirstColon);
    conversionType = mediaEntry.substr(foundFirstColon + 6, foundSecondColon - (foundFirstColon + 6));
    url = mediaEntry.substr(foundSecondColon + 6);    
  }
  foundCformat = mediaEntry.find("<<-->>");
  if (foundCformat != std::string::npos) {
    currentFormat = mediaEntry.substr(foundCformat + 6);
  }
  //create a url handler
  Transcoder* handler = Transcoder::Create(this, url, conversionType, vidID, currentFormat);  
  if (handler != NULL) {
    //start url content processing
    handler->Start();
  }
}

//module loading/initilization
class NACLModule : public pp::Module {
public:
  NACLModule() : pp::Module() {}
  virtual ~NACLModule() {}
  virtual pp::Instance* CreateInstance(PP_Instance instance) {
    return new NACL_ModuleInstance(instance);
  }
};

namespace pp {
  Module* CreateModule() {
    return new NACLModule();
  }
}  // namespace pp
