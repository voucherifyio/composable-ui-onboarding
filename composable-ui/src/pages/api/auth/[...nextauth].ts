import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { NextApiRequest, NextApiResponse } from 'next'
import { getCRSFCookieInfo } from 'server/auth-utils'
import { upsertVoucherifyCustomer } from '@composable/voucherify'
import Analitycs from '@segment/analytics-node'

const getAnalytics = () => {
  if (!process.env.SEGMENTIO_SOURCE_WRITE_KEY) {
    throw new Error('SEGMENTIO_SOURCE_WRITE_KEY not defined in env variables')
  }

  return new Analitycs({ writeKey: process.env.SEGMENTIO_SOURCE_WRITE_KEY })
}

export const rawAuthOptions: NextAuthOptions = {
  pages: {},
  providers: [
    // See https://next-auth.js.org/providers/google
    GoogleProvider({
      clientId: `${process.env.GOOGLE_CLIENT_ID}`,
      clientSecret: `${process.env.GOOGLE_CLIENT_SECRET}`,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    CredentialsProvider({
      id: 'only-email',
      name: 'Only Email',
      credentials: {
        email: { label: 'Email address', type: 'text' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email) {
          return null
        }

        const voucherifyCustomer = await upsertVoucherifyCustomer(
          credentials.email
        )

        const analitycs = getAnalytics()
        analitycs.identify({
          userId: credentials.email,
          traits: {
            email: credentials.email,
          },
        })

        if (!voucherifyCustomer) {
          return null
        }

        return {
          id: voucherifyCustomer.id,
          voucherifyId: voucherifyCustomer.id,
          sourceId: voucherifyCustomer.source_id,
          name: voucherifyCustomer.name,
          email: voucherifyCustomer.email,
          phoneNumber: voucherifyCustomer.source_id,
          registered: true,
          registeredAt: voucherifyCustomer.created_at,
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (token?.name === 'anonymous_user') {
        const newToken = {
          ...token,
          id: token.sub,
          loggedIn: false,
        }
        return newToken
      }
      const newToken = {
        ...token,
        id: token.sub,
        loggedIn: true,
      }

      if (user?.sourceId) {
        newToken.sourceId = user.sourceId
      }
      if (user?.voucherifyId) {
        newToken.voucherifyId = user.voucherifyId
      }
      if (user?.registered) {
        newToken.registered = user.registered
      }
      if (user?.registeredAt) {
        newToken.registeredAt = user.registeredAt
      }

      return newToken
    },
    session: async ({ session, user, token }) => {
      const newSessionObj = {
        ...session,
        id: token?.sub,
        loggedIn: (token?.loggedIn as boolean) ?? false,
      }

      if (newSessionObj?.user && token.sourceId) {
        newSessionObj.user.sourceId = token.sourceId
      }
      if (newSessionObj?.user && token.voucherifyId) {
        newSessionObj.user.voucherifyId = token.voucherifyId
      }
      if (newSessionObj?.user && token.registeredAt) {
        newSessionObj.user.registeredAt = token.registeredAt
      }
      if (newSessionObj?.user && token.registered) {
        newSessionObj.user.registered = token.registered
      }

      return newSessionObj
    },
  },
  session: {
    updateAge: 0,
  },
}

const authOptions = async (req: NextApiRequest, res: NextApiResponse) => {
  const actionList = req.query.nextauth || []

  if (
    actionList?.includes('signout') ||
    actionList?.includes('credentials') ||
    actionList?.includes('anon') ||
    actionList?.includes('only-email')
  ) {
    res.setHeader('Set-Cookie', getCRSFCookieInfo(req).cookieExpire)
  }

  return await NextAuth(req, res, rawAuthOptions)
}

export default authOptions
