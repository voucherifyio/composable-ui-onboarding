import { publicProcedure } from 'server/api/trpc'
import { commerce } from 'server/data-source'

export const wallet = publicProcedure.mutation(async ({ ctx }) => {
  const user = ctx.session?.user
  return await commerce.wallet({ user })
})
