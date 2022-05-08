import { describe, it } from "mocha"
import { strict as assert } from "assert"
import * as bcrypt from "../lib/index"

// some tests were adapted from https://github.com/riverrun/bcrypt_elixir/blob/master/test/base_test.exs
// which are under the BSD LICENSE
describe("implementation", () => {
  it("openwall_bcrypt_tests", () => {
    assert.equal(
      bcrypt.hash("U*U", "$2a$05$CCCCCCCCCCCCCCCCCCCCC."),
      "$2a$05$CCCCCCCCCCCCCCCCCCCCC.E5YPO9kmyuRGyh0XouQYb4YMJKvyOeW"
    )
    assert.equal(
      bcrypt.hash("U*U*", "$2a$05$CCCCCCCCCCCCCCCCCCCCC."),
      "$2a$05$CCCCCCCCCCCCCCCCCCCCC.VGOzA784oUp/Z0DY336zx7pLYAy0lwK"
    )
    assert.equal(
      bcrypt.hash("U*U*U", "$2a$05$XXXXXXXXXXXXXXXXXXXXXO"),
      "$2a$05$XXXXXXXXXXXXXXXXXXXXXOAcXxm9kjPGEMsLznoKqmqw7tc8WCx4a"
    )
    assert.equal(
      bcrypt.hash("", "$2a$05$CCCCCCCCCCCCCCCCCCCCC."),
      "$2a$05$CCCCCCCCCCCCCCCCCCCCC.7uG0VCzI2bS7j6ymqJi9CdcdxiRTWNy"
    )
    assert.equal(
      bcrypt.hash(
        "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        "$2a$05$abcdefghijklmnopqrstuu"
      ),
      "$2a$05$abcdefghijklmnopqrstuu5s2v8.iXieOjg/.AySBTTZIIVFJeBui"
    )
  })

  it("openbsd_bcrypt_tests", () => {
    assert.equal(
      bcrypt.hash(
        "000000000000000000000000000000000000000000000000000000000000000000000000",
        "$2a$05$CCCCCCCCCCCCCCCCCCCCC."
      ),
      "$2a$05$CCCCCCCCCCCCCCCCCCCCC.6.O1dLNbjod2uo0DVcW.jHucKbPDdHS"
    )
    assert.equal(
      bcrypt.hash(
        "000000000000000000000000000000000000000000000000000000000000000000000000",
        "$2b$05$CCCCCCCCCCCCCCCCCCCCC."
      ),
      "$2b$05$CCCCCCCCCCCCCCCCCCCCC.6.O1dLNbjod2uo0DVcW.jHucKbPDdHS"
    )
  })

  it("test_long_passwords", () => {
    // bcrypt wrap-around bug in $2a$
    assert.equal(
      bcrypt.hash(
        "012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234",
        "$2a$05$CCCCCCCCCCCCCCCCCCCCC."
      ),
      "$2a$05$CCCCCCCCCCCCCCCCCCCCC.6.O1dLNbjod2uo0DVcW.jHucKbPDdHS"
    )
    assert.equal(
      bcrypt.hash(
        "01XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        "$2a$05$CCCCCCCCCCCCCCCCCCCCC."
      ),
      "$2a$05$CCCCCCCCCCCCCCCCCCCCC.6.O1dLNbjod2uo0DVcW.jHucKbPDdHS"
    )

    // tests for $2b$ which fixes wrap-around bugs
    assert.equal(
      bcrypt.hash(
        "012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234",
        "$2b$05$CCCCCCCCCCCCCCCCCCCCC."
      ),
      "$2b$05$CCCCCCCCCCCCCCCCCCCCC.XxrQqgBi/5Sxuq9soXzDtjIZ7w5pMfK"
    )
    assert.equal(
      bcrypt.hash(
        "0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345",
        "$2b$05$CCCCCCCCCCCCCCCCCCCCC."
      ),
      "$2b$05$CCCCCCCCCCCCCCCCCCCCC.XxrQqgBi/5Sxuq9soXzDtjIZ7w5pMfK"
    )
  })

  it("test_embedded_nulls", () => {
    assert.equal(
      bcrypt.hash("Passw\0rd123", "$2b$05$CCCCCCCCCCCCCCCCCCCCC."),
      "$2b$05$CCCCCCCCCCCCCCCCCCCCC.VHy/kzL4sCcX3Ib3wN5rNGiRt.TpfxS"
    )
    assert.equal(
      bcrypt.hash(
        "Passw\0 you can literally write anything after the NUL character",
        "$2b$05$CCCCCCCCCCCCCCCCCCCCC."
      ),
      "$2b$05$CCCCCCCCCCCCCCCCCCCCC.4vJLJQ6nZ/70INTjjSZWQ0iyUek92tu"
    )
  })

  it("test_shorten_salt_to_128_bits", () => {
    assert.equal(
      bcrypt.hash("test", "$2a$10$1234567899123456789012"),
      "$2a$10$123456789912345678901u.OtL1A1eGK5wmvBKUDYKvuVKI7h2XBu"
    )
    assert.equal(
      bcrypt.hash("U*U*", "$2a$05$CCCCCCCCCCCCCCCCCCCCCh"),
      "$2a$05$CCCCCCCCCCCCCCCCCCCCCeUQ7VjYZ2hd4bLYZdhuPpZMUpEUJDw1S"
    )
    assert.equal(
      bcrypt.hash("U*U*", "$2a$05$CCCCCCCCCCCCCCCCCCCCCM"),
      "$2a$05$CCCCCCCCCCCCCCCCCCCCC.VGOzA784oUp/Z0DY336zx7pLYAy0lwK"
    )
    assert.equal(
      bcrypt.hash("U*U*", "$2a$05$CCCCCCCCCCCCCCCCCCCCCA"),
      "$2a$05$CCCCCCCCCCCCCCCCCCCCC.VGOzA784oUp/Z0DY336zx7pLYAy0lwK"
    )
  })

  it("consistency", () => {
    assert.equal(
      bcrypt.hash("ππππππππ", "$2a$10$.TtQJ4Jr6isd4Hp.mVfZeu"),
      "$2a$10$.TtQJ4Jr6isd4Hp.mVfZeuh6Gws4rOQ/vdBczhDx.19NFK0Y84Dle"
    )
    assert.equal(
      bcrypt.hash("p@5sw0rd", "$2b$12$zQ4CooEXdGqcwi0PHsgc8e"),
      "$2b$12$zQ4CooEXdGqcwi0PHsgc8eAf0DLXE/XHoBE8kCSGQ97rXwuClaPam"
    )
    assert.equal(
      bcrypt.hash("C'est bon, la vie!", "$2b$12$cbo7LZ.wxgW4yxAA5Vqlv."),
      "$2b$12$cbo7LZ.wxgW4yxAA5Vqlv.KR6QFPt4qCdc9RYJNXxa/rbUOp.1sw."
    )
    assert.equal(
      bcrypt.hash("ἓν οἶδα ὅτι οὐδὲν οἶδα", "$2b$12$LeHKWR2bmrazi/6P22Jpau"),
      "$2b$12$LeHKWR2bmrazi/6P22JpauX5my/eKwwKpWqL7L5iEByBnxNc76FRW"
    )
  })
})
