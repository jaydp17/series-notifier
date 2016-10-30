#!/usr/bin/env bash

imageName="seriesnotifier_server"
docker run --rm --entrypoint tar ${imageName} czf - /root/.yarn-cache/ > .yarn-cache.tgz
