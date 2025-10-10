#include <stdio.h>

// 十进制转八进制
void decimalToOctal(int decimal)
{
    if (decimal == 0)
    {
        printf("0");
        return;
    }

    int remainder;
    int octal[100];
    int i = 0;

    while (decimal != 0)
    {
        remainder = decimal % 8;
        octal[i++] = remainder;
        decimal /= 8;
    }

    printf("0");

    for (int j = i - 1; j >= 0; j--)
    {
        printf("%d", octal[j]);
    }
}
