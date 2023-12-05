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

export async function addVoucherifyToCreateOrderFile(
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

export async function updatePackageJson(
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

export async function removeVoucherifyFromCreateOrderFile(
  createOrderFilePath: string,
  importContent: string,
  updatePaidOrderContent: string
) {
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

export async function removeFromPackageJson(
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
