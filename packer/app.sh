#!/bin/sh -e

# OCaml
eval `opam config env`

# Install app
cd ~/app
npm install
npm run clean && npm run build

# Systemd
systemd_target="/lib/systemd/system/draco.service"
base_dir="${HOME}/app"
node_binary=`which node`
run_script="${base_dir}/node_modules/@lidcore/draco/src/daemon.js"

cat draco.systemd.in | \
    sed -e "s#@base_dir@#${base_dir}#g" | \
    sed -e "s#@node_binary@#${node_binary}#g" | \
    sed -e "s#@run_script@#${run_script}#g" >| draco.systemd

sudo cp -f draco.systemd "${systemd_target}"
sudo systemctl enable draco.service
