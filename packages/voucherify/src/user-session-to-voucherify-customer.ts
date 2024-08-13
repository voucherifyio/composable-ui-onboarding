import {  UserSession } from '@composable/types'
import { Customer as VoucherifyCustomer } from '@voucherify/sdk'

export const userSessionToVoucherifyCustomer = (user: UserSession): VoucherifyCustomer => {
  return {
    source_id: user.sourceId || undefined,
    email: user.email || undefined,
    id: user.voucherifyId || undefined,
  }
}
