import { z } from 'zod'
import { protectedProcedure } from 'server/api/trpc'
import { commerce } from 'server/data-source'

export const updateOrder = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      status: z.string(),
      cartId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    return await commerce.updateOrder({ ...input })
  })
