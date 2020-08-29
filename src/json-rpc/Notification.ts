import { JsonArray, JsonRecord } from 'fp-ts/es6/Either'
import { pipe } from 'fp-ts/es6/function'

import { makeTyped, TypedSchema } from '../io'

export function Notification<
  A extends { readonly method: string; readonly params?: JsonRecord | JsonArray }
>(
  schema: TypedSchema<A>,
): TypedSchema<
  {
    readonly jsonrpc: '2.0'
  } & A
> {
  return makeTyped((t) =>
    pipe(
      schema(t),
      t.intersect(
        t.type({
          jsonrpc: t.literal('2.0'),
        }),
      ),
    ),
  )
}
