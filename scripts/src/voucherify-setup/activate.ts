import {
  addVoucherifyToCreateOrderFile,
  replaceInFiles,
  addDependencyToPackage,
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

replaceInFiles(filePaths, searchPhrase, replacePhrase)

// Add Voucherify implementation to create order
const createOrderFilePath =
  '../../../packages/commerce-generic/src/services/checkout/create-order.ts'
const importContent = "import { orderPaid } from '@composable/voucherify'\n"
const commentContent =
  '  /* Redemptions using Voucherify should only be performed when we receive information that the payment was successful. \n' +
  "  In this situation, the ‘payment’ property is always set as 'unpaid' (in 'generateOrderFromCart'), \n" +
  "  so to simulate the correct behavior, the ‘payment’ value was changed here to 'paid' and the ‘orderPaid’ function was called to trigger the redemptions process.*/"
const updatePaidOrderContent =
  `\n${commentContent} \n` +
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
addDependencyToPackage(packageJsonPath, newDependencyName, newDependencyVersion)
