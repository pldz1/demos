#include <stdio.h>
#include "hexCov.h"
#include "decCov.h"
#include "octCov.h"

int main()
{
    printf("1. Program decimal converter\n");
    printf("2. Program octal converter\n");
    printf("3. Program hex converter\n");
    printf("Enter an program number:   ");

    int progID;
    progID = scanf("%d", &progID);

    switch (progID)
    {
    case 1:
        decCov();
        break;
    case 2:
        octCov();
        break;
    case 3:
        hexCov();
        break;
    default:
        break;
    }

    return 0;
}