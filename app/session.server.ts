import { createCookieSessionStorage, redirect } from '@remix-run/node'
import bcrypt from 'bcryptjs'
import { db } from './db.server'

export interface LoginFields {
  email?: string
  username?: string
  password: string
}

interface SignupFields {
  firstName: string
  lastName: string
  email?: string
  username: string
  password: string
}

// Login user
export async function login({ email, username, password }: LoginFields) {
  const user = await db.user.findUnique({
    where: {
      email,
      username,
    },
  })

  if (!user) return null

  // Check password
  const isCorrectPassword = await bcrypt.compare(password, user.password)
  if (!isCorrectPassword) return null

  return user
}

// Get session secret
const sessionSecret = process.env.SESSION_SECRET
if (!sessionSecret) {
  throw new Error('No Session Secret')
}

// Create session storage
const storage = createCookieSessionStorage({
  cookie: {
    name: 'easy_shopping_session',
    secure: process.env.NODE_ENV === 'production',
    secrets: [sessionSecret],
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 60,
    httpOnly: true,
  },
})

// Create session
export async function createUserSession(userId: string, redirectTo: string) {
  const session = await storage.getSession()
  session.set('userId', userId)
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await storage.commitSession(session),
    },
  })
}

// Register new user
export async function register({
  firstName,
  lastName,
  email,
  username,
  password,
}: SignupFields) {
  const passwordHash = await bcrypt.hash(password, 10)
  return db.user.create({
    data: {
      firstName,
      lastName,
      email,
      username,
      password: passwordHash,
    },
  })
}

// Get user session
export function getUserSession(request: Request) {
  return storage.getSession(request.headers.get('Cookie'))
}

// Get user
export async function getUser(request: Request) {
  const session = await getUserSession(request)
  const userId = session.get('userId')

  if (!userId || typeof userId !== 'string') return null

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
    })

    return user
  } catch (error) {
    return null
  }
}

// Logout user and destroy session
export async function logout(request: Request) {
  const session = await storage.getSession(request.headers.get('Cookie'))
  return redirect('/auth/logout', {
    headers: {
      'Set-Cookie': await storage.destroySession(session),
    },
  })
}
