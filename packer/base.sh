#!/bin/sh -e

# APT
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y opam nodejs

# Opam
opam init -a --comp 4.02.3+buckle-master
eval `opam config env`

# Files
mkdir -p /home/ubuntu/app
