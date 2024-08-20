import { publicProcedure } from 'server/api/trpc'
import { commerce } from 'server/data-source'
import { z } from 'zod'
import {
  lowercaseLettersRegex,
  nameRegex,
  numbersRegex,
  specialCharacterRegex,
  uppercaseLettersRegex,
} from '../../../../../../utils/regex'
import { PASSWORD_MIN_LENGTH } from '../../../../../../utils/constants'

export const redeemReward = publicProcedure
  .input(
    z.object({
      campaignId: z.string(),
      voucherId: z.string(),
      rewardId: z.string(),
      points: z.number().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = ctx.session?.user
    return await commerce.redeemReward({ user, reward: input })
  })
