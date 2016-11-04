#!/usr/bin/env bash

babel server -d build/server --copy-files --source-maps
babel client -d build/client --copy-files --source-maps
