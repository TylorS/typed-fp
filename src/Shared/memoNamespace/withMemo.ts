import { Effect } from '@fp/Effect/Effect'
import { SchedulerEnv } from '@fp/Scheduler/exports'

import { SharedEnv, withCurrentNamespace } from '../core/exports'
import { memoNamespace } from './memoNamespace'

/**
 * Memoize an Effect with the current namespace.
 */
export const withMemo = <E extends SharedEnv, A>(
  effect: Effect<E, A>,
): Effect<E & SchedulerEnv, A> =>
  withCurrentNamespace(function* (namespace) {
    return yield* memoNamespace(namespace, effect)
  })
