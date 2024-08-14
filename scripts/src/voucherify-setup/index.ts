import { voucherifyClient } from './voucherify'
import {
  NEXT_PUBLIC_VOUCHERIFY_API_URL,
  VOUCHERIFY_APPLICATION_ID,
  VOUCHERIFY_SECRET_KEY,
} from './config'
import _ from 'lodash'

import products from '../../../packages/commerce-generic/src/data/products.json'

const VOUCHERIFY_KEYS = [
  NEXT_PUBLIC_VOUCHERIFY_API_URL,
  VOUCHERIFY_APPLICATION_ID,
  VOUCHERIFY_SECRET_KEY,
]
const voucherifyKeysMissing = VOUCHERIFY_KEYS.some((key) => !key)

const voucherifySetup = async () => {
  console.log('Starting setting up Voucherify!')
  try {
    if (voucherifyKeysMissing) {
      console.error(
        'You are missing some Voucherify keys in your .env file.',
        `You must set the following:NEXT_PUBLIC_VOUCHERIFY_API_URL, VOUCHERIFY_APPLICATION_ID, VOUCHERIFY_SECRET_KEY.`
      )
      throw new Error('VOUCHERIFY_MISSING_KEYS')
    }

    for (const product of products) {
      const createdProduct = await voucherifyClient.products.create({
        name: product.name,
        source_id: product.id,
        price: product.price * 100,
        image_url: product.images[0].url,
        metadata: _.omit(product, [
          'name',
          'source_id',
          'price',
          'image_url',
          'images',
        ]),
      })
      const createdSKU = await voucherifyClient.products.createSku(
        createdProduct.id,
        {
          sku: product.sku,
          source_id: product.sku,
        }
      )

      console.log(`Created product ${product.id} and sku ${createdSKU.id}`)
    }

    console.log('Finished setting up Voucherify!')
  } catch (err) {
    console.error(err.message)
    throw err
  }
}

;(async () => {
  await voucherifySetup()
})()
