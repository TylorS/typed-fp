import { describe, it } from '@typed/test'
import { pipe } from 'fp-ts/pipeable'

import { ask } from './ask'
import { doEffect } from './doEffect'
import { catchError, fail } from './failures'
import { execEffect, execPure } from './runEffect'

export const test = describe(`failures`, [
  describe(`fail`, [
    it(`allows failing`, ({ equal }, done) => {
      const key = 'test'
      const error = 'fail'

      const sut = doEffect(function* () {
        yield* fail(key, error)
      })

      pipe(
        sut,
        catchError(key, (e: string) => {
          try {
            equal(e, error)
            done()
          } catch (error) {
            done(error)
          }
        }),
        execPure,
      )
    }),
  ]),

  describe(`catchError`, [
    it(`allows handling errors`, ({ equal }, done) => {
      const key = 'test'
      const error = 'fail'
      const expected = 10

      const child = doEffect(function* () {
        const { value } = yield* ask<{ value: number }>()
        yield* fail(key, error)

        return value
      })

      const parent = doEffect(function* () {
        const n = yield* catchError(key, () => expected, child)

        try {
          equal(expected, n)
          done()
        } catch (error) {
          done(error)
        }
      })

      pipe(parent, execEffect({ value: 5 }))
    }),
  ]),
])
