import { Arity1 } from '@fp/common/exports'
import { disposeBoth, disposeNone } from '@fp/Disposable/exports'
import { curry } from '@fp/lambda/exports'
import { isNone, none, Option, some } from 'fp-ts/Option'

import { Async, async } from './Async'
import { Resume } from './Resume'
import { run } from './run'
import { Sync, sync } from './Sync'

/**
 * Apply the function to a value contained within Resume's.
 */
export const ap = curry(
  <A, B>(fn: Resume<Arity1<A, B>>, value: Resume<A>): Resume<B> => {
    if (!fn.async && !value.async) {
      return sync(fn.value(value.value))
    }

    return async((cb) => {
      let f: Option<Arity1<A, B>> = none
      let v: Option<A> = none

      const onValue = () => {
        if (isNone(f) || isNone(v)) {
          return disposeNone()
        }

        return cb(f.value(v.value))
      }

      return disposeBoth(
        run(fn, (ab) => {
          f = some(ab)

          return onValue()
        }),
        run(value, (a) => {
          v = some(a)

          return onValue()
        }),
      )
    })
  },
) as {
  <A, B>(fn: Sync<Arity1<A, B>>, value: Sync<A>): Sync<B>
  <A, B>(fn: Async<Arity1<A, B>>, value: Async<A>): Async<B>
  <A, B>(fn: Resume<Arity1<A, B>>, value: Resume<A>): Resume<B>

  <A, B>(fn: Sync<Arity1<A, B>>): {
    (value: Sync<A>): Sync<B>
    (value: Resume<A>): Resume<B>
  }

  <A, B>(fn: Async<Arity1<A, B>>): {
    (value: Async<A>): Async<B>
    (value: Resume<A>): Resume<B>
  }

  <A, B>(fn: Resume<Arity1<A, B>>): (value: Resume<A>) => Resume<B>
}
