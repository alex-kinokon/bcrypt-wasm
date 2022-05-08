var fs = require("fs")
var path = require("path")
Module.wasmBinary = fs.readFileSync(path.resolve(__dirname, "bcrypt.wasm"))
