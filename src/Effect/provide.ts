import { And } from '@fp/common/And'
import { curry } from '@fp/lambda/exports'
import { Cast } from 'Any/Cast'

import { Effect, fromEnv, Pure } from './Effect'
import { toEnv } from './toEnv'

/**
 * A type representing functions which provide (or add) requirements
 * to an Effect's environment.
 */
export type Provider<Provided, Additional = unknown> = <E, A>(
  effect: Effect<E & Provided, A>,
) => Effect<E & Additional, A>

/**
 * Provide part of the environemnt, enforcing its usage.
 */
export const useSome = curry(
  <E1, E2, A>(e1: E1, fx: Effect<E1 & E2, A>): Effect<E2, A> =>
    fromEnv((e2: E2) => toEnv(fx)({ ...e2, ...e1 })),
) as {
  <E1, A>(e1: E1, fx: Effect<E1, A>): Pure<A>
  <E1, E2, A>(e1: E1, fx: Effect<E1 & E2, A>): Effect<E2, A>
  <E1>(e1: E1): Provider<E1>
}

/**
 * Provide part of the environemnt, allowing for replacement later on.
 */
export const provideSome = curry(
  <E1, E2, A>(e1: E1, fx: Effect<E1 & E2, A>): Effect<E2, A> =>
    fromEnv((e2: E2) => toEnv(fx)({ ...e1, ...e2 })),
) as {
  <E1, A>(e1: E1, fx: Effect<E1, A>): Pure<A>
  <E1, E2, A>(e1: E1, fx: Effect<E1 & E2, A>): Effect<E2, A>
  <E1>(e1: E1): Provider<E1>
}

/**
 * Provide part of the environemnt, enforcing its usage.
 */
export const useAll = curry(<E, A>(e1: E, fx: Effect<E, A>) =>
  fromEnv((e2) => toEnv(fx)({ ...(e2 as object), ...e1 })),
) as {
  <E, A>(e1: E, fx: Effect<E, A>): Pure<A>
  <E>(e1: E): <A>(fx: Effect<E, A>) => Pure<A>
}

/**
 * Provide part of the environemnt, allowing for replacement later on.
 */
export const provideAll = curry(
  <E, A>(e: E, fx: Effect<E, A>): Pure<A> =>
    fromEnv((u: unknown) => toEnv(fx)({ ...e, ...(u as object) })),
) as {
  <E, A>(e: E, fx: Effect<E, A>): Pure<A>
  <E>(e: E): <A>(fx: Effect<E, A>) => Pure<A>
}

export type ProvidedEnvs<Providers extends ReadonlyArray<Provider<any, any>>> = And<
  {
    [K in keyof Providers]: Providers[K] extends Provider<infer R, any> ? R : unknown
  }
>

export type ProvidedAdditional<Providers extends ReadonlyArray<Provider<any, any>>, Envs> = And<
  Cast<
    {
      [K in keyof Providers as K extends keyof Envs
        ? Providers[K] extends Envs[K]
          ? never
          : K
        : K]: Providers[K] extends Provider<any, infer R> ? R : unknown
    },
    readonly any[]
  >
>

/**
 * A helper fro composing many Provider functions together to create a singular Provider function.
 */
export const provideMany = <
  Providers extends readonly [Provider<any, any>, ...ReadonlyArray<Provider<any, any>>]
>(
  ...[first, ...rest]: Providers
): Provider<ProvidedEnvs<Providers>, ProvidedAdditional<Providers, ProvidedEnvs<Providers>>> => <
  E,
  A
>(
  effect: Effect<E & ProvidedEnvs<Providers>, A>,
) => rest.reduce((fx, provider) => provider(fx), first(effect))
