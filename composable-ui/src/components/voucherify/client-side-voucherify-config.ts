import { VoucherifyClientSide } from '@voucherify/sdk'
import {
  VOUCHERIFY_API_URL,
  VOUCHERIFY_CLIENT_APPLICATION_ID,
  VOUCHERIFY_CLIENT_SECRET_KEY,
} from '../../utils/constants'

export const getVoucherifyClientSide = () => {
  if (
    !VOUCHERIFY_API_URL ||
    !VOUCHERIFY_CLIENT_APPLICATION_ID ||
    !VOUCHERIFY_CLIENT_SECRET_KEY
  ) {
    throw new Error('[voucherify] Missing configuration')
  }

  return VoucherifyClientSide({
    clientApplicationId: VOUCHERIFY_CLIENT_APPLICATION_ID,
    clientSecretKey: VOUCHERIFY_CLIENT_SECRET_KEY,
    exposeErrorCause: true,
    apiUrl: VOUCHERIFY_API_URL,
    origin: window.location.origin,
  })
}
