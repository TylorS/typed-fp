import { curry } from '@fp/lambda/exports'

/**
 * Compare two values using <
 * @param right a
 * @param left a
 * @returns boolean
 */
export const lessThan: {
  <A>(right: A, left: A): boolean
  <A>(right: A): (left: A) => boolean
} = curry(<A>(right: A, left: A) => left < right) as {
  <A>(right: A, left: A): boolean
  <A>(right: A): (left: A) => boolean
}
