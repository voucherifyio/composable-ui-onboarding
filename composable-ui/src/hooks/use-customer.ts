import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from 'utils/api'
import { useSession } from 'next-auth/react'
import { ExtendedRedeemable } from '@composable/voucherify'

const USE_CUSTOMER_KEY = 'useCustomerKey'
export enum WalletStatus {
  IS_LOADING = 'IS_LOADING',
  ERRORED = 'ERRORED',
  LOADED = 'LOADED',
}

export type RedeemablesByCampaignType = Record<
  | 'LOYALTY_PROGRAM'
  | 'PROMOTION'
  | 'DISCOUNT_COUPONS'
  | 'GIFT_VOUCHERS'
  | 'REFERRAL_PROGRAM',
  ExtendedRedeemable[] | undefined
>

export const useCustomer = () => {
  const session = useSession()
  const { client } = api.useContext()
  const [wallet, setWallet] = useState<{
    redeemablesByCampaignType: RedeemablesByCampaignType
    refereeRedeemables: ExtendedRedeemable[]
    refererRedeemables: ExtendedRedeemable[]
    status: WalletStatus
  }>({
    redeemablesByCampaignType: {} as RedeemablesByCampaignType,
    refereeRedeemables: [],
    refererRedeemables: [],
    status: WalletStatus.IS_LOADING,
  })

  useQuery([USE_CUSTOMER_KEY, session], async () => {
    if (session.status === 'loading') {
      return
    }
    const response = await client.commerce.wallet.mutate()
    if (!Array.isArray(response.redeemables)) {
      setWallet({ ...wallet, status: WalletStatus.ERRORED })
      return
    }
    const redeemablesByCampaignType = {} as RedeemablesByCampaignType
    response.redeemables.forEach((redeemable: ExtendedRedeemable) => {
      const campaignType = redeemable.campaign_type
      if (redeemablesByCampaignType[campaignType]) {
        redeemablesByCampaignType[campaignType]?.push(redeemable)
      } else {
        redeemablesByCampaignType[campaignType] = [redeemable]
      }
    })
    setWallet({
      redeemablesByCampaignType,
      refereeRedeemables: response.redeemables.filter(
        (redeemable: ExtendedRedeemable) => redeemable.holder_role === 'REFEREE'
      ),
      refererRedeemables: response.redeemables.filter(
        (redeemable: ExtendedRedeemable) =>
          redeemable.holder_role === 'REFERRER'
      ),
      status: WalletStatus.LOADED,
    })
  })

  return { ...wallet, setWallet }
}
