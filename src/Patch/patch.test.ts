import { doEffect, execPure } from '@fp/Effect/exports'
import { sync } from '@fp/Resume/Sync'
import { provideSchedulerEnv } from '@fp/Scheduler/exports'
import {
  Namespace,
  runWithNamespace,
  sendSharedEvent,
  usingNamespace,
} from '@fp/Shared/core/exports'
import {
  createSharedEnvProvider,
  defaultHandlers,
} from '@fp/Shared/createSharedEnvProvider/exports'
import { describe, it } from '@typed/test'
import { pipe } from 'fp-ts/function'

import { isUndefined } from '../logic/exports'
import { createRenderHandlers } from './handlers/exports'
import { Patch } from './Patch'
import { getRenderRef } from './RenderRef'

export const test = describe(`Patching`, [
  it(`patches namespace given a RenderRef`, ({ equal }, done) => {
    const namespaceB = Namespace.wrap('b')
    const value = 1

    const component = doEffect(function* () {
      const ref = yield* getRenderRef<number>()

      if (isUndefined(ref.current) || isUndefined(ref.current)) {
        ref.current = value
      }

      return value
    })

    const test = doEffect(function* () {
      try {
        equal(value, yield* runWithNamespace(namespaceB, component))

        const updated = yield* pipe(getRenderRef(), usingNamespace(namespaceB))

        equal(value, updated.current)

        yield* sendSharedEvent({ type: 'namespace/updated', namespace: namespaceB })

        equal(value * 2, updated.current)

        yield* sendSharedEvent({ type: 'namespace/updated', namespace: namespaceB })

        equal(value * 3, updated.current)

        done()
      } catch (error) {
        done(error)
      }
    })

    const patch: Patch<number, number> = {
      patch: (x, y) => sync(x + y),
    }

    pipe(
      test,
      createSharedEnvProvider({
        namespace: Namespace.wrap('a'),
        handlers: [...defaultHandlers, ...createRenderHandlers(patch)],
      }),
      provideSchedulerEnv,
      execPure,
    )
  }),
])
