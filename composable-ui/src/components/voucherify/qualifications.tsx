import { useCart } from '../../hooks'
import { Product, UserSession } from '@composable/types'
import { useSession } from 'next-auth/react'
import { ReactNode, useEffect, useState } from 'react'
import {
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
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { lineHeights } from '@composable/ui/src/chakra/theme/foundations/typography'
import { useQuery } from '@tanstack/react-query'

export const Qualifications = ({ product }: { product?: Product }) => {
  const { cart } = useCart()
  const { data: session } = useSession()

  if (product && session) {
    return <QualificationsProduct product={product} user={session?.user} />
  }

  console.log({ cart })
  console.log({ session })
  console.log({ product })
  return <></>
}

export const QualificationsProduct = ({
  product,
  user,
}: {
  product: Product
  user: UserSession | undefined
}) => {
  const { data: qualificationsRedeemables } = useQuery(
    [user],
    async () => {
      const voucherify = getVoucherifyClientSide()
      const items = [
        itemToVoucherifyItem(generateCartItem(product.id, 1, product)),
      ]
      return (
        (
          await voucherify.qualifications({
            order: {
              amount: items[0].amount,
              items,
            },
            customer: user ? userSessionToVoucherifyCustomer(user) : undefined,
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
      )
    },
    {
      retry: false,
      keepPreviousData: false,
    }
  )
  if (!qualificationsRedeemables?.length) {
    return null
  }

  const getAccordionItem = (
    qualificationsRedeemables: QualificationsRedeemable[]
  ) => {
    return {
      defaultOpen: true,
      label: 'Discounts related to the products',
      content: (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {qualificationsRedeemables.map((redeemable) => (
            <SimpleAlertBox
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
      id: product.id,
    }
  }

  return (
    <Accordion
      size="medium"
      items={[getAccordionItem(qualificationsRedeemables)]}
      accordionProps={{
        allowToggle: false,
        allowMultiple: true,
      }}
      accordionItemProps={{ border: 'none' }}
      accordionPanelProps={{ px: 0 }}
      accordionButtonProps={{
        px: 0,
        borderBottomWidth: '1px',
      }}
    />
  )
}

export const SimpleAlertBox = ({
  description,
  title,
}: {
  title: ReactNode
  description: ReactNode
}) => {
  const bgValue = useColorModeValue('info.100', 'info.700')

  return (
    <Alert status="info" bg={bgValue}>
      <Box>
        <AlertTitle sx={{ lineHeight: 1.2 }}>{title}</AlertTitle>
        {(description && (
          <AlertDescription textStyle={'Body-S'} color={'text'}>
            {description}
          </AlertDescription>
        )) ||
          undefined}
      </Box>
    </Alert>
  )
}