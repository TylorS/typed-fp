import { Arity1 } from '@typed/fp/lambda'
import { flow } from 'fp-ts/dist/function'

import { async } from './Async'
import { isSync, Resume } from './Resume'
import { run } from './run'

export const chain = <A, B>(f: Arity1<A, Resume<B>>) => (resume: Resume<A>): Resume<B> =>
  isSync(resume) ? f(resume.resume()) : async((r) => resume.resume(flow(f, run(r))))
