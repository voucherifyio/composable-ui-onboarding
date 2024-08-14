import { z } from 'zod'
import { protectedProcedure } from 'server/api/trpc'
import { commerce } from 'server/data-source'

export const getCart = protectedProcedure
  .input(z.object({ cartId: z.string(), channel: z.string() }))
  .query(async ({ input, ctx }) => {
    const user = ctx.session?.user
    return await commerce.getCart({
      ...input,
      user,
    })
  })
