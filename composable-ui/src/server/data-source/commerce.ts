import { commerceGenericDataSource } from '@composable/commerce-generic'
import { commerceWithDiscount } from '@composable/voucherify'

export default commerceWithDiscount(commerceGenericDataSource)
