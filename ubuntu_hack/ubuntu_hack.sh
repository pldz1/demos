#!/bin/bash

# Function to display usage message
display_usage() {
    echo "Usage: $0 [-b] [-r] [-p <proxy_url>]"
    echo "Options:"
    echo "  -b    Display battery information"
    echo "  -m    Display CPU and memory usage"
    echo "  -p    Set HTTP and HTTPS proxy (format: host:port)"
    echo "  -r    Rotate the screen in the left direction"
    echo "  -s    Show screen if it is locked"
}

# Check if no options are provided
if [ "$#" -eq 0 ]; then
    display_usage
    exit 1
fi

# Ubuntu helper.
if [ "$1" = "-b" ]; then
    DEVICE_PATH=$(upower -e | grep 'BAT')
    upower -i "$DEVICE_PATH" | grep percentage | awk '{print "Battery =====> " $2}'

elif [ "$1" = "-m" ]; then
    top -b -n1 | grep "Cpu(s)" | awk '{print "CPU Usage =====> " $2 + $4 " %"}'
    free | awk '/Mem/{print "Mem Usage =====> " $3/$2 * 100.0 " %"}'

elif [ "$1" = "-r" ]; then
    xrandr -o left

elif [ "$1" = "-s" ]; then
	gnome-screensaver-command -d

elif [ "$1" = "-p" ]; then
    if [ "$#" -ne 2 ]; then
        echo "[ ERROR ] Invalid number of -p. Usage: -p <proxy_url>"
        exit 1
    fi
    echo -e "[ INFO ] To diable proxy, You should close the terminal. \n"
    
    echo "export http_proxy="http://$2/""
    echo "export https_proxy="http://$2/""
    echo "export ftp_proxy="http://$2/""
    echo "export no_proxy="127.0.0.1,localhost""
    # For curl
    echo "export HTTP_PROXY="http://$2/""
    echo "export HTTPS_PROXY="http://$2/""
    echo "export FTP_PROXY="http://$2/""
    echo "export NO_PROXY="127.0.0.1,localhost""

    echo -e "\n[ INFO ] Copy the follow message to set the proxy."


else
    echo "[ ERROR ] Invalid option: $1"
    display_usage
    exit 1
fi
