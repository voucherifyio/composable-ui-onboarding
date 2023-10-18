import { z } from 'zod'
import { protectedProcedure } from 'server/api/trpc'
import { commerce } from 'server/data-source'

export const addCoupon = protectedProcedure
  .input(
    z.object({
      cartId: z.string(),
      coupon: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    return await commerce.addCoupon({ ...input })
  })
