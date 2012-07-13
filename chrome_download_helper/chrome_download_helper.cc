#include <cstdio>
#include <string>
#include "ppapi/cpp/instance.h"
#include "ppapi/cpp/module.h"
#include "ppapi/cpp/var.h"
#include "ppapi/cpp/url_loader.h"

#include "geturl_handler.h"

using namespace std;


//
class ChromeDownloadHelperInstance : public pp::Instance {
public:
  explicit ChromeDownloadHelperInstance(PP_Instance instance) : pp::Instance(instance)
  {}
  virtual ~ChromeDownloadHelperInstance() {}
  virtual void HandleMessage(const pp::Var& var_message);
};

void ChromeDownloadHelperInstance::HandleMessage(const pp::Var& var_message) {
  if(!var_message.is_string()) {
    return;
  }
  string url = var_message.AsString();
  //create a url handler
  GetURLHandler* handler = GetURLHandler::Create(this, url);  
  if(handler != NULL) {
    //start url content processing
    handler->Start();
  }
}

//module loading/initilization
class ChromeDownloadHelperModule : public pp::Module {
public:
  ChromeDownloadHelperModule() : pp::Module() {}
  virtual ~ChromeDownloadHelperModule() {}
  virtual pp::Instance* CreateInstance(PP_Instance instance) {
    return new ChromeDownloadHelperInstance(instance);
  }
};

namespace pp {
  Module* CreateModule() {
    return new ChromeDownloadHelperModule();
  }
}  // namespace pp
