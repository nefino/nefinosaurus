// import {Buffer} from "buffer"

export function middleware(req: Request) {
  const basicAuth = req.headers.get('authorization')

  if (basicAuth) {
    const auth = basicAuth.split(' ')[1]
    return new Response()
    // const [user, pwd] = Buffer.from(auth, 'base64').toString().split(':')

    // if (user === '4dmin' && pwd === 'testpwd123') {
    //     // if we need more middleware, we have to figure out how to mimic NextResponse.next()
    //   return new Response()
    // }
  }

  return new Response('Auth required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  })
}