#!/usr/bin/env sh

cd chain/landSC/ && npm run migrate:dev && \
cd ../bankContracts && npm run migrate:dev
