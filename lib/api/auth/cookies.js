import { serialize } from 'cookie'
import parseCookies from '../parse-cookies'
import { encryptSession, decryptToken } from './iron'

const TOKEN_NAME = 'token'
const ONE_DAY = 60 * 60 * 24
const MAX_AGE = ONE_DAY * 30

export async function getLoginSession(req) {
  const cookies = parseCookies(req)
  const token = cookies[TOKEN_NAME]
  const session = token && (await decryptToken(token))

  return session
}

export async function setLoginCookie(res, session) {
  const token = await encryptSession(session)
  const cookie = serialize(TOKEN_NAME, token, {
    maxAge: MAX_AGE,
    expires: new Date(Date.now() + MAX_AGE * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax',
  })

  res.setHeader('Set-Cookie', cookie)
}

export async function removeLoginCookie(res) {
  const cookie = serialize(TOKEN_NAME, '', { maxAge: -1, path: '/' })
  res.setHeader('Set-Cookie', cookie)
}
