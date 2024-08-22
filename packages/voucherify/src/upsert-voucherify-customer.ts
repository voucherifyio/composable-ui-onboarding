import { getVoucherify } from './voucherify-config'
import { CustomerObject } from '@voucherify/sdk/dist/types/Customers'

export const upsertVoucherifyCustomer = async (
  email: string
): Promise<CustomerObject> =>
  (await getVoucherify().customers.create({
    source_id: email,
    email: email,
  })) as CustomerObject
