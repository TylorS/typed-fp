import { chainResume } from './chainResume'
import { Effect, EffectGenerator, Env, Resume, sync } from './Effect'

export const toEnv = <E, A>(effect: Effect<E, A>): Env<E, A> => (e: E) => {
  const generator = effect[Symbol.iterator]()

  return effectGeneratorToResume(generator, generator.next(), e)
}

const effectGeneratorToResume = <E, A>(
  generator: EffectGenerator<E, A>,
  result: IteratorResult<Env<E, unknown>, A>,
  env: E,
): Resume<A> => {
  while (!result.done) {
    const resume = result.value(env)

    if (resume.async) {
      return chainResume(resume, (a) => effectGeneratorToResume(generator, generator.next(a), env))
    }

    result = generator.next(resume.value)
  }

  return sync(result.value)
}
