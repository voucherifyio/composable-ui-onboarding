import { z } from 'zod'
import { protectedProcedure } from 'server/api/trpc'
import { commerce } from 'server/data-source'

export const getOrderHistory = protectedProcedure
  .input(z.object({ customerSourceId: z.string(), channel: z.string() }))
  .query(async ({ input, ctx }) => {
    const user = ctx.session?.user
    return await commerce.getOrderHistory({
      ...input,
      user,
    })
  })
