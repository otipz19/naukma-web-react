import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { checkCredentials, login } from '../auth.ts'

interface FormValues {
  login: string
  password: string
}

type FormErrors = Partial<Record<keyof FormValues | 'form', string>>

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState<FormValues>({ login: '', password: '' })
  const [errors, setErrors] = useState<FormErrors>({})

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name as keyof FormValues
    setForm({ ...form, [name]: e.target.value })
    setErrors({ ...errors, [name]: undefined, form: undefined })
  }

  const validate = (): FormErrors => {
    const errs: FormErrors = {}
    const name = form.login.trim()
    if (!name) errs.login = 'Login is required'
    else if (!/^[a-zA-Z]+[1-6]$/.test(name)) errs.login = 'Login must be a name followed by a course number (e.g. mark5)'
    if (!form.password) errs.password = 'Password is required'
    return errs
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) return setErrors(errs)
    if (!checkCredentials(form.login.trim(), form.password)) {
      return setErrors({ form: 'Invalid login or password' })
    }
    login(form.login.trim())
    navigate('/dashboard')
  }

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <h1>Sign in</h1>
        {errors.form && <div className="form-error">{errors.form}</div>}
        <label>
          Login
          <input
            name="login"
            value={form.login}
            onChange={handleChange}
            className={errors.login ? 'invalid' : ''}
            autoComplete="username"
          />
          {errors.login && <span className="field-error">{errors.login}</span>}
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className={errors.password ? 'invalid' : ''}
            autoComplete="current-password"
          />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </label>
        <button type="submit">Log in</button>
      </form>
    </div>
  )
}
