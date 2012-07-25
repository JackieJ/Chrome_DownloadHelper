#include "libavcodec/avcodec.h"
#include "libavutil/mathematics.h"

#define INBUF_SIZE 4096

int main(int argc, char **argv) {
  
  const char* filename;

  //enable avcodec lib
  avcodec_init();

  //register codecs
  avcodec_register_all();


  
}
