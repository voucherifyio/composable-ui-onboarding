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

// Example usage
const filePaths = [
  '../../commerce-generic/src/services/cart/add-cart-item.ts',
  '../../commerce-generic/src/services/cart/delete-cart-item.ts',
  '../../commerce-generic/src/services/cart/discount.ts',
  '../../commerce-generic/src/services/cart/update-cart-item.ts',
  '../../commerce-generic/src/services/cart/get-cart.ts',
]
const filePathAddVoucher = [
  '../../commerce-generic/src/services/cart/add-voucher.ts',
]
const filePathDeleteVoucher = [
  '../../commerce-generic/src/services/cart/delete-voucher.ts',
]
const searchPhrase = "import { updateCartDiscount } from './discount'"
const replacePhrase =
  "import { updateCartDiscount } from '@composable/voucherify'"
const searchPhraseAddVoucher = "import { addVoucherToCart } from './discount'"
const replacePhraseAddVoucher =
  "import { addVoucherToCart } from '@composable/voucherify'"
const searchPhraseDeleteVoucher =
  "import { deleteVoucherFromCart } from './discount'"
const replacePhraseDeleteVoucher =
  "import { deleteVoucherFromCart } from '@composable/voucherify'"

processFiles(filePaths, searchPhrase, replacePhrase)
processFiles(
  filePathAddVoucher,
  searchPhraseAddVoucher,
  replacePhraseAddVoucher
)

processFiles(
  filePathDeleteVoucher,
  searchPhraseDeleteVoucher,
  replacePhraseDeleteVoucher
)

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

// Example usage
const packageJsonPath = '../../commerce-generic/package.json' // Replace with the actual path
const newDependencyName = '@composable/voucherify' // Replace with the actual package and version
const newDependencyVersion = 'workspace:*' // Replace with the actual package and version
updatePackageJson(packageJsonPath, newDependencyName, newDependencyVersion)
