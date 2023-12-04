import * as fs from 'fs/promises'
import * as path from 'path'

// Functions
export async function replaceInFile(
  filePath: string,
  searchPhrase: string,
  replacePhrase: string
): Promise<void> {
  try {
    // Read the content of the file
    const fullPath = path.join(__dirname, filePath) // assuming file paths are relative to the script's directory
    const data = await fs.readFile(fullPath, 'utf8')

    // Replace the search phrase with the replacement phrase
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

export async function processFiles(
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

async function addVoucherifyImplementationToCreateOrderFile(
  createOrderFilePath: string,
  importContent: string,
  updatePaidOrderContent: string,
  searchedText: string
) {
  try {
    const fullPath = path.join(__dirname, createOrderFilePath)
    const data = await fs.readFile(fullPath, 'utf8')
    const dataWithImportAdded = importContent.concat(data)

    const updatedContent = dataWithImportAdded.replace(
      searchedText,
      (match) => {
        return match + updatePaidOrderContent
      }
    )

    await fs.writeFile(fullPath, updatedContent, 'utf8')
    console.log(`Replacement complete in ${fullPath}`)
  } catch (err) {
    console.error(`Error: ${err}`)
  }
}

async function updatePackageJson(
  packageJsonPath: string,
  newDependency: string,
  newDependencyVersion: string
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
    packageJson.dependencies[newDependency] = newDependencyVersion // Replace 'newDependency' with the actual package name

    // Save the updated package.json file
    await fs.writeFile(fullPath, JSON.stringify(packageJson, null, 2), 'utf8')

    console.log(`Dependency added to package.json: ${newDependency}`)
  } catch (err) {
    console.error(`Error: ${err}`)
  }
}

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

addVoucherifyImplementationToCreateOrderFile(
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
