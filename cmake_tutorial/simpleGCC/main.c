#include <math.h>
#include "hex.h"

int main()
{
    // 1. 测试十进制和十六进制
    int decimal;
    char *hex;
    printf("Enter a decimal number: ");
    scanf("%d", &decimal);
    hex = int2hex(decimal);
    printf("Hexadecimal: %s\n", hex);

    // 测试math.h的引入动态库,sqrt参数实际上是double类型的,这里使用int类型也是可以的.
    printf("Sqrt value is: %lf\n", sqrt(decimal));
    return 0;
}
