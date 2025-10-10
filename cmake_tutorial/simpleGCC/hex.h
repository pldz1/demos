#include <stdlib.h>
#include <stdio.h>

char *int2hex(int decimal)
{
    // 1. 静态变量来存储结果，否则函数返回时，局部数组的内存会被释放.
    static char hex[10];

    // 2. 也可以采用动态的内存.
    // char *hex = (char *)malloc(10 * sizeof(char));
    // if (hex == NULL)
    // {
    //     printf("Failed to allocate memory\n");
    //     exit(1);
    // }

    sprintf(hex, "%x", decimal);
    return hex;
}
