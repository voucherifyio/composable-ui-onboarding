import { CartSummaryItem } from '../cart'
import { useIntl } from 'react-intl'
import { VoucherForm } from '../forms/voucher-form'
import {
  Box,
  Flex,
  Tag,
  TagCloseButton,
  TagLabel,
  TagLeftIcon,
} from '@chakra-ui/react'
import { Price } from '../price'
import { MdDiscount } from 'react-icons/md'
import { useCart } from '../../hooks'
import { useState } from 'react'

export const CartVouchers = () => {
  const intl = useIntl()

  const [errorMessage, setErrorMessage] = useState<string>('')

  const { cart, deleteCartVoucher } = useCart({
    onCartVoucherAddError: (message) => {
      setErrorMessage(message || 'Could not add voucher')
    },
  })

  const vouchers = cart.vouchersApplied

  return (
    <>
      <CartSummaryItem
        label={intl.formatMessage({
          id: 'cart.summary.vouchers',
        })}
      />
      <VoucherForm />
      {vouchers?.map((voucher) => (
        <Flex
          key={voucher.code}
          justify="space-between"
          textStyle={{ base: 'Mobile/S', md: 'Desktop/S' }}
        >
          <Tag
            size="md"
            paddingRight={2}
            paddingLeft={2}
            borderRadius="sm"
            variant="outline"
            colorScheme="whiteAlpha"
          >
            <TagLeftIcon boxSize="12px" as={MdDiscount} />
            <TagLabel>{voucher.label}</TagLabel>
            <TagCloseButton
              onClick={() =>
                deleteCartVoucher.mutate({
                  cartId: cart.id || '',
                  code: voucher.code,
                })
              }
            />
          </Tag>
          <Box>
            <Price
              rootProps={{ textStyle: 'Body-S', color: 'green' }}
              price={`-${voucher.discountAmount}`}
            />
          </Box>
        </Flex>
      ))}
    </>
  )
}
