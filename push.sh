#!/bin/bash

#进入monitor mode
set -m

current_path=$(
    cd $(dirname $0)
    pwd
)

cd $current_path

git add .
git commit -m update --no-verify
git push origin main

echo "git push 已完成"