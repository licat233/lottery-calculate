#!/bin/bash
###
 # @Author: licat
 # @Date: 2023-02-02 18:42:49
 # @LastEditors: licat
 # @LastEditTime: 2023-02-02 18:44:54
 # @Description: licat233@gmail.com
### 

#进入monitor mode
set -m

current_path=$(
    cd $(dirname $0)
    pwd
)

cd $current_path

npm run build