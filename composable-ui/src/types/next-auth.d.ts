import { DefaultUser, type DefaultSession } from 'next-auth'
import { DefaultJWT, JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    id?: string
    loggedIn?: boolean
    sub?: string
    user?: {
      // id: string
      voucherifyId?: string
      sourceId?: string
      registeredAt?: string
      registered?: boolean
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    voucherifyId?: string
    sourceId?: string
    registeredAt?: string
    registered?: boolean
  }
}
declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT extends DefaultJWT {
    /** OpenID ID Token */
    idToken?: string
    voucherifyId?: string
    sourceId?: string
    registeredAt?: string
    registered?: boolean
  }
}
