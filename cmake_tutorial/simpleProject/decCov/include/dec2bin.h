#include <stdio.h>

// 十进制转二进制
void decimalToBinary(int decimal)
{
    if (decimal == 0)
    {
        printf("0");
        return;
    }

    int binary[100];
    int i = 0;

    while (decimal != 0)
    {
        binary[i++] = decimal % 2;
        decimal /= 2;
    }

    for (int j = i - 1; j >= 0; j--)
    {
        printf("%d", binary[j]);
    }
}
