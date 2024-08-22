import {
  CustomerRedeemablesListItemResponse,
  QualificationsRedeemable,
} from '@voucherify/sdk'
import { createClient, Entry, EntrySkeletonType } from 'contentful'
import { asyncMap } from './get-customer-wallet'

const getContentfulClient = (env?: { apiKey?: string; spaceId?: string }) => {
  if (
    (env?.apiKey || process.env.NEXT_PUBLIC_CONTENTFUL_UNPUBLISHED_API_KEY) &&
    (env?.spaceId || process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID)
  ) {
    return createClient({
      accessToken:
        env?.apiKey ||
        (process.env.NEXT_PUBLIC_CONTENTFUL_UNPUBLISHED_API_KEY as string),
      space:
        env?.spaceId || (process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID as string),
    })
  }
  console.log('No contentful client was provided')
  return undefined
}

export const injectContentfulContentToVoucher = async (voucher: any) => {
  const entry = await getContentfulEntry(voucher.metadata)

  if (!entry) {
    return voucher
  }

  return modifyToContentfulVoucher(voucher, entry)
}

export const injectContentfulContentToQualificationsRedeemables = async (
  data: QualificationsRedeemable[],
  env?: {
    apiKey?: string
    spaceId?: string
  }
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
      const entry = await getContentfulEntry(redeemable.metadata, env)

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
  data: CustomerRedeemablesListItemResponse[],
  env?: {
    apiKey?: string
    spaceId?: string
  }
): Promise<CustomerRedeemablesListItemResponse[]> =>
  await asyncMap(
    data,
    async (redeemable: CustomerRedeemablesListItemResponse) => {
      const entry = await getContentfulEntry(
        redeemable.redeemable.voucher?.metadata,
        env
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
    | undefined,
  env?: {
    apiKey?: string
    spaceId?: string
  }
) => {
  const contentfulEntityId = metadata?.contentfulEntities?.[0].id || null
  if (!contentfulEntityId) {
    return
  }

  const contentFulClient = getContentfulClient(env)
  if (!contentFulClient) {
    return
  }
  return await contentFulClient.getEntry(contentfulEntityId).catch((err) => {
    console.log(err)
    if (err instanceof Error) {
      console.error('voucherify/src/contentful [GET ENTRY]', err.message)
    }
  })
}

const modifyToContentfulPromotionTier = (
  redeemable: QualificationsRedeemable,
  entry: Entry<EntrySkeletonType, undefined, string>
) => ({
  ...redeemable,
  banner: entry.fields.name,
  metadata: redeemable.metadata
    ? { description: entry.fields.description }
    : redeemable.metadata,
})

const modifyToContentfulVoucher = (
  redeemable: QualificationsRedeemable,
  entry: Entry<EntrySkeletonType, undefined, string>
) => ({
  ...redeemable,
  metadata: redeemable.metadata
    ? { banner: entry.fields.name || '', description: entry.fields.description }
    : redeemable.metadata,
})

const modifyToContentfulRedeemabledVoucher = (
  redeemable: CustomerRedeemablesListItemResponse,
  entry: Entry<EntrySkeletonType, undefined, string>
) => {
  return {
    ...redeemable,
    redeemable: {
      ...redeemable.redeemable,
      voucher: redeemable.redeemable.voucher
        ? modifyToContentfulVoucher(redeemable.redeemable.voucher as any, entry)
        : undefined,
    },
  }
}
