import { doEffect } from '@fp/Effect/doEffect'
import { Effect } from '@fp/Effect/Effect'
import { curry } from '@fp/lambda/exports'

import { SharedEnv, SharedKey } from '../core/exports'
import { SharedSet } from './SharedSet'
import { withMutations } from './withMutations'

/**
 * Delete a value from a SharedSet
 */
export const deleteValue = curry(
  <K extends SharedKey, V>(shared: SharedSet<K, V>, value: V): Effect<SharedEnv, boolean> => {
    const eff = doEffect(function* () {
      let deleted = false

      yield* withMutations(shared, (set) => (deleted = set.delete(value)))

      return deleted
    })

    return eff
  },
) as {
  <K extends SharedKey, V>(shared: SharedSet<K, V>, value: V): Effect<SharedEnv, boolean>
  <K extends SharedKey, V>(shared: SharedSet<K, V>): (value: V) => Effect<SharedEnv, boolean>
}
