#include <cstdio>
#include <string>
#include "ppapi/cpp/instance.h"
#include "ppapi/cpp/module.h"
#include "ppapi/cpp/var.h"

using namespace std;


class ChromeDownloadHelperInstance : public pp::Instance {
public:
  explicit ChromeDownloadHelperInstance(PP_Instance instance) : pp::Instance(instance)
  {}
  virtual ~ChromeDownloadHelperInstance() {}
  virtual void HandleMessage(const pp::Var& var_message) {
    if (!var_message.is_string()) return;
    PostMessage(var_message);
  }
};

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
