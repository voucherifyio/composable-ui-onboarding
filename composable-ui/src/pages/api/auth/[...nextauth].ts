import { randomUUID } from 'crypto'
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { NextApiRequest, NextApiResponse } from 'next'
import { getCRSFCookieInfo } from 'server/auth-utils'
import { upsertVoucherifyCustomer } from '@composable/voucherify'

const authOptions = async (req: NextApiRequest, res: NextApiResponse) => {
  const actionList = req.query.nextauth || []

  if (
    actionList?.includes('signout') ||
    actionList?.includes('credentials') ||
    actionList?.includes('anon')
  ) {
    res.setHeader('Set-Cookie', getCRSFCookieInfo(req).cookieExpire)
  }

  return await NextAuth(req, res, {
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
        id: 'anon',
        name: 'Anonymous',
        credentials: {},
        async authorize() {
          const anonymousUser = {
            id: randomUUID(),
            name: `anonymous_user`,
            email: `anonymous_user`,
            image: '',
          }
          //anyone can do an anonymous login
          return anonymousUser
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
            registeredCustomer: true,
            registrationDate: voucherifyCustomer.created_at,
            image: '',
          }
        },
      })
    ],
    callbacks: {
      jwt: async ({ token }) => {
        if (token?.name === 'anonymous_user') {
          return {
            ...token,
            id: token.sub,
            loggedIn: false,
          }
        }
        return {
          ...token,
          id: token.sub,
          loggedIn: true,
        }
      },
      session: async ({ session, user, token }) => {
        return {
          ...session,
          id: token?.sub,
          loggedIn: (token?.loggedIn as boolean) ?? false,
        }
      },
    },
    session: {
      updateAge: 0,
    },
  })
}

export default authOptions
