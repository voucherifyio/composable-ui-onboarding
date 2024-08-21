import { CartData, useCart } from '../../hooks'
import { AlgoliaProduct, Cart, Product, UserSession } from '@composable/types'
import { useSession } from 'next-auth/react'
import { ReactNode, useEffect, useState } from 'react'
import {
  addChannelToOrder,
  cartToVoucherifyOrder,
  itemToVoucherifyItem,
  userSessionToVoucherifyCustomer,
} from '@composable/voucherify'
import { QualificationsCheckEligibilityResponseBody } from '@voucherify/sdk'
import { generateCartItem } from '@composable/commerce-generic/src/data/generate-cart-data'
import { getVoucherifyClientSide } from './client-side-voucherify-config'
import {
  QualificationsRedeemable,
  QualificationsRedeemableList,
} from '@voucherify/sdk/dist/types/Qualifications'
import { Accordion, AccordionSize } from '@composable/ui'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  CloseButton,
  Text,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { lineHeights } from '@composable/ui/src/chakra/theme/foundations/typography'
import { useQuery } from '@tanstack/react-query'
import { useChannel } from '../../hooks/use-channel'
import { injectContentfulContent } from '../../../../packages/voucherify/src/contentful'

export const Qualifications = ({
  cart,
  product,
  options,
}: {
  product?: Product
  options?: { onlyPromotionCount: boolean }
  cart?: CartData
}) => {
  const { channel } = useChannel()
  const { data: session } = useSession()

  if (!session) {
    return null
  }

  if (channel && product) {
    return (
      <QualificationsProduct
        product={product}
        user={session?.user}
        options={options}
        channel={channel}
      />
    )
  }

  if (channel && cart && !cart?.isEmpty && !cart?.isLoading) {
    return (
      <QualificationsCart
        cart={cart as Cart}
        user={session?.user}
        options={options}
        channel={channel}
      />
    )
  }
  return null
}

const getAccordionItem = ({
  qualificationsRedeemables,
  key,
  title,
}: {
  qualificationsRedeemables: QualificationsRedeemable[]
  key: string
  title: string
}) => {
  return {
    defaultOpen: true,
    label: title,
    content: (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {qualificationsRedeemables.map((redeemable) => (
          <SimpleAlertBox
            key={redeemable.id}
            title={
              <>
                {redeemable.object === 'promotion_tier'
                  ? 'PROMOTION'
                  : 'VOUCHER'}
                {(redeemable.object === 'voucher' && (
                  <>
                    <br />
                    code: {redeemable.id}
                  </>
                )) ||
                  undefined}
              </>
            }
            description={
              !redeemable.banner && !redeemable.metadata?.banner
                ? undefined
                : typeof redeemable.metadata?.banner === 'string'
                ? redeemable.metadata?.banner
                : redeemable.banner
            }
          />
        ))}
      </Box>
    ),
    id: key,
  }
}

export const QualificationsCart = ({
  cart,
  user,
  options,
  channel,
}: {
  cart: Cart
  user: UserSession | undefined
  options?: {}
  channel: string
}) => {
  const { data: qualificationsRedeemables } = useQuery(
    [user, cart, options],
    async () => {
      const voucherify = getVoucherifyClientSide()
      const customer = user ? userSessionToVoucherifyCustomer(user) : undefined
      const voucherifyOrder = addChannelToOrder(
        cartToVoucherifyOrder(cart, customer),
        channel
      )
      const res =
        (
          await voucherify.qualifications({
            order: voucherifyOrder,
            customer,
            scenario: 'ALL',
            mode: 'BASIC',
            options: {
              sorting_rule: 'BEST_DEAL',
              filters: {
                resource_type: {
                  conditions: { $in: ['promotion_tier', 'voucher'] },
                },
              },
              expand: ['redeemable'],
            },
          })
        )?.redeemables?.data || []
      return injectContentfulContent(res)
    },
    {
      retry: false,
      keepPreviousData: false,
    }
  )

  if (!qualificationsRedeemables?.length) {
    return null
  }

  return (
    <Accordion
      size="medium"
      items={[
        getAccordionItem({
          qualificationsRedeemables,
          key: 'cart',
          title: 'Applicable vouchers and promotions sorted by best deal',
        }),
      ]}
      accordionProps={{
        allowToggle: false,
        allowMultiple: true,
      }}
      accordionItemProps={{ border: 'none' }}
      accordionPanelProps={{ px: 0 }}
      accordionButtonProps={{
        px: 2,
        borderBottomWidth: '1px',
      }}
    />
  )
}

export const QualificationsProduct = ({
  product,
  user,
  options,
  channel,
}: {
  product: Product | AlgoliaProduct
  user: UserSession | undefined
  options?: { onlyPromotionCount: boolean }
  channel: string
}) => {
  const { data: qualificationsRedeemables } = useQuery(
    [user, product],
    async () => {
      const voucherify = getVoucherifyClientSide()
      const items = [
        itemToVoucherifyItem(generateCartItem(product.id, 1, product)),
      ]
      const customer = user ? userSessionToVoucherifyCustomer(user) : undefined
      const res =
        (
          await voucherify.qualifications({
            order: addChannelToOrder(
              {
                amount: items[0].amount,
                items,
                customer,
              },
              channel
            ),
            customer,
            scenario: 'PRODUCTS',
            mode: 'BASIC',
            options: {
              sorting_rule: 'BEST_DEAL',
              filters: {
                resource_type: {
                  conditions: { $in: ['promotion_tier', 'voucher'] },
                },
              },
              expand: ['redeemable'],
            },
          })
        )?.redeemables?.data || []
      return injectContentfulContent(res)
    },
    {
      retry: false,
      keepPreviousData: false,
    }
  )

  if (!qualificationsRedeemables?.length) {
    return null
  }

  if (options?.onlyPromotionCount) {
    return (
      <Box sx={{ fontSize: { base: 'xs', lg: 'sm' } }}>
        <Text as={'p'} color="success-med">
          {qualificationsRedeemables.length} discounts found related to this
          product
        </Text>
      </Box>
    )
  }

  return (
    <Accordion
      size="medium"
      items={[
        getAccordionItem({
          qualificationsRedeemables,
          key: product.id,
          title: 'Discounts related to the product',
        }),
      ]}
      accordionProps={{
        textAlign: 'start',
        allowToggle: false,
        allowMultiple: true,
      }}
      accordionItemProps={{ border: 'none' }}
      accordionPanelProps={{ px: 0 }}
      accordionButtonProps={{
        px: 2,
        borderBottomWidth: '1px',
      }}
    />
  )
}

export const SimpleAlertBox = ({
  description,
  title,
  children,
  colorLight,
  colorDark,
}: {
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
  colorLight?: string
  colorDark?: string
}) => {
  const bgValue = useColorModeValue(
    colorLight || 'info.100',
    colorDark || 'info.700'
  )

  return (
    <Alert status="info" bg={bgValue} sx={{ width: '100%' }}>
      <Box sx={{ textAlign: 'start', width: '100%' }}>
        <AlertTitle sx={{ lineHeight: 1.2 }}>{title}</AlertTitle>
        {(description && (
          <AlertDescription textStyle={'Body-S'} color={'text'}>
            {description}
          </AlertDescription>
        )) ||
          undefined}
        {(children && <Box>{children}</Box>) || undefined}
      </Box>
    </Alert>
  )
}
