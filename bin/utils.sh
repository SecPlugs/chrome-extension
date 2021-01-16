#!/bin/bash
# Utility functions 

# Check return code and exit on failure 
function check_return_code {

    if [ $1 -ne 0 ]; then
        echo ':-{'
        exit $1
    fi
}
