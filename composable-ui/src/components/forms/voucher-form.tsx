import { Alert, AlertIcon, Box, IconButton } from '@chakra-ui/react'
import { useIntl } from 'react-intl'
import { InputField } from '@composable/ui'
import { ArrowForwardIcon } from '@chakra-ui/icons'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useCart } from '../../hooks'
import { useState } from 'react'

export const VoucherForm = () => {
  const intl = useIntl()
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<{ voucher: string }>({
    resolver: yupResolver(voucherFormSchema()),
    mode: 'all',
  })

  const [errorMessage, setErrorMessage] = useState<string>('')

  const { cart, addCartVoucher } = useCart({
    onCartVoucherAddError: (message) => {
      setErrorMessage(message || 'Could not add voucher')
    },
  })

  const content = {
    title: intl.formatMessage({ id: 'cart.summary.vouchers' }),
    input: {
      voucher: {
        label: intl.formatMessage({ id: 'cart.summary.label.voucher' }),
        placeholder: intl.formatMessage({ id: 'cart.summary.label.voucher' }),
      },
    },
    button: {
      login: intl.formatMessage({ id: 'action.addVoucher' }),
    },
  }
  return (
    <form
      role={'form'}
      aria-label={content.title}
      onSubmit={handleSubmit(async (data) => {
        setErrorMessage('')
        if (!data.voucher) {
          setError('voucher', { message: 'This field cannot be empty.' })
          return
        }
        await addCartVoucher.mutate({
          cartId: cart.id || '',
          code: data.voucher,
        })
        setValue('voucher', '')
      })}
    >
      <Box
        display={'flex'}
        flexDirection={'row'}
        alignItems={'flex-start'}
        justifyContent={'center'}
        height={'3.7em'}
        gap={3}
      >
        <InputField
          inputProps={{
            size: 'sm',
            fontSize: 'sm',
            placeholder: content.input.voucher.placeholder,
            ...register('voucher'),
          }}
          error={errors.voucher}
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
        <Alert
          mt={1}
          status="warning"
          borderRadius={'6px'}
          p={'0.4rem'}
          m={'0'}
          fontSize={'14px'}
        >
          <AlertIcon alignSelf={'flex-start'} />
          {errorMessage}
        </Alert>
      )}
    </form>
  )
}

const voucherFormSchema = () => {
  return yup.object().shape({
    coupon: yup.string(),
  })
}
