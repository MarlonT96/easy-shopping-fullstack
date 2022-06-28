import { redirect } from '@remix-run/server-runtime'
import { logout } from '~/session.server'

export const action = async ({ request }) => {
  return logout(request)
}

export const loader = async () => {
  return redirect('/')
}
