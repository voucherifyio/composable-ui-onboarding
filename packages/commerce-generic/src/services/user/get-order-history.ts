import { CommerceService } from '@composable/types'
import { getCustomerOrderHistory } from '@composable/voucherify'

export const getOrderHistory: CommerceService['getOrderHistory'] = async ({
  customerSourceId,
  channel,
  user,
}) => getCustomerOrderHistory(customerSourceId)
