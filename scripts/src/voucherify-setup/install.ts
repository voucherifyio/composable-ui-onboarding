import {
  addVoucherifyToCreateOrderFile,
  processFiles,
  updatePackageJson,
} from './operations'

// Usage
// Replace classic usage with Voucherify usage
const filePaths = [
  '../../../packages/commerce-generic/src/services/cart/add-cart-item.ts',
  '../../../packages/commerce-generic/src/services/cart/delete-cart-item.ts',
  '../../../packages/commerce-generic/src/services/cart/discount.ts',
  '../../../packages/commerce-generic/src/services/cart/update-cart-item.ts',
  '../../../packages/commerce-generic/src/services/cart/get-cart.ts',
  '../../../packages/commerce-generic/src/services/cart/delete-voucher.ts',
  '../../../packages/commerce-generic/src/services/cart/add-voucher.ts',
]

const searchPhrase = "from './discount'"
const replacePhrase = "from '@composable/voucherify'"

processFiles(filePaths, searchPhrase, replacePhrase)

// Add Voucherify implementation to create order
const createOrderFilePath =
  '../../../packages/commerce-generic/src/services/checkout/create-order.ts'
const importContent = "import { orderPaid } from '@composable/voucherify'\n"
const updatePaidOrderContent =
  '  \n  // V%\n' +
  "  updatedOrder.payment = 'paid'\n" +
  '  await orderPaid(updatedOrder)'
const searchedText =
  'const updatedOrder = generateOrderFromCart(cart, checkout)'

addVoucherifyToCreateOrderFile(
  createOrderFilePath,
  importContent,
  updatePaidOrderContent,
  searchedText
)

// Add Voucherify to package.json
const packageJsonPath = '../../../packages/commerce-generic/package.json' // Replace with the actual path
const newDependencyName = '@composable/voucherify' // Replace with the actual package and version
const newDependencyVersion = 'workspace:*' // Replace with the actual package and version
updatePackageJson(packageJsonPath, newDependencyName, newDependencyVersion)
