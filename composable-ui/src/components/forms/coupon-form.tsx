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
  const { cart, addCartCoupon, deleteCartCoupon } = useCart()
  const intl = useIntl()
  const { data, status } = useSession()
  const [simulatingLoading, setSimulatingLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string; password: string }>({
    resolver: yupResolver(loginFormSchema({ intl })),
    mode: 'all',
  })

  const content = {
    ariaLabel: {
      signIn: intl.formatMessage({ id: 'account.login.title' }),
    },
    title: intl.formatMessage({ id: 'account.login.title' }),
    description: intl.formatMessage({ id: 'account.login.description' }),
    loginWithFacebook: intl.formatMessage({
      id: 'account.login.loginWithFacebook',
    }),
    loginWithGoogle: intl.formatMessage({
      id: 'account.login.loginWithGoogle',
    }),
    notAMemberYet: intl.formatMessage({ id: 'account.login.notAMemberYet' }),
    createAnAccount: intl.formatMessage({
      id: 'account.login.createAnAccount',
    }),
    or: intl.formatMessage({ id: 'text.or' }),
    input: {
      coupon: {
        label: intl.formatMessage({ id: 'cart.summary.label.coupon' }),
        placeholder: intl.formatMessage({ id: 'cart.summary.label.coupon' }),
      },
    },
    button: {
      login: intl.formatMessage({ id: 'action.addCoupon' }),
    },
    error: {
      incorrectSignIn: intl.formatMessage({
        id: 'account.login.error.incorrectSignIn',
      }),
    },
  }

  return (
    <Box>
      {isError && (
        <Alert mt="30px" status="error" borderRadius={'6px'}>
          <AlertIcon alignSelf={'flex-start'} />
          {content.error.incorrectSignIn}
        </Alert>
      )}
      <form
        role={'form'}
        aria-label={content.ariaLabel.signIn}
        onSubmit={handleSubmit(async (data) => {
          setIsError(false)
          setSimulatingLoading(true)

          addCartCoupon.mutate({ cartId: cart.id || '', coupon: data.email })
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
              ...register('email'),
            }}
            error={errors.email}
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
      {/* <pre>{JSON.stringify(cart, null,2)}</pre> */}
    </Box>
  )
}

const loginFormSchema = (deps: { intl: IntlShape }) => {
  const { intl } = deps
  return yup.object().shape({
    email: yup
      .string()
      .required(intl.formatMessage({ id: 'validation.emailRequired' })),
  })
}
