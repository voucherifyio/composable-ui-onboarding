export interface User {
  id: string
  name: string
  email: string
  address: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export type UserSession = {
  voucherifyId?: string
  sourceId?: string
  registeredAt?: string
  registered?: boolean
} & {
  name?: string | null
  email?: string | null
  image?: string | null
}
