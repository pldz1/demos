#include <stdio.h>
#include <math.h>

// 八进制转二进制
void octalToBinary(int octal)
{
    int decimal = 0, i = 0;

    // 将八进制转换为十进制
    while (octal != 0)
    {
        decimal += (octal % 10) * pow(8, i);
        ++i;
        octal /= 10;
    }

    // 将十进制转换为二进制
    int binary[100], j = 0;

    while (decimal != 0)
    {
        binary[j++] = decimal % 2;
        decimal /= 2;
    }

    for (int k = j - 1; k >= 0; --k)
        printf("%d", binary[k]);
}
