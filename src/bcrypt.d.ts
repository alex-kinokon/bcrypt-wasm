/// <reference types="emscripten" />

declare const Module: EmscriptenModule & {
  cwrap: typeof cwrap
}
export default Module
