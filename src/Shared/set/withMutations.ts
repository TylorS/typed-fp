import { Effect } from '@fp/Effect/exports'
import { curry } from '@fp/lambda/exports'

import { setShared, SharedEnv, SharedKey, withShared } from '../core/exports'
import { SharedSet } from './SharedSet'

/**
 * Expose a mutable access to a SharedSet.
 */
export const withMutations = curry(
  <K extends SharedKey, V>(
    shared: SharedSet<K, V>,
    f: (set: Set<V>) => void,
  ): Effect<SharedEnv, ReadonlySet<V>> => {
    return withShared(shared, function* (set) {
      const mutable = new Set(set)

      f(mutable)

      if (!shared.eq.equals(set, mutable)) {
        return yield* setShared(shared, mutable)
      }

      return set
    })
  },
) as {
  <K extends SharedKey, V>(shared: SharedSet<K, V>, f: (set: Set<V>) => void): Effect<
    SharedEnv,
    ReadonlySet<V>
  >
  <K extends SharedKey, V>(shared: SharedSet<K, V>): (
    f: (set: Set<V>) => void,
  ) => Effect<SharedEnv, ReadonlySet<V>>
}
