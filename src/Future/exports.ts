import {
  doEffect,
  Effect,
  effect,
  effectSeq,
  fail,
  FailEnv,
  fromReaderTask,
  Pure,
  toReaderTask,
  URI as EffectURI,
} from '@fp/Effect/exports'
import { Alt3 } from 'fp-ts/Alt'
import { Either, left as leftE, right as rightE } from 'fp-ts/Either'
import { EitherM2, getEitherM } from 'fp-ts/EitherT'
import { Monad3 } from 'fp-ts/Monad'
import { pipeable } from 'fp-ts/pipeable'
import { ReaderTaskEither } from 'fp-ts/ReaderTaskEither'
import { isLeft } from 'fp-ts/These'

export const URI = '@fp/Future/exports'
export type URI = typeof URI

export type Future<E, A, B> = Effect<E, Either<A, B>>

declare module 'fp-ts/HKT' {
  export interface URItoKind3<R, E, A> {
    [URI]: Future<R, E, A>
  }
}

/**
 * A Monad, Alt and Either transformer instance of Effect with parallel Applicative.
 */
export const future: Monad3<URI> & Alt3<URI> & EitherM2<EffectURI> = { ...getEitherM(effect), URI }

/**
 * A Monad, Alt and Either transformer instance of Effect with sequential Applicative.
 */
export const futureSeq: Monad3<URI> & Alt3<URI> & EitherM2<EffectURI> = {
  ...getEitherM(effectSeq),
  URI,
}

/**
 * Create a Left Effect
 */
export const left = <A, B>(value: A): Future<unknown, A, B> => Pure.of(leftE<A, B>(value))

/**
 * Create a Right Effect
 */
export const right = <A, B>(value: B): Future<unknown, A, B> => Pure.of(rightE<A, B>(value))

export const {
  alt,
  ap,
  apFirst,
  apSecond,
  chain,
  chainFirst,
  map,
  bimap,
  mapLeft,
  flatten,
} = pipeable(future)

/**
 * Convert an Either into a type-safe Effect failure.
 */
export const orFail = <K extends PropertyKey, E, A, B>(
  key: K,
  future: Future<E, A, B>,
): Effect<E & FailEnv<K, A>, B> => {
  const eff = doEffect(function* () {
    const either = yield* future

    if (isLeft(either)) {
      return yield* fail(key, either.left)
    }

    return either.right
  })

  return eff
}

/**
 * Convert a ReaderTaskEither into a Future
 */
export function fromReaderTaskEither<E, A, B>(rte: ReaderTaskEither<E, A, B>): Future<E, A, B> {
  return fromReaderTask(rte)
}

/**
 * Convert a Future into a ReaderTaskEither
 */
export const toReaderTaskEither = <E, A, B>(future: Future<E, A, B>): ReaderTaskEither<E, A, B> =>
  toReaderTask(future)
