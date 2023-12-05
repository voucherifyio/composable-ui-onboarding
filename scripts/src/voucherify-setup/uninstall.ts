import {
  processFiles,
  removeFromPackageJson,
  removeVoucherifyFromCreateOrderFile,
} from './operations'

// Usage
// Replace Voucherify usage with classic usage
const filePaths = [
  '../../../packages/commerce-generic/src/services/cart/add-cart-item.ts',
  '../../../packages/commerce-generic/src/services/cart/delete-cart-item.ts',
  '../../../packages/commerce-generic/src/services/cart/discount.ts',
  '../../../packages/commerce-generic/src/services/cart/update-cart-item.ts',
  '../../../packages/commerce-generic/src/services/cart/get-cart.ts',
  '../../../packages/commerce-generic/src/services/cart/delete-voucher.ts',
  '../../../packages/commerce-generic/src/services/cart/add-voucher.ts',
]

const replacePhrase = "from './discount'"
const searchPhrase = "from '@composable/voucherify'"

processFiles(filePaths, searchPhrase, replacePhrase)

// Remove Voucherify implementation from create order
const createOrderFilePath =
  '../../../packages/commerce-generic/src/services/checkout/create-order.ts'
const importContent = "import { orderPaid } from '@composable/voucherify'\n"
const updatePaidOrderContent =
  '  \n  // V%\n' +
  "  updatedOrder.payment = 'paid'\n" +
  '  await orderPaid(updatedOrder)'

removeVoucherifyFromCreateOrderFile(
  createOrderFilePath,
  importContent,
  updatePaidOrderContent
)

// Remove Voucherify from package.json
const packageJsonPath = '../../../packages/commerce-generic/package.json' // Replace with the actual path
const dependencyToRemove = '@composable/voucherify' // Replace with the actual package and version
removeFromPackageJson(packageJsonPath, dependencyToRemove)
