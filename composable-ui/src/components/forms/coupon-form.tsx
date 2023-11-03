import * as yup from 'yup'
import { useIntl } from 'react-intl'
import { useForm } from 'react-hook-form'
import {
  Alert,
  AlertIcon,
  Box,
  Flex,
  TagLeftIcon,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useState } from 'react'
import { IconButton, Text } from '@chakra-ui/react'
import { ArrowForwardIcon } from '@chakra-ui/icons'
import { InputField } from '@composable/ui'
import { Tag, TagLabel, TagCloseButton } from '@chakra-ui/react'
import { useCart } from 'hooks'
import { Price } from 'components/price'
import { CartSummaryItem } from 'components/cart'
import { Icon } from '@chakra-ui/react'
import { MdDiscount } from 'react-icons/md'
import { displayValue } from '@tanstack/react-query-devtools/build/lib/utils'

export const CouponForm = () => {
  const intl = useIntl()
  const [errorMessage, setErrorMessage] = useState<false | string>(false)
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<{ coupon: string }>({
    resolver: yupResolver(couponFormSchema()),
    mode: 'all',
  })
  const { cart, addCartCoupon, deleteCartCoupon } = useCart({
    onCartCouponAddError: (msg) => {
      setErrorMessage(msg || 'Could not add coupon')
    },
  })

  const content = {
    input: {
      coupon: {
        label: intl.formatMessage({ id: 'cart.summary.label.coupon' }),
        placeholder: intl.formatMessage({ id: 'cart.summary.label.coupon' }),
      },
    },
    button: {
      login: intl.formatMessage({ id: 'action.addCoupon' }),
    },
  }

  const vouchers =
    cart.redeemables?.filter((redeemable) => redeemable.object === 'voucher') ||
    []

  return (
    <>
      <CartSummaryItem
        label={intl.formatMessage({
          id: 'cart.summary.couponCodes',
        })}
      ></CartSummaryItem>
      <form
        role={'form'}
        onSubmit={handleSubmit(async (data) => {
          setErrorMessage(false)

          // setError('coupon', {message: 'Could not add coupon' })
          await addCartCoupon.mutate({
            cartId: cart.id || '',
            coupon: data.coupon,
          })
          setValue('coupon', '')
        })}
      >
        <Box
          display={'flex'}
          flexDirection={'row'}
          alignItems={'flex-start'}
          justifyContent={'center'}
          height={'60px'}
          gap={3}
        >
          <InputField
            inputProps={{
              size: 'sm',
              fontSize: 'sm',
              placeholder: content.input.coupon.placeholder,
              ...register('coupon'),
            }}
            error={errors.coupon}
            label={''}
          />
          <IconButton
            mt={2}
            aria-label="Search database"
            icon={<ArrowForwardIcon />}
            type="submit"
            size="sm"
            variant={'outline'}
          />
        </Box>
        {errorMessage && (
          <Alert mt={2} status="warning" borderRadius={'6px'}>
            <AlertIcon alignSelf={'flex-start'} />
            {errorMessage}
          </Alert>
        )}
      </form>
      {vouchers.map((redeemable) => (
        <Flex
          key={redeemable.id}
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
            <TagLabel>{redeemable.label}</TagLabel>
            <TagCloseButton
              onClick={() =>
                deleteCartCoupon.mutate({
                  cartId: cart.id || '',
                  coupon: redeemable.id,
                })
              }
            />
          </Tag>
          <Box>
            <Price
              rootProps={{ textStyle: 'Body-S', color: 'green' }}
              price={`-${redeemable.discount}`}
            />
          </Box>
        </Flex>
      ))}
    </>
  )
}

const couponFormSchema = () => {
  return yup.object().shape({
    coupon: yup.string().required(),
  })
}
