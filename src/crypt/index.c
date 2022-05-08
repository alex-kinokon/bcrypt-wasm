#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
#include "emscripten.h"
#include "blowfish.c"
#include "bcrypt.c"

bool validate_salt(const char* salt) {
    if (!salt || *salt != '$') {
        return false;
    }

    // discard $
    salt++;

    if (*salt > BCRYPT_VERSION) {
        return false;
    }

    if (salt[1] != '$') {
        switch (salt[1]) {
        case 'a':
        case 'b':
            salt++;
            break;
        default:
            return false;
        }
    }

    // discard version + $
    salt += 2;

    if (salt[2] != '$') {
        return false;
    }

    int n = atoi(salt);
    if (n > 31 || n < 0) {
        return false;
    }

    if (((uint8_t)1 << (uint8_t)n) < BCRYPT_MINROUNDS) {
        return false;
    }

    salt += 3;
    if (strlen(salt) * 3 / 4 < BCRYPT_MAXSALT) {
        return false;
    }

    return true;
}

/* SALT GENERATION */
EMSCRIPTEN_KEEPALIVE
char* gen_salt(const char* minor, u_int8_t log_rounds, u_int8_t *seed) {
    char* salt = calloc(_SALT_LEN + 1, sizeof(char));
    bcrypt_gensalt(minor[0], log_rounds, seed, salt);
    return salt;
}

// Napi::Value gen_salt_sync(const Napi::CallbackInfo& info) {
//     Napi::Env env = info.Env();
//     if (info.Length() < 3) {
//         throw Napi::TypeError::New(env, "3 arguments expected");
//     }
//     if (!info[0].IsString()) {
//         throw Napi::TypeError::New(env, "First argument must be a string");
//     }
//     if (!info[2].IsBuffer() || (info[2].As<Napi::Buffer<char>>()).Length() != 16) {
//         throw Napi::TypeError::New(env, "Third argument must be a 16 byte Buffer");
//     }
//     const char minor_ver = ToCharVersion(info[0].As<Napi::String>());
//     const int32_t rounds = info[1].As<Napi::Number>();
//     Napi::Buffer<u_int8_t> buffer = info[2].As<Napi::Buffer<u_int8_t>>();
//     u_int8_t* seed = (u_int8_t*) buffer.Data();
//     char salt[_SALT_LEN];
//     bcrypt_gensalt(minor_ver, rounds, seed, salt);
//     return Napi::String::New(env, salt, strlen(salt));
// }

EMSCRIPTEN_KEEPALIVE
char* encrypt(const char* data, int data_length, const char* salt) {
    if (!(validate_salt(salt))) {
        return "INVALID_SALT";
    }

    char* bcrypted = calloc(_PASSWORD_LEN + 1, sizeof(char));
    bcrypt(data, data_length, salt, bcrypted);
    return bcrypted;
}

// Napi::Value encrypt_sync(const Napi::CallbackInfo& info) {
//     Napi::Env env = info.Env();
//     if (info.Length() < 2) {
//         throw Napi::TypeError::New(info.Env(), "2 arguments expected");
//     }
//     std::string data = info[0].IsBuffer()
//         ? BufferToString(info[0].As<Napi::Buffer<char>>())
//         : info[0].As<Napi::String>();
//     std::string salt = info[1].As<Napi::String>();
//     if (!(Validate_salt(salt.c_str()))) {
//         throw Napi::Error::New(env, "Invalid salt. Salt must be in the form of: $Vers$log2(NumRounds)$saltvalue");
//     }
//     char bcrypted[_PASSWORD_LEN];
//     bcrypt(data.c_str(), data.length(), salt.c_str(), bcrypted);
//     return Napi::String::New(env, bcrypted, strlen(bcrypted));
// }

EMSCRIPTEN_KEEPALIVE
bool compare(const char* pw, int pw_length, const char* hash) {
    char* bcrypted = calloc(_PASSWORD_LEN + 1, sizeof(char));
    if (validate_salt(hash)) {
        bcrypt(pw, pw_length, hash, bcrypted);
        return strcmp(bcrypted, hash) == 0;
    } else {
        return false;
    }
}

// Napi::Value compare_sync(const Napi::CallbackInfo& info) {
//     Napi::Env env = info.Env();
//     if (info.Length() < 2) {
//         throw Napi::TypeError::New(info.Env(), "2 arguments expected");
//     }
//     std::string pw = info[0].IsBuffer()
//         ? BufferToString(info[0].As<Napi::Buffer<char>>())
//         : info[0].As<Napi::String>();
//     std::string hash = info[1].As<Napi::String>();
//     char bcrypted[_PASSWORD_LEN];
//     if (Validate_salt(hash.c_str())) {
//         bcrypt(pw.c_str(), pw.length(), hash.c_str(), bcrypted);
//         return Napi::Boolean::New(env, compare_strings(bcrypted, hash.c_str()));
//     } else {
//         return Napi::Boolean::New(env, false);
//     }
// }

EMSCRIPTEN_KEEPALIVE
u_int32_t get_rounds(const char* hash) {
    return bcrypt_get_rounds(hash);
}

// Napi::Value get_rounds(const Napi::CallbackInfo& info) {
//     Napi::Env env = info.Env();
//     if (info.Length() < 1) {
//         throw Napi::TypeError::New(env, "1 argument expected");
//     }
//     std::string hash =  info[0].As<Napi::String>();
//     u_int32_t rounds;
//     if (!(rounds = bcrypt_get_rounds(hash.c_str()))) {
//         throw Napi::Error::New(env, "invalid hash provided");
//     }
//     return Napi::Number::New(env, rounds);
// }
