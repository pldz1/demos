#include <stdio.h>
#include <math.h>

// 八进制转十六进制
void octalToHexadecimal(int octal)
{
    int decimal = 0, i = 0;

    // 将八进制转换为十进制
    while (octal != 0)
    {
        decimal += (octal % 10) * pow(8, i);
        ++i;
        octal /= 10;
    }

    // 将十进制转换为十六进制
    int remainder;
    char hexadecimal[100];
    i = 0;

    while (decimal != 0)
    {
        remainder = decimal % 16;

        if (remainder < 10)
            hexadecimal[i] = remainder + '0';
        else
            hexadecimal[i] = remainder + 'A' - 10;

        ++i;
        decimal /= 16;
    }

    printf("0x");

    for (int j = i - 1; j >= 0; --j)
        printf("%c", hexadecimal[j]);
}