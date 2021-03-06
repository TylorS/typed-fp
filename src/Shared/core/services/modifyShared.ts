import { Arity1 } from '@fp/common/types'
import { chain, Effect, map } from '@fp/Effect/exports'
import { curry } from '@fp/lambda/exports'
import { GetSharedEnv, GetSharedValue, Shared } from '@fp/Shared/core/model/Shared'
import { pipe } from 'fp-ts/function'

import { getShared } from './getShared'
import { setShared } from './setShared'
import { SharedEnv } from './SharedEnv'

/**
 * Update the current Shared value.
 */
export const modifyShared = curry(
  <S extends Shared>(
    shared: S,
    f: Arity1<GetSharedValue<S>, GetSharedValue<S>>,
  ): Effect<SharedEnv & GetSharedEnv<S>, GetSharedValue<S>> =>
    pipe(shared, getShared, map(f), chain(setShared(shared))),
) as {
  <S extends Shared>(shared: S, f: Arity1<GetSharedValue<S>, GetSharedValue<S>>): Effect<
    SharedEnv & GetSharedEnv<S>,
    GetSharedValue<S>
  >
  <S extends Shared>(shared: S): (
    f: Arity1<GetSharedValue<S>, GetSharedValue<S>>,
  ) => Effect<SharedEnv & GetSharedEnv<S>, GetSharedValue<S>>
}
