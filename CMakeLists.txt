cmake_minimum_required(VERSION 3.15)
project(MinecraftWebNPC CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(mc_npc_server main.cpp crow_all.h asio.hpp)
