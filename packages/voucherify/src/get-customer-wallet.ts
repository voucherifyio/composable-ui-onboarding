import { getVoucherify } from './voucherify-config'
import { UserSession } from '@composable/types'
import { CustomerRedeemablesListItemResponse } from '@voucherify/sdk/dist/types/Customers'

export const getCustomerWallet = async ({ user }: { user: UserSession }) => {
  const customerId = user?.voucherifyId || user?.sourceId
  if (!customerId) {
    throw new Error('customerId not provided')
  }
  const redeemables = (
    (
      await getVoucherify().customers.listRedeemables(customerId, {
        limit: 100,
      })
    )?.data || []
  ).filter(
    (redeemable) =>
      redeemable?.redeemable?.voucher &&
      redeemable.redeemable.voucher.active !== false
  )

  const redeemablesExtended = await asyncMap(
    redeemables,
    async (redeemable: CustomerRedeemablesListItemResponse) => {
      if (
        redeemable.voucher_type !== 'LOYALTY_CARD' ||
        !redeemable.redeemable?.voucher?.id
      ) {
        return redeemable
      }
      const rewards =
        (
          await getVoucherify().loyalties.listMemberRewards(
            redeemable.redeemable?.voucher?.id,
            { limit: 100 }
          )
        )?.data || []
      return { ...redeemable, rewards }
    }
  )

  return { redeemables: redeemablesExtended }
}

export function asyncMap(
  arr: any[],
  asyncFn: (...args: any[]) => Promise<any>
) {
  return Promise.all(arr.map(asyncFn))
}
