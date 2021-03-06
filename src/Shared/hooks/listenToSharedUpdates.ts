import { Disposable } from '@fp/Disposable/exports'
import { doEffect, Effect } from '@fp/Effect/exports'
import { createGuard } from '@fp/io/exports'
import { SchedulerEnv } from '@fp/Scheduler/exports'
import { pipe } from 'fp-ts/function'
import { refine } from 'io-ts/Guard'

import { getCurrentNamespace, Shared, SharedEnv, SharedValueUpdated } from '../core/exports'
import { listenToSharedEvent } from './listenToSharedEvent'
import { useMemo } from './useMemo'

const sharedValueUpdatedGuard = createGuard(SharedValueUpdated.schema)

/**
 * Listen to the Updates of a Shared Value in the current Namespace
 */
export function listenToSharedUpdates<S extends Shared>(
  shared: S,
  onUpdate: (update: SharedValueUpdated & { readonly shared: S }) => void,
): Effect<SharedEnv & SchedulerEnv, Disposable> {
  const eff = doEffect(function* () {
    const namespace = yield* getCurrentNamespace
    const guard = yield* useMemo(
      () =>
        pipe(
          sharedValueUpdatedGuard,
          refine(
            (n): n is SharedValueUpdated & { readonly shared: S } =>
              n.namespace === namespace && n.shared === shared,
          ),
        ),
      [namespace, shared.key],
    )

    return yield* listenToSharedEvent(guard, onUpdate)
  })

  return eff
}
