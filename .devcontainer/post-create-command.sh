#!/bin/bash

# Exit in case of error
set -e

# this seems to have to run for some reason
(npm install)

# vite must be installed
(npm install vite)

# essential in order for firebase functions to work as intended
(npm install firebase-tools)
(sudo npm install --save react-dropzone)
(npm install react-loader-spinner)