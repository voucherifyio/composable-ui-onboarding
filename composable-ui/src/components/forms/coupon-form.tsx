import * as yup from 'yup'
import { useIntl, IntlShape } from 'react-intl'
import { useForm } from 'react-hook-form'
import { Alert, AlertIcon, Box, HStack } from '@chakra-ui/react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useSession, signIn } from 'next-auth/react'
import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { IconButton } from '@chakra-ui/react'
import { ArrowForwardIcon } from '@chakra-ui/icons'
import { AccountForm, AccountPage } from '../account/account-drawer'
import { InputField } from '@composable/ui'
import { Tag, TagLabel, TagCloseButton } from '@chakra-ui/react'
import { useCart } from 'hooks'
export interface LoginFormProps {
  setAccountFormToShow?: React.Dispatch<React.SetStateAction<AccountForm>>
  signIn?: typeof signIn
  type?: AccountPage
}

export const CouponForm = ({
  signIn,
  type = AccountPage.PAGE,
  setAccountFormToShow,
}: LoginFormProps) => {
  const intl = useIntl()
  const [isError, setIsError] = useState(false)
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
      setError('coupon', { message: msg || 'Could not add coupon' })
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

  return (
    <Box>
      {isError && (
        <Alert mt="30px" status="error" borderRadius={'6px'}>
          <AlertIcon alignSelf={'flex-start'} />
          asdasdasd
        </Alert>
      )}
      <form
        role={'form'}
        onSubmit={handleSubmit(async (data) => {
          setIsError(false)
          setValue('coupon', '')
          // setError('coupon', {message: 'Could not add coupon' })
          await addCartCoupon.mutate({
            cartId: cart.id || '',
            coupon: data.coupon,
          })
        })}
      >
        <Box
          display={'flex'}
          flexDirection={'row'}
          alignItems={'center'}
          gap={3}
        >
          <InputField
            inputProps={{
              placeholder: content.input.coupon.placeholder,
              ...register('coupon'),
            }}
            error={errors.coupon}
            label={''}
          />

          <IconButton
            aria-label="Search database"
            icon={<ArrowForwardIcon />}
            type="submit"
            size="sm"
            variant={'outline'}
          />
        </Box>
      </form>
      <HStack spacing={4} marginTop={2}>
        {cart.redeemables?.map((redeemable) => (
          <Tag
            size="sm"
            paddingLeft={2}
            paddingRight={2}
            key={redeemable.id}
            borderRadius="md"
            variant="outline"
          >
            <TagLabel>{redeemable.id}</TagLabel>
            <TagCloseButton
              onClick={() =>
                deleteCartCoupon.mutate({
                  cartId: cart.id || '',
                  coupon: redeemable.id,
                })
              }
            />
          </Tag>
        ))}
      </HStack>
    </Box>
  )
}

const couponFormSchema = () => {
  return yup.object().shape({
    coupon: yup.string().required(),
  })
}
