#include <stdio.h>
#include <stdlib.h>

#include <libavcodec/avcodec.h>
#include <libavformat/avformat.h>

using namespace std;

int main(int argc, char *argv[]) {
  
  av_register_all();
  
  printf("It works!\n");
  return 0;
}
