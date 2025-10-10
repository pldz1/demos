cmake_minimum_required(VERSION 3.0)
project(DECCOV)

# 输出一段话，观察add_subdirectory的顺序.
message(">>> Into decCov CMakeLists.txt")

# 查看父CMakeLists.txt的变量传递到子文件中的例子
message("<<< Parent path: " ${PROPATH})

# 此时的cmake语法中的宏变量是针对于父CMakeLists.txt的变量了.
message("<<< In decCov PROJECT_SOURCE_DIR is: " ${CMAKE_SOURCE_DIR})

# 此时针对项目的变量依旧是指向当前CMakeLists.txt的值
message("<<< In decCov PROJECT_SOURCE_DIR is: " ${PROJECT_SOURCE_DIR})

# 设置当前的工作空间
set(CUR_DIR ${CMAKE_CURRENT_SOURCE_DIR})

# 生成库文件
# 源文件已经在父CMakeLists.txt添加完成不需要再添加源文件.
# 添加源文件，注意，此时不添加main.c进去，否则会出现多个mian函数入口！
add_library(deccov STATIC ${CUR_DIR}/src/decCov.c)