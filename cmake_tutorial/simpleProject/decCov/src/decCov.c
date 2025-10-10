#include <stdio.h>
#include "decCov.h"
#include "dec2bin.h"
#include "dec2hex.h"
#include "dec2oct.h"

void decimalToBinary(int decimal);
void decimalToHexadecimal(int decimal);
void decimalToOctal(int decimal);

int decCov()
{
    int decimal;
    printf("Enter a decimal number: ");
    scanf("%d", &decimal);

    printf("Hexadecimal: ");
    decimalToHexadecimal(decimal);
    printf("\n");

    printf("Octal: ");
    decimalToOctal(decimal);
    printf("\n");

    printf("Binary: ");
    decimalToBinary(decimal);
    printf("\n");

    return 0;
}