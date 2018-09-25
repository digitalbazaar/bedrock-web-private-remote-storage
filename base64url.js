/*!
 * Copyright (c) 2018 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const _alphabet =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const _alphabetIdx = [
  62, -1, -1,
  52, 53, 54, 55, 56, 57, 58, 59, 60, 61,
  -1, -1, -1, 64, -1, -1, -1,
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
  13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
  -1, -1, -1, -1, 63, -1,
  26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38,
  39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51
];

export const base64url = {};

/**
 * Encodes input according to the "Base64url Encoding" format as specified
 * in JSON Web Signature (JWS) RFC7517. A URL safe character set is used and
 * trailing '=', line breaks, whitespace, and other characters are omitted.
 *
 * @param input the data to encode.
 *
 * @return the encoded value.
 */
base64url.encode = input => {
  let line = '';
  let output = '';
  let chr1, chr2, chr3;
  let i = 0;
  while(i < input.byteLength) {
    chr1 = input[i++];
    chr2 = input[i++];
    chr3 = input[i++];

    // encode 4 character group
    line += _alphabet.charAt(chr1 >> 2);
    line += _alphabet.charAt(((chr1 & 3) << 4) | (chr2 >> 4));
    if(!isNaN(chr2)) {
      line += _alphabet.charAt(((chr2 & 15) << 2) | (chr3 >> 6));
      if(!isNaN(chr3)) {
        line += _alphabet.charAt(chr3 & 63);
      }
    }
  }
  output += line;
  return output;
};

/**
 * Decodes input according to the "Base64url Encoding" format as specified
 * in JSON Web Signature (JWS) RFC7517. A URL safe character set is used and
 * trailing '=', line breaks, whitespace, and other characters are omitted.
 *
 * @param input the data to decode.
 *
 * @return the decoded value.
 */
base64url.decode = input => {
  let length = input.length;
  const mod4 = length % 4;
  if(mod4 === 1) {
    throw new Error('Illegal base64 string.');
  }
  let diff = 0;
  if(mod4 > 0) {
    diff = 4 - mod4;
    length += diff;
  }

  const output = new Uint8Array(length / 4 * 3 - diff);

  let enc1, enc2, enc3, enc4;
  let i = 0, j = 0;

  while(i < length) {
    enc1 = _alphabetIdx[input.charCodeAt(i++) - 45];
    enc2 = _alphabetIdx[input.charCodeAt(i++) - 45];

    output[j++] = (enc1 << 2) | (enc2 >> 4);
    if(i < input.length) {
      // can decode at least 2 bytes
      enc3 = _alphabetIdx[input.charCodeAt(i++) - 45];
      output[j++] = ((enc2 & 15) << 4) | (enc3 >> 2);
      if(i < input.length) {
        // can decode 3 bytes
        enc4 = _alphabetIdx[input.charCodeAt(i++) - 45];
        output[j++] = ((enc3 & 3) << 6) | enc4;
      }
    }
  }

  return output;
};