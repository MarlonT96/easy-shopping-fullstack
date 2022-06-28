import type {
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from '@remix-run/node'
import { json } from '@remix-run/node'
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  useLoaderData,
} from '@remix-run/react'

import globalStylesheetUrl from './styles/global.css'
import { getUser } from './session.server'

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: globalStylesheetUrl }]
}

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'Easy Shopping',
})

type LoaderData = {
  user: Awaited<ReturnType<typeof getUser>>
}

interface ParentElement {
  children: JSX.Element
}

export const loader: LoaderFunction = async ({ request }) => {
  return json<LoaderData>({
    user: await getUser(request),
  })
}

export default function App() {
  return (
    <Document>
      <Layout>
        <Outlet />
      </Layout>
    </Document>
  )
}

function Document({ children }: ParentElement) {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
        <title>Easy Shopping</title>
      </head>
      <body>
        {children}
        {process.env.NODE_ENV === 'development' ? <LiveReload /> : null}
      </body>
    </html>
  )
}

function Layout({ children }: ParentElement) {
  const { user } = useLoaderData()
  return (
    <>
      <nav className="navbar">
        <Link to="/" className="logo">
          Easy Shopping
        </Link>

        <ul className="nav">
          {user ? (
            <li>
              <form action="/auth/logout" method="POST">
                <button className="btn" type="submit">
                  Logout {user.username}
                </button>
              </form>
            </li>
          ) : (
            <li>
              <Link to="/auth/login">Login</Link>
            </li>
          )}
        </ul>
      </nav>

      <div className="container">{children}</div>
    </>
  )
}
