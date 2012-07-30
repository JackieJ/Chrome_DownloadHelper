#include <iostream>
#include <stdio.h>
#include <stdlib.h>
#include <string>

using namespace std;

#define INBUF_SIZE 4096
#define MAX_BUF 999999

int main(int argc, char **argv) {
  if (argc != 2) {
    printf("Err:%s\n","Please specify the input file!");
    exit(1);
  }
  
  char* inputFileName = argv[1];
  
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
  strcat(eScript, " -strict experimental -sameq -s vga -aspect 1.7777  -y output.mp3");
  const char*executeScript = eScript;
  printf("%s\n",executeScript);
  
  system(executeScript);
  
  return 0;
}
