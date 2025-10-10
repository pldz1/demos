#include <stdio.h>

void hexToOct(char *hexStr, char octalStr[])
{
    long decimal = strtol(hexStr, NULL, 16);
    sprintf(octalStr, "%lo", decimal);
}