import { fromJson, JsonSerializable, toJson } from '@fp/logic/exports'
import { pipe } from 'fp-ts/function'
import { Codec, make } from 'io-ts/Codec'
import { Decoder, map, string } from 'io-ts/Decoder'
import { Encoder } from 'io-ts/Encoder'

/**
 * Encode JsonSerializable values into a JSON-string
 */
export const JsonEncoder: Encoder<string, JsonSerializable> = {
  encode: toJson,
}

/**
 * Decode an encoded JsonSerializable value.
 */
export const JsonDecoder: Decoder<string, JsonSerializable> = pipe(string, map(fromJson))

/**
 * A codec between JSON-strings and JsonSerializable values.
 */
export const JsonCodec: Codec<string, string, JsonSerializable> = make(JsonDecoder, JsonEncoder)
