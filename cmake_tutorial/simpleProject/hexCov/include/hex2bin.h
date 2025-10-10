#include <stdio.h>
#include <stdlib.h>

void hexToBinary(const char *hexStr, char binaryStr[])
{
    long decimal = strtol(hexStr, NULL, 16);
    int i = 0;
    while (decimal > 0)
    {
        binaryStr[i] = (decimal % 2) + '0';
        decimal /= 2;
        i++;
    }
    binaryStr[i] = '\0';

    // 翻转字符串
    int start = 0;
    int end = i - 1;
    while (start < end)
    {
        char temp = binaryStr[start];
        binaryStr[start] = binaryStr[end];
        binaryStr[end] = temp;
        start++;
        end--;
    }
}