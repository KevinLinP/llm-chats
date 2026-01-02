import type { EncryptedColumn } from "./repositories/helpers/types";

export const testJwk: JsonWebKey = {
  "alg": "A256GCM",
  "ext": true,
  "k": "kISGaHbZ04MPu8Gf8eFDiJVPTwhwb9Rxp-MQlpr7_mg",
  "key_ops": [
    "encrypt",
    "decrypt"
  ],
  "kty": "oct"
};

export const encrypted: EncryptedColumn = [
  new Uint8Array([ 251, 240,  80, 253, 158, 121,  64, 170, 61, 103, 107, 108 ]),
  new Uint8Array([ 82, 149, 90, 141, 213, 184, 3,   5, 90, 165, 185, 101, 45, 230, 46, 154, 114 ])
];

export const encrypted2: EncryptedColumn = [
  new Uint8Array([ 68, 178,  98,  31, 183, 3, 105, 126, 207,  64, 128,  54 ]),
  new Uint8Array([ 158, 183, 250, 159, 132, 254, 171, 194, 37, 151, 141, 221,  18, 132, 198, 187, 241,  10,  41, 191,  35, 197,  47,  74, 119,   8, 131, 181, 214, 125, 184, 190, 218, 178 ])
];


