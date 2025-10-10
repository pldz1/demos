#include <stdlib.h>

long hexToDec(const char *hexStr)
{
    return strtol(hexStr, NULL, 16);
}