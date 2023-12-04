import * as fs from 'fs/promises'
import * as path from 'path'

async function replaceInFile(
  filePath: string,
  searchPhrase: string,
  replacePhrase: string
): Promise<void> {
  try {
    // Read the content of the file
    const fullPath = path.join(__dirname, filePath) // assuming file paths are relative to the script's directory
    const data = await fs.readFile(fullPath, 'utf8')

    // Replace the search phrase with the replace phrase
    const updatedContent = data.replace(
      new RegExp(searchPhrase, 'g'),
      replacePhrase
    )

    // Write the updated content back to the file
    await fs.writeFile(fullPath, updatedContent, 'utf8')

    console.log(`Replacement complete in ${fullPath}`)
  } catch (err) {
    console.error(`Error: ${err}`)
  }
}

async function processFiles(
  filePaths: string[],
  searchPhrase: string,
  replacePhrase: string
): Promise<void> {
  try {
    for (const filePath of filePaths) {
      await replaceInFile(filePath, searchPhrase, replacePhrase)
    }
  } catch (err) {
    console.error(`Error: ${err}`)
  }
}

async function removeVoucherifyImplementationFromCreateOrderFile() {
  const createOrderFilePath =
    '../../../packages/commerce-generic/src/services/checkout/create-order.ts'
  const importContent = "import { orderPaid } from '@composable/voucherify'\n"
  const updatePaidOrderContent =
    '  \n  // V%\n' +
    "  updatedOrder.payment = 'paid'\n" +
    '  await orderPaid(updatedOrder)'
  const searchedText =
    'const updatedOrder = generateOrderFromCart(cart, checkout)'

  try {
    const fullPath = path.join(__dirname, createOrderFilePath)
    const data = await fs.readFile(fullPath, 'utf8')
    const dataWithImportRemoved = data.replace(importContent, '')

    const updatedContent = dataWithImportRemoved.replace(
      updatePaidOrderContent,
      ''
    )
    await fs.writeFile(fullPath, updatedContent, 'utf8')
    console.log(`Replacement complete in ${fullPath}`)
  } catch (err) {
    console.error(`Error: ${err}`)
  }
}

// Example usage
const filePaths = [
  '../../../packages/commerce-generic/src/services/cart/add-cart-item.ts',
  '../../../packages/commerce-generic/src/services/cart/delete-cart-item.ts',
  '../../../packages/commerce-generic/src/services/cart/discount.ts',
  '../../../packages/commerce-generic/src/services/cart/update-cart-item.ts',
  '../../../packages/commerce-generic/src/services/cart/get-cart.ts',
  '../../../packages/commerce-generic/src/services/cart/delete-voucher.ts',
  '../../../packages/commerce-generic/src/services/cart/add-voucher.ts',
  '../../../packages/commerce-generic/src/services/checkout/create-order.ts',
]

const replacePhrase = "from './discount'"
const searchPhrase = "from '@composable/voucherify'"

processFiles(filePaths, searchPhrase, replacePhrase)

// Remove Voucherify implementation from create order
removeVoucherifyImplementationFromCreateOrderFile()

async function removeFromPackageJson(
  packageJsonPath: string,
  dependency: string
): Promise<void> {
  try {
    // Load the package.json file
    const fullPath = path.join(__dirname, packageJsonPath)
    const packageJsonContent = await fs.readFile(fullPath, 'utf8')
    const packageJson = JSON.parse(packageJsonContent)

    // Add the new dependency
    if (!packageJson.dependencies) {
      packageJson.dependencies = {}
    }
    packageJson.dependencies = Object.fromEntries(
      Object.entries(packageJson.dependencies).filter(
        ([key, val]) => key !== dependency
      )
    )

    // Save the updated package.json file
    await fs.writeFile(fullPath, JSON.stringify(packageJson, null, 2), 'utf8')

    console.log(`Dependency removed from package.json: ${dependency}`)
  } catch (err) {
    console.error(`Error: ${err}`)
  }
}

// Example usage
const packageJsonPath = '../../../packages/commerce-generic/package.json' // Replace with the actual path
const dependencyToRemove = '@composable/voucherify' // Replace with the actual package and version
removeFromPackageJson(packageJsonPath, dependencyToRemove)
