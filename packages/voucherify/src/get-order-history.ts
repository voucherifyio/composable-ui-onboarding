import { CustomerActivitiesListQueryParams } from '@voucherify/sdk'
import { getVoucherify } from './voucherify-config'

export const getCustomerOrderHistory = async (customerSourceId: string) => {
  try {
    const { data } = await getVoucherify().customers.listActivities(
      customerSourceId,
      {
        limit: 10,
        type: 'customer.order.paid',
      } as CustomerActivitiesListQueryParams & { type: string }
    )
    return data
  } catch (err) {
    return null
  }
}
