import { And } from '@fp/common/exports'
import { U } from 'ts-toolbelt'

import { Effect, EnvOf, ReturnOf } from './Effect'
import { map } from './map'
import { zip } from './zip'

/**
 * Convert an Object of Effects into an Effect of an Object.
 * @example
 * const foo: Pure<{a: number, b:number, c: number }> = zipObj({
 *   a: Pure.of(1),
 *   b: Pure.of(2),
 *   c: Pure.of(3)
 * })
 */
export function zipObj<A extends Readonly<Record<PropertyKey, Effect<any, any>>>>(
  effects: A,
): ZipObjEffect<A> {
  const keys = Reflect.ownKeys(effects)
  const effs = keys.map((key) => map((a) => [key, a] as const, Reflect.get(effects, key)))
  const eff = zip(effs)

  return map(Object.fromEntries, eff)
}

export type ZipObjEffect<A extends Readonly<Record<PropertyKey, Effect<any, any>>>> = Effect<
  ZipObjEnvOf<A>,
  ZipObjReturnOf<A>
>

export type ZipObjEnvOf<A extends Readonly<Record<PropertyKey, Effect<any, any>>>> = And<
  U.ListOf<
    {
      readonly [K in keyof A]: EnvOf<A[K]>
    }[keyof A]
  >
>

export type ZipObjReturnOf<A extends Readonly<Record<PropertyKey, Effect<any, any>>>> = {
  readonly [K in keyof A]: ReturnOf<A[K]>
}
