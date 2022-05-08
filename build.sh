#!/bin/bash
set -e
mkdir -p lib
emcc ./src/crypt/index.c \
	--pre-js ./src/crypt/pre.js \
	--extern-pre-js ./src/crypt/extern-pre.txt \
	--extern-post-js ./src/crypt/extern-post.txt \
	-fwasm-exceptions \
	-o lib/bcrypt.js \
	-s EXPORTED_RUNTIME_METHODS='["cwrap","lengthBytesUTF8"]' \
	-s BINARYEN_ASYNC_COMPILATION=0
npx tsc
npx esbuild lib/bcrypt.js \
	--outfile=lib/bcrypt.js \
	--allow-overwrite \
	--platform=node \
	--target=node16 \
	--tree-shaking=true \
	--minify-identifiers \
	--minify-syntax