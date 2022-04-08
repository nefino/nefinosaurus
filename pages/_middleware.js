import { NextResponse } from "next/server"

/**
 * Shows how to restrict access using the HTTP Basic schema.
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication
 * @see https://tools.ietf.org/html/rfc7617
 *
 * A user-id containing a colon (":") character is invalid, as the
 * first colon in a user-pass string separates user and password.
 */
const BASIC_USER = process.env.BASIC_USER
const BASIC_PASS = process.env.BASIC_PASS

/**
 * Receives a HTTP request and replies with a response.
 * @param {Request} request
 * @returns {Promise<Response>}
 */
export function middleware(request) {
  const { protocol, pathname } = new URL(request.url)

  // In the case of a Basic authentication, the exchange
  // MUST happen over an HTTPS (TLS) connection to be secure.
  if (
    "https:" !== protocol ||
    "https" !== request.headers.get("x-forwarded-proto")
  ) {
    return new Response("Please use a HTTPS connection.", {
      status: 400,
      statusText: "Bad Request",
    })
  }

  switch (pathname) {
    case "/favicon.ico":
    case "/robots.txt":
      return new Response(null, { status: 204 })
  }

  // The "Authorization" header is sent when authenticated.
  if (request.headers.has("Authorization")) {
    const { user, pass, error } = basicAuthentication(request)

    if (error) {
      return new Response(error, {
        status: 400,
        statusText: "Bad Request",
      })
    }

    const status = verifyCredentials(user, pass)

    if (status !== "Verified") {
      return new Response(status, {
        status: 401,
        statusText: "Unauthorized",
      })
    }

    // Only returns this response when no exception is thrown.
    return NextResponse.next()
  }

  // Not authenticated.
  return new Response("You need to login.", {
    status: 401,
    headers: {
      // Prompts the user for credentials.
      "WWW-Authenticate": 'Basic realm="my scope", charset="UTF-8"',
    },
  })
}

/**
 * Returns a status code describing whether authentication has succeeded.
 * @param {string} user
 * @param {string} pass
 * @returns {string} status
 */
function verifyCredentials(user, pass) {
  if (BASIC_USER !== user) {
    return "Invalid username."
  }

  if (BASIC_PASS !== pass) {
    return "Invalid password."
  }

  return "Verified"
}

/**
 * Parse HTTP Basic Authorization value.
 * @param {Request} request
 * @throws {BadRequestException}
 * @returns {{ user: string, pass: string }}
 */
function basicAuthentication(request) {
  const Authorization = request.headers.get("Authorization")

  const [scheme, encoded] = Authorization.split(" ")

  // The Authorization header must start with Basic, followed by a space.
  if (!encoded || scheme !== "Basic") {
    return {
      user: null,
      pass: null,
      error: "Malformed authorization header.",
    }
  }

  // Decodes the base64 value and performs unicode normalization.
  // @see https://datatracker.ietf.org/doc/html/rfc7613#section-3.3.2 (and #section-4.2.2)
  // @see https://dev.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
  const buffer = Uint8Array.from(atob(encoded), (character) =>
    character.charCodeAt(0)
  )
  const decoded = new TextDecoder().decode(buffer).normalize()

  // The username & password are split by the first colon.
  //=> example: "username:password"
  const index = decoded.indexOf(":")

  // The user & password are split by the first colon and MUST NOT contain control characters.
  // @see https://tools.ietf.org/html/rfc5234#appendix-B.1 (=> "CTL = %x00-1F / %x7F")
  if (index === -1 || /[\0-\x1F\x7F]/.test(decoded)) {
    return {
      user: null,
      pass: null,
      error: "Invalid authorization value.",
    }
  }

  return {
    user: decoded.substring(0, index),
    pass: decoded.substring(index + 1),
    error: null,
  }
}
