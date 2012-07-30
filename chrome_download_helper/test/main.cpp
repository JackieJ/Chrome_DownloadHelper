#include <cstring>
#include <stdio.h>
#include <stdlib.h>
#include <string>

using namespace std;

#define INBUF_SIZE 4096
#define MAX_BUF 999999

int main(int argc, char **argv) {
  if (argc != 3) {
    printf("Err:%s\n","Please specify the input file and the output type!");
    exit(1);
  }
  
  char* inputFileName = argv[1];
  char* outputType = argv[2];
  //parse file into command line
  printf ("%s\n","Checking if processor is available...");
  if(system(NULL)) {
    printf("%s\n","OK...");
  } else {
    exit(1);
  }
  
  char eScript[MAX_BUF];
  strcpy(eScript,"");

  //script "ffmpeg -i input_file -strict experimental -sameq -s vga -aspect 1.7777  -y output.mp4";

  strcat(eScript, "ffmpeg -i ");
  strcat(eScript, inputFileName);
  strcat(eScript, " -strict experimental -sameq -aspect 1.7777  -y output");
  
  if (strcmp(outputType,"-mp3") == 0) {
    strcat(eScript, ".mp3");
  }
  else if (strcmp(outputType, "-mp4") == 0) {
    strcat(eScript, ".mp4");
  }
  
  const char*executeScript = eScript;
  printf("%s\n",executeScript);
  
  system(executeScript);
  
  return 0;
}
