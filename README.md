# bcrypt-wasm

Port of [kelektiv/node.bcrypt.js](https://github.com/kelektiv/node.bcrypt.js) to
WebAssembly.

## Why

I hate node-gyp.

## Build

1. Download [emscripten](https://emscripten.org/docs/getting_started/downloads.html)
   to somewhere
2. `PATH="$PATH:/PATH_TO_YOUR/emsdk/upstream/emscripten"`
3. `yarn`
4. `yarn build`
5. `yarn test` to make sure it works.
6. Done

## Security

Cryptography is serious business. If you spot anything suspicious or wrong,
please open an issue, optionally encrypted with my [PGP Key](https://github.com/proteriax/proteriax/blob/master/public.pgp).

## License

MIT
