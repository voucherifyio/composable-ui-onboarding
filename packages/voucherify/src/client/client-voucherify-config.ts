import { VoucherifyClientSide } from '@voucherify/sdk'


export const getVoucherifyClient = () => {
  if (
    !process.env.VOUCHERIFY_API_URL ||
    !process.env.NEXT_PUBLIC_VOUCHERIFY_CLIENT_APPLICATION_ID ||
    !process.env.NEXT_PUBLIC_VOUCHERIFY_CLIENT_SECRET_KEY
  ) {
    throw new Error('[voucherify] Missing configuration')
  }

  return VoucherifyClientSide({
    clientApplicationId: process.env.NEXT_PUBLIC_VOUCHERIFY_CLIENT_APPLICATION_ID,
    clientSecretKey: process.env.NEXT_PUBLIC_VOUCHERIFY_CLIENT_SECRET_KEY,
    exposeErrorCause: true,
    apiUrl: process.env.VOUCHERIFY_API_URL,
    customHeaders: { channel: 'Browser-ComposableUI' },
    origin: window.location.origin,
  })
}
