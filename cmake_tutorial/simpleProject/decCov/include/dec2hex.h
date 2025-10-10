#include <stdio.h>

// 十进制转十六进制
void decimalToHexadecimal(int decimal)
{
    if (decimal == 0)
    {
        printf("0x0");
        return;
    }

    int remainder;
    char hexadecimal[100];
    int i = 0;

    while (decimal != 0)
    {
        remainder = decimal % 16;

        if (remainder < 10)
        {
            hexadecimal[i] = remainder + '0';
        }
        else
        {
            hexadecimal[i] = remainder + 'A' - 10;
        }

        i++;
        decimal /= 16;
    }

    printf("0x");

    for (int j = i - 1; j >= 0; j--)
    {
        printf("%c", hexadecimal[j]);
    }
}
