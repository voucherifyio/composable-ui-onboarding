import { z } from 'zod'
import { protectedProcedure } from 'server/api/trpc'
import { commerce } from 'server/data-source'
import { ProductListResponse } from '@composable/types'

export const addCartItem = protectedProcedure
  .input(
    z.object({
      cartId: z.string(),
      productId: z.string(),
      variantId: z.string().optional(),
      quantity: z.number(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = ctx.session?.user
    return await commerce.addCartItem({ ...input, user })
  })
