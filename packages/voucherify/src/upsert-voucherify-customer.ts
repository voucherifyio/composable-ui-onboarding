
import { voucherify } from './voucherify-config'
import { CustomerObject } from '@voucherify/sdk/dist/types/Customers'

export const upsertVoucherifyCustomer = async (email:string):Promise<CustomerObject> => await voucherify.customers.create({
    source_id: email,
    email: email,
  }) as CustomerObject
