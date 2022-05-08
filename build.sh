#!/bin/bash
set -e
mkdir -p lib
emcc ./src/crypt/index.c \
	--pre-js ./src/crypt/pre.js \
	-fwasm-exceptions \
	-O3 \
	-o lib/bcrypt.mjs \
	-s EXPORTED_RUNTIME_METHODS='["cwrap","lengthBytesUTF8"]' \
	-s ENVIRONMENT=node \
	-s BINARYEN_ASYNC_COMPILATION=0
sed -i.bak 's/if (ENVIRONMENT_IS_NODE)/if (true)/' lib/bcrypt.mjs
npx rollup -c
rm lib/bcrypt.mjs lib/bcrypt.mjs.bak
npx terser lib/index.js \
	--compress unsafe_methods,ecma=2021,sequences=false \
	--output lib/index.js
npx prettier --write lib/index.js --semi
