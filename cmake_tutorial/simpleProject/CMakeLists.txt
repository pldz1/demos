cmake_minimum_required(VERSION 3.0)

# # 假设进行交叉编译,在project设置之前设置交叉编译的工具设置！
# # 设置目标机器类型.
# set(CMAKE_SYSTEM_NAME Linux)
# # 设置目标系统架构.
# set(CMAKE_SYSTEM_PROCESSOR aarch64)
# # 设置交叉编译的工具链位置.
# set(AARCH64_CHAIN_PATH /home/pldz/aarch64/bin)
# # 设置交叉编译的工具.
# set(CMAKE_C_COMPILER ${AARCH64_CHAIN_PATH}/aarch64-linux-gnu-gcc)
# set(CMAKE_CXX_COMPILER ${AARCH64_CHAIN_PATH}/aarch64-linux-gnu-g++)

project(BCDCOV)

# 设置工程的路径，也就是和CMakeLists.txt同一个层级的目录，同时声明为可以传递给子cmake的全局变量.
set(PROPATH ${CMAKE_SOURCE_DIR})
message(">>> I am parents directory, CMAKE_SOURCE_DIR is: " ${PROPATH})

# 设置库文件输出位置
set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY ${PROJECT_SOURCE_DIR}/libs)
message(">>> I am parents directory, PROJECT_SOURCE_DIR is: " ${PROJECT_SOURCE_DIR})

# 设置可执行文件的输出位置
set(EXECUTABLE_OUTPUT_PATH ${PROJECT_BINARY_DIR})

# 设置头文件的位置，为了最后的main.c能够找到头文件.
include_directories(${PROJECT_SOURCE_DIR}/decCov/include)  
include_directories(${PROJECT_SOURCE_DIR}/hexCov/include)  
include_directories(${PROJECT_SOURCE_DIR}/octCov/include)  

# 添加子目录
add_subdirectory(${PROPATH}/decCov)
add_subdirectory(${PROPATH}/hexCov)
add_subdirectory(${PROPATH}/octCov)
add_subdirectory(${PROPATH}/src)

