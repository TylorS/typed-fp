import { Pure } from '@typed/fp/Effect'
import { UuidEnv, UuidSeed } from '../common'
import { VALID_UUID_LENGTH } from './constants'

export function createBrowserUuidEnv(): UuidEnv {
  return {
    randomUuidSeed: () =>
      Pure.of(
        (Array.from(
          crypto.getRandomValues(new Uint8Array(VALID_UUID_LENGTH)),
        ) as unknown) as UuidSeed,
      ),
  }
}
