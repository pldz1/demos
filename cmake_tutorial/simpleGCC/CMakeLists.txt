cmake_minimum_required(VERSION 3.0)
project(TEST)

option(USE_FEATURE "Enable feature" ON)
if(USE_FEATURE)
message("Feature enabled")
else()
message("Feature disabled")
endif()