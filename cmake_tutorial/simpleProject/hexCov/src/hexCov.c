#include "hex2bin.h"
#include "hex2dec.h"
#include "hex2otc.h"
#include "hexCov.h"

void hexToBinary(const char *hexStr, char binaryStr[]);
long hexToDec(const char *hexStr);
void hexToOct(char *hexStr, char octalStr[]);

int hexCov()
{
    char hexStr[100];
    printf("Enter a hexadecimal number: ");
    scanf("%s", hexStr);

    // 将十六进制字符串转换为十进制整数
    long decimal = hexToDec(hexStr);
    printf("Decimal: %ld\n", decimal);

    // 将十六进制字符串转换为八进制字符串
    char octalStr[100];
    hexToOct(hexStr, octalStr);
    printf("Octal: %s\n", octalStr);

    // 将十六进字符串转换为二进制字符串
    char binaryStr[100];
    hexToBinary(hexStr, binaryStr);
    printf("Binary: %s \n", binaryStr);
    return 0;
}