import { doEffect, execPure, provideAll } from '@fp/Effect/exports'
import { describe, given, it } from '@typed/test'
import { pipe } from 'fp-ts/function'

import {
  deleteShared,
  fromKey,
  Namespace,
  provideSharedEnv,
  runWithNamespace,
  setShared,
  usingNamespace,
} from '../exports'
import { useContext } from './useContext'

export const test = describe(`useContext`, [
  given(`a Shared value`, [
    it(`allows retrieving values from closest ancestor`, ({ equal }, done) => {
      const shared = fromKey<{ name: string }>()('test')
      const grandChildNamespace = Namespace.wrap('grandchild')
      const childNamespace = Namespace.wrap('child')
      const childValue = { name: 'child' }
      const parentNamespace = Namespace.wrap('parent')
      const parentValue = { name: 'parent' }

      const grandchild = (expected: { name: string }) =>
        doEffect(function* () {
          const value = yield* useContext(shared)

          equal(expected, value)
        })

      const child = doEffect(function* () {
        yield* setShared(shared, childValue)
        yield* runWithNamespace(grandChildNamespace, grandchild(childValue))
      })

      const parent = doEffect(function* () {
        yield* setShared(shared, parentValue)

        yield* runWithNamespace(childNamespace, child)
      })

      const test = doEffect(function* () {
        try {
          yield* runWithNamespace(parentNamespace, parent)
          yield* pipe(deleteShared(shared), usingNamespace(childNamespace))
          yield* pipe(grandchild(parentValue), usingNamespace(grandChildNamespace))

          done()
        } catch (error) {
          done(error)
        }
      })

      pipe(
        test,
        provideSharedEnv,
        provideAll({
          test: { name: 'initial' },
        }),
        execPure,
      )
    }),
  ]),
])
