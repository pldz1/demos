cmake_minimum_required(VERSION 3.0)
project(BCDCORE)

# 可执行文件
add_executable(test.elf main.c)  
# 可执行文件依赖的库文件包括一个数学库math也就是m(-lm)
target_link_libraries(test.elf deccov hexcov octcov m)
