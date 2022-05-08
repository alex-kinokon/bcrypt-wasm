import { describe, it } from "mocha"
import { strict as assert } from "assert"
import * as bcrypt from "../lib/index"

describe("bcrypt", () => {
  it("salt length", () => {
    const salt = bcrypt.genSalt(10)
    assert.equal(29, salt.length, "Salt isn’t the correct length.")
    const split_salt = salt.split("$")
    assert.equal(split_salt[1], "2b")
    assert.equal(split_salt[2], "10")
  })

  it("salt_no_params", () => {
    // same as test_verify_salt except using default rounds of 10
    const salt = bcrypt.genSalt()
    const split_salt = salt.split("$")
    assert.equal(split_salt[1], "2b")
    assert.equal(split_salt[2], "10")
  })

  it("salt_rounds_is_string_number", () => {
    assert.throws(() => {
      // @ts-expect-error wrong type
      bcrypt.genSalt("10")
    }, "Should throw an Error. No params.")
  })

  it("salt_rounds_is_NaN", () => {
    assert.throws(() => {
      // @ts-expect-error wrong type
      bcrypt.genSalt("b")
    }, "Should throw an Error. gen_salt requires rounds to be a number.")
  })

  it("salt_minor_a", () => {
    const salt = bcrypt.genSalt(10, "a")
    assert.equal(29, salt.length, "Salt isn't the correct length.")
    const split_salt = salt.split("$")
    assert.equal(split_salt[1], "2a")
    assert.equal(split_salt[2], "10")
  })

  it("salt_minor_b", () => {
    const salt = bcrypt.genSalt(10, "b")
    assert.equal(29, salt.length, "Salt isn't the correct length.")
    const split_salt = salt.split("$")
    assert.equal(split_salt[1], "2b")
    assert.equal(split_salt[2], "10")
  })

  it("hash", () => {
    assert.ok(bcrypt.hash("password", bcrypt.genSalt(10)), "Shouldn't throw an Error.")
  })

  it("hash_rounds", () => {
    const hash = bcrypt.hash("password", 8)
    assert.equal(bcrypt.getRounds(hash), 8, "Number of rounds should equal 8.")
  })

  it("hash_empty_string", () => {
    assert.ok(bcrypt.hash("", bcrypt.genSalt(10)), "Shouldn't throw an Error.")
    assert.throws(() => {
      bcrypt.hash("password", "")
    }, "Should have thrown an Error related to the salt.")
    assert.throws(() => {
      bcrypt.hash("", "")
    }, "Should have thrown an Error related to the salt.")
  })

  it("hash_pw_no_params", () => {
    assert.throws(() => {
      // @ts-expect-error wrong missing parameter
      bcrypt.hash()
    }, "Should throw an Error. No Params.")
  })

  it("hash_pw_one_param", () => {
    assert.throws(() => {
      // @ts-expect-error missing param
      bcrypt.hash("password")
    }, "Should throw an Error. No salt.")
  })

  it("hash_pw_not_hash_str", () => {
    assert.throws(() => {
      // @ts-expect-error wrong type
      bcrypt.hash("password", {})
    }, "Should throw an Error. hash should be a string or number.")
  })

  it("hash_salt_validity", () => {
    assert.ok(bcrypt.hash("password", "$2a$10$somesaltyvaluertsetrse"))
    assert.throws(() => {
      bcrypt.hash("password", "some$value")
    })
  })

  it("verify_salt", () => {
    const salt = bcrypt.genSalt(10)
    const split_salt = salt.split("$")
    assert.equal(split_salt[1], "2b")
    assert.equal(split_salt[2], "10")
  })

  it("verify_salt_min_rounds", () => {
    const salt = bcrypt.genSalt(1)
    const split_salt = salt.split("$")
    assert.equal(split_salt[1], "2b")
    assert.equal(split_salt[2], "04")
  })

  it("verify_salt_max_rounds", () => {
    const salt = bcrypt.genSalt(100)
    const split_salt = salt.split("$")
    assert.equal(split_salt[1], "2b")
    assert.equal(split_salt[2], "31")
  })

  it("hash_compare", () => {
    const salt = bcrypt.genSalt(10)
    assert.equal(29, salt.length, "Salt isn't the correct length.")
    const hash = bcrypt.hash("test", salt)
    assert.ok(bcrypt.compare("test", hash), "These hashes should be equal.")
    assert.ok(!bcrypt.compare("blah", hash), "These hashes should not be equal.")
  })

  it("hash_compare_empty_strings", () => {
    assert.ok(!bcrypt.compare("", "password"), "These hashes should not be equal.")
    assert.ok(!bcrypt.compare("", ""), "These hashes should not be equal.")
    assert.ok(!bcrypt.compare("password", ""), "These hashes should not be equal.")
  })

  it("hash_compare_invalid_strings", () => {
    const fullString = "envy1362987212538"
    const hash = "$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1BD7WC"
    const wut = ":"
    assert.ok(bcrypt.compare(fullString, hash))
    assert.ok(!bcrypt.compare(fullString, wut))
  })

  it("getRounds", () => {
    const hash = bcrypt.hash("test", bcrypt.genSalt(9))
    assert.equal(9, bcrypt.getRounds(hash), "getRounds can't extract rounds")
  })

  it("getRounds", () => {
    const hash = bcrypt.hash("test", bcrypt.genSalt(9))
    assert.equal(bcrypt.getRounds(hash), 9, "getRounds can't extract rounds")
    assert.throws(function () {
      bcrypt.getRounds("")
    }, "Must pass a valid hash to getRounds")
  })
})
