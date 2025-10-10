#include <stdio.h>
#include "oct2bin.h"
#include "oct2dec.h"
#include "oct2hex.h"

void octalToHexadecimal(int octal);
void octalToDecimal(int octal);
void octalToBinary(int octal);

int octCov()
{
    int octal;
    printf("Enter an octal number: ");
    scanf("%d", &octal);

    printf("Hexadecimal: ");
    octalToHexadecimal(octal);
    printf("\n");

    printf("Decimal: ");
    octalToDecimal(octal);
    printf("\n");

    printf("Binary: ");
    octalToBinary(octal);
    printf("\n");

    return 0;
}