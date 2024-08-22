import { VoucherifyServerSide } from '@voucherify/sdk'
import {
  NEXT_PUBLIC_VOUCHERIFY_API_URL,
  VOUCHERIFY_APPLICATION_ID,
  VOUCHERIFY_SECRET_KEY,
} from './config'

export const voucherifyClient = VoucherifyServerSide({
  applicationId: VOUCHERIFY_APPLICATION_ID,
  secretKey: VOUCHERIFY_SECRET_KEY,
  exposeErrorCause: true,
  apiUrl: NEXT_PUBLIC_VOUCHERIFY_API_URL,
  channel: 'ComposableUI',
})
