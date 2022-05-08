#!/bin/bash
mkdir -p lib
emcc ./src/crypt/index.c \
	--pre-js ./src/crypt/pre.js \
	-fwasm-exceptions \
	-o lib/bcrypt.js \
	-s EXPORTED_RUNTIME_METHODS='["cwrap"]' \
	-s BINARYEN_ASYNC_COMPILATION=0
npx tsc