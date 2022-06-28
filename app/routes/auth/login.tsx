import { useActionData } from '@remix-run/react'
import { json } from '@remix-run/server-runtime'
import type { LoginFields } from '~/session.server'
import { login, createUserSession } from '~/session.server'

interface LoginFormFields {
  identifier: string
  password: string
}
interface LoginFormErrors {
  identifier?: string
  password?: string
}

interface LoginFormData {
  fields: LoginFormFields
  fieldErrors: LoginFormErrors
}

function isEmail(value: string) {
  return value.includes('@')
}

function validateIdentifier(identifier: string) {
  if (typeof identifier !== 'string' || identifier.length === 0) {
    return 'Email or Username is required'
  }
}

function validatePassword(password: string) {
  if (typeof password !== 'string' || password.length === 0) {
    return 'Password is required'
  }
}

function badRequest(data: LoginFormData) {
  return json(data, { status: 400 })
}

export const action = async ({ request }: any) => {
  const form = await request.formData()
  const identifier = form.get('identifier')
  const password = form.get('password')

  const fields = { identifier, password }

  const fieldErrors = {
    identifier: validateIdentifier(identifier),
    password: validatePassword(password),
  }

  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({ fieldErrors, fields })
  }

  const identifierType = isEmail(identifier) ? 'email' : 'username'
  const loginFields: LoginFields = {
    password,
  }

  loginFields[identifierType] = identifier

  const user = await login(loginFields)
  if (!user)
    return badRequest({
      fields,
      fieldErrors: { identifier: 'Invalid Credentials' },
    })

  return createUserSession(user.id, '/')
}

function Login() {
  const actionData = useActionData()

  return (
    <div className="auth-container">
      <div className="page-header">
        <h1>Login</h1>
      </div>

      <div className="page-content">
        <form method="post">
          <div className="form-control">
            <label htmlFor="identifier">Username or Email</label>
            <input
              type="text"
              name="identifier"
              id="identifier"
              defaultValue={actionData?.fields?.identifier}
            />
            <div className="error">
              {actionData?.fieldErrors?.identifier &&
                actionData?.fieldErrors?.identifier}
            </div>
          </div>
          <div className="form-control">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              defaultValue={actionData?.fields?.password}
            />
            <div className="error">
              {actionData?.fieldErrors?.password &&
                actionData?.fieldErrors?.password}
            </div>
          </div>

          <button className="btn btn-block" type="submit">
            Submit
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
