import { Path } from '@fp/Path/exports'
import { eqString } from 'fp-ts/Eq'
import { ReadonlyRecord } from 'fp-ts/ReadonlyRecord'
import { getEq, iso, Newtype, prism } from 'newtype-ts'

/**
 * Newtype representing Universal Resource Idenitifiers
 */
export type Uri = Newtype<'Uri', string>

/**
 * Prism instance for Uri
 */
export const uriPrism = prism<Uri>((s: string) => URI_REGEX.test(s))

/**
 * Eq instance for Uri
 */
export const uriEq = getEq<Uri>(eqString)

export namespace Uri {
  /**
   * Wrap and unwrap Uri strings
   */
  export const { wrap, unwrap } = iso<Uri>()
}

/**
 * Regex for URIs
 */
export const URI_REGEX = /^(?:([^:/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:/?#]*)(?::(\d*))?))?((((?:[^?#/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/

export type QueryParams = ReadonlyRecord<string, string | undefined>

export function addQueryParameters(url: Uri, queryParams: QueryParams): Uri
export function addQueryParameters(url: Uri): (queryParams: QueryParams) => Uri

/**
 * Append Query Parameters to a Url
 */
export function addQueryParameters(url: Uri, queryParams?: QueryParams) {
  if (queryParams === void 0) {
    return (queryParams: QueryParams) => __addQueryParameters(url, queryParams)
  }

  return __addQueryParameters(url, queryParams)
}

function __addQueryParameters(url: Uri, queryParams: QueryParams): Uri {
  const params = Object.keys(queryParams).sort().map(queryParam(queryParams)).join('&')

  return Uri.wrap(encodeURI(`${url}${params ? `?${params}` : ''}`))
}

function queryParam(queryParams: QueryParams) {
  return (key: keyof typeof queryParams): string => {
    const value = queryParams[key]

    return value === void 0 ? key : `${key}=${value}`
  }
}

/**
 * ParsedUri JSON data structure
 * @name ParsedUri
 * @type
 */
export type ParsedUri = {
  readonly href: string
  readonly protocol: string
  readonly host: string
  readonly userInfo: string
  readonly username: string
  readonly password: string
  readonly hostname: string
  readonly port: string
  readonly relative: string
  readonly pathname: Path
  readonly directory: string
  readonly file: string
  readonly search: string
  readonly hash: string
}

/**
 * Parses an URL into JSON.
 *
 * @name parseUri(url: Uri): ParsedUri
 */
export function parseUri(url: Uri): ParsedUri {
  const matches = URI_REGEX.exec(Uri.unwrap(url)) as RegExpExecArray
  const parsedUri = {} as Record<keyof ParsedUri, string | Path>

  for (let i = 0; i < parsedUriKeyCount; ++i) {
    const key = parsedUriKeys[i]
    let value = matches[i] || ''

    if (key === 'search' && value) {
      value = '?' + value
    }
    if (key === 'protocol' && value && !value.endsWith(':')) {
      value = value + ':'
    }

    if (key === 'hash') {
      value = '#' + value
    }

    if (key === 'pathname' && !value) {
      value = '/'
    }

    parsedUri[key] = value
  }

  return parsedUri as ParsedUri
}

const parsedUriKeys: ReadonlyArray<keyof ParsedUri> = [
  'href',
  'protocol',
  'host',
  'userInfo',
  'username',
  'password',
  'hostname',
  'port',
  'relative',
  'pathname',
  'directory',
  'file',
  'search',
  'hash',
]

const parsedUriKeyCount = parsedUriKeys.length
