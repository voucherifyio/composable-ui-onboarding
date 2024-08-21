import {
  CustomerRedeemablesListItemResponse,
  QualificationsRedeemable,
} from '@voucherify/sdk'
import { createClient, Entry, EntrySkeletonType } from 'contentful'
import { asyncMap } from './get-customer-wallet'

const client = createClient({
  accessToken: '3vqEdIOi1GowrIiqQRmXKKVvVvSsB9LwLQtmofq4E1s',
  space: 'ifzkoiigahwu',
})

export const injectContentfulContent = async (
  data: QualificationsRedeemable[]
): Promise<QualificationsRedeemable[]> =>
  await asyncMap(
    data,
    async (
      redeemable: QualificationsRedeemable & {
        metadata?: {
          contentfulEntities?: { id: string; contentType: string }[]
        }
      }
    ) => {
      const entry = await getContentfulEntry(redeemable.metadata)

      if (!entry) {
        return redeemable
      }

      if (redeemable.object === 'voucher') {
        return modifyToContentfulVoucher(redeemable, entry)
      }

      if (redeemable.object === 'promotion_tier') {
        return modifyToContentfulPromotionTier(redeemable, entry)
      }

      return redeemable
    }
  )

export const injectContentfulContentToRedeemablesVouchers = async (
  data: CustomerRedeemablesListItemResponse[]
): Promise<CustomerRedeemablesListItemResponse[]> =>
  await asyncMap(
    data,
    async (redeemable: CustomerRedeemablesListItemResponse) => {
      const entry = await getContentfulEntry(
        redeemable.redeemable.voucher?.metadata
      )

      if (!entry) {
        return redeemable
      }

      if (
        redeemable.redeemable?.voucher?.code &&
        redeemable.redeemable.voucher.type !== 'LOYALTY_CARD'
      ) {
        return modifyToContentfulRedeemabledVoucher(redeemable, entry)
      }

      return redeemable
    }
  )

const getContentfulEntry = async (
  metadata:
    | {
        contentfulEntities?: { id: string; contentType: string }[]
      }
    | undefined
) => {
  const contentfulEntityId = metadata?.contentfulEntities?.[0].id || null
  if (!contentfulEntityId) {
    return null
  }

  const entry = await client.getEntry(contentfulEntityId).catch((err) => {
    if (err instanceof Error) {
      console.error('voucherify/src/contentful [GET ENTRY]', err.message)
    }
  })
  return entry
}

const modifyToContentfulPromotionTier = (
  redeemable: QualificationsRedeemable,
  entry: Entry<EntrySkeletonType, undefined, string>
) => ({
  ...redeemable,
  banner: entry.fields.description || redeemable?.banner || '',
})

const modifyToContentfulVoucher = (
  redeemable: QualificationsRedeemable,
  entry: Entry<EntrySkeletonType, undefined, string>
) => ({
  ...redeemable,
  metadata: redeemable.metadata
    ? { banner: entry.fields.promotionName || '' }
    : redeemable.metadata,
})

const modifyToContentfulRedeemabledVoucher = (
  redeemable: CustomerRedeemablesListItemResponse,
  entry: Entry<EntrySkeletonType, undefined, string>
) => {
  const voucherMetadata = redeemable.redeemable.voucher?.metadata
  const modifiedMetadata = voucherMetadata
    ? { ...voucherMetadata, voucherName: entry.fields.promotionName }
    : {}
  return {
    ...redeemable,
    redeemable: {
      ...redeemable.redeemable,
      voucher: {
        ...redeemable.redeemable.voucher,
        metadata: modifiedMetadata,
      },
    },
  }
}
