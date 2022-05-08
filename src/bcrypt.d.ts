/// <reference types="emscripten" />

declare const Module: EmscriptenModule & {
  cwrap: typeof cwrap
  lengthBytesUTF8: typeof lengthBytesUTF8
}
export default Module
