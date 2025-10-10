#include <stdio.h>
#include <math.h>

// 八进制转十进制
void octalToDecimal(int octal)
{
    int decimal = 0, i = 0;

    // 将八进制转换为十进制
    while (octal != 0)
    {
        decimal += (octal % 10) * pow(8, i);
        ++i;
        octal /= 10;
    }

    printf("%d", decimal);
}
