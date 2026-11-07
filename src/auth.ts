const COOKIE_NAME = 'auth_user'
const VALID_LOGIN = 'mark5'
const VALID_PASSWORD = 'mark5'

export function checkCredentials(login: string, password: string): boolean {
  return login === VALID_LOGIN && password === VALID_PASSWORD
}

export function getUser(): string | null {
  const match = document.cookie.split('; ').find((c) => c.startsWith(`${COOKIE_NAME}=`))
  return match ? decodeURIComponent(match.split('=')[1]) : null
}

export function isAuthenticated(): boolean {
  return getUser() !== null
}

export function login(user: string): void {
  const maxAge = 60 * 60 * 24
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(user)}; max-age=${maxAge}; path=/; SameSite=Lax`
}

export function logout(): void {
  document.cookie = `${COOKIE_NAME}=; max-age=0; path=/`
}
