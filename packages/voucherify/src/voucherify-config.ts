import { VoucherifyServerSide } from '@voucherify/sdk'

export const getVoucherify = () => {
  if (
    !process.env.VOUCHERIFY_APPLICATION_ID ||
    !process.env.VOUCHERIFY_SECRET_KEY ||
    !process.env.NEXT_PUBLIC_VOUCHERIFY_API_URL
  ) {
    throw new Error('[voucherify] Missing configuration')
  }

  return VoucherifyServerSide({
    applicationId: process.env.VOUCHERIFY_APPLICATION_ID,
    secretKey: process.env.VOUCHERIFY_SECRET_KEY,
    exposeErrorCause: true,
    apiUrl: process.env.NEXT_PUBLIC_VOUCHERIFY_API_URL,
    channel: `ComposableUI${
      process.env.NODE_ENV !== 'production' ? ' - dev' : ''
    }`,
  })
}
