import crypto from "crypto"
import assert from "assert"
import createModule from "./bcrypt"

const Module = createModule()

const _genSalt = Module.cwrap("gen_salt", "string", ["string", "number", "array"])
const _encrypt = Module.cwrap("encrypt", "string", ["string", "number", "string"])
const _compare = Module.cwrap("compare", "boolean", ["string", "number", "string"])
const _getRounds = Module.cwrap("get_rounds", "number", ["string"])

/**
 * Generate a salt
 * @param rounds number of rounds (default 10)
 */
export function genSalt(
  rounds = 10,
  minor: "a" | "b" = "b",
  seed = crypto.randomBytes(16)
): string {
  assert(isNumber(rounds), "rounds must be a number")
  assert(minor === "a" || minor === "b", 'minor must be either "a" or "b"')

  return _genSalt(minor, rounds, seed)
}

/**
 * Hash data using a salt
 * @param data the data to encrypt
 * @param salt the salt to use when hashing
 */
export function hash(data: string, salt: string): string

/**
 * Hash data using an automatically generated salt
 * @param data the data to encrypt
 * @param round number of round to use when creating the salt
 */
export function hash(data: string, round: number): string

export function hash(data: string, salt: string | number): string {
  assert(data != null && salt != null, "data and salt arguments required")
  assert(isString(data), "data must be a string")
  assert(
    isString(salt) || isNumber(salt),
    "salt must either be a salt string or a number of rounds"
  )

  if (isNumber(salt)) {
    salt = genSalt(salt)
  }

  const encrypted = _encrypt(data, Module.lengthBytesUTF8(data), salt)
  if (encrypted === "INVALID_SALT") {
    throw new Error(
      "Invalid salt. Salt must be in the form of: $Vers$log2(NumRounds)$saltvalue"
    )
  }

  return encrypted
}

/**
 * Compare raw data to hash
 * @param data the data to hash and compare
 * @param hash expected hash
 * @return true if hashed data matches hash
 */
export function compare(data: string, hash: string): boolean {
  assert(data !== null && hash !== null, "data and hash arguments required")
  assert(isString(data), "data must be a string")
  assert(isString(hash), "hash must be a string")

  return _compare(data, Module.lengthBytesUTF8(data), hash)
}

/**
 * @param hash extract rounds from this hash
 * @return the number of rounds used to encrypt a given hash
 */
export function getRounds(hash: string): number {
  assert(hash !== null, "hash arguments required")
  assert(isString(hash), "hash must be a string")

  const round = _getRounds(hash)
  if (!round) {
    throw new Error("Invalid hash provided: " + round)
  }

  return _getRounds(hash)
}

function isString(value: any): value is string {
  return typeof value === "string"
}

function isNumber(value: any): value is number {
  return typeof value === "number" && !Number.isNaN(value)
}
