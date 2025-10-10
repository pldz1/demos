cmake_minimum_required(VERSION 3.0)
project(OCTCOV)

# 输出一段话，可以显示CMake的进度.
message(">>> Into octCov CMakeLists.txt")

# 设置当前的工作空间
set(CUR_DIR ${CMAKE_CURRENT_SOURCE_DIR})

# 生成库文件
# 源文件已经在父CMakeLists.txt添加完成不需要再添加源文件.
# 添加源文件，注意，此时不添加main.c进去，否则会出现多个mian函数入口！
add_library(octcov STATIC ${CUR_DIR}/src/octCov.c)
