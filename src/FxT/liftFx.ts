import { Fx } from '@typed/fp/Fx'
import { HKT, Kind, Kind2, Kind3, Kind4, URIS, URIS2, URIS3, URIS4 } from 'fp-ts/dist/HKT'

export type LiftFx<F> = F extends URIS
  ? LiftFx1<F>
  : F extends URIS2
  ? LiftFx2<F>
  : F extends URIS3
  ? LiftFx3<F>
  : F extends URIS4
  ? LiftFx4<F>
  : LiftFxHKT<F>

export type LiftFx1<F extends URIS> = <A>(kind: Kind<F, A>) => Fx<Kind<F, A>, A>

export type LiftFx2<F extends URIS2> = <E, A>(kind: Kind2<F, E, A>) => Fx<Kind2<F, E, A>, A>

export type LiftFx3<F extends URIS3> = <R, E, A>(
  kind: Kind3<F, R, E, A>,
) => Fx<Kind3<F, R, E, A>, A>

export type LiftFx4<F extends URIS4> = <S, R, E, A>(
  kind: Kind4<F, S, R, E, A>,
) => Fx<Kind4<F, S, R, E, A>, A>

export type LiftFxHKT<F> = <A>(kind: HKT<F, A>) => Fx<HKT<F, A>, A>

/**
 * Create a lift function that will convert any F<A> into Fx<F<A>, A>
 */
export const liftFx = <F>() => lift_ as LiftFx<F>

function lift_<F, A>(hkt: HKT<F, A>): Fx<typeof hkt, A> {
  return {
    [Symbol.iterator]: function* () {
      const value = yield hkt

      return value as A
    },
  }
}
