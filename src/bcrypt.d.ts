/// <reference types="emscripten" />

declare const createModule: () => EmscriptenModule & {
  cwrap: typeof cwrap
  lengthBytesUTF8: typeof lengthBytesUTF8
}

export default createModule
