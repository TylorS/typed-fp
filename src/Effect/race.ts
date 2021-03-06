import { Disposable, disposeBoth, disposeNone, lazy } from '@fp/Disposable/exports'
import { curry } from '@fp/lambda/exports'
import { async, run } from '@fp/Resume/exports'

import { Effect, fromEnv } from './Effect'
import { toEnv } from './toEnv'

/**
 * Race two Effects together.
 */
export const race = curry(
  <E1, A, E2, B>(a: Effect<E1, A>, b: Effect<E2, B>): Effect<E1 & E2, A | B> =>
    fromEnv((e) => {
      const aResume = toEnv(a)(e)
      const bResume = toEnv(b)(e)

      if (!aResume.async) {
        return aResume
      }

      if (!bResume.async) {
        return bResume
      }

      return async((resume) => {
        const disposable = lazy()

        function cb(value: A | B, dispose: () => void): Disposable {
          if (disposable.disposed) {
            return disposeNone()
          }

          dispose()

          return resume(value)
        }

        const bDisposableLazy = lazy()

        const aDisposable = run(aResume, (a) => cb(a, () => bDisposableLazy.dispose()))

        bDisposableLazy.addDisposable(run(bResume, (b) => cb(b, () => aDisposable.dispose())))

        disposable.addDisposable(disposeBoth(aDisposable, bDisposableLazy))

        return disposable
      })
    }),
) as {
  <E1, A, E2, B>(a: Effect<E1, A>, b: Effect<E2, B>): Effect<E1 & E2, A | B>
  <E1, A>(a: Effect<E1, A>): <E2, B>(b: Effect<E2, B>) => Effect<E1 & E2, A | B>
}
