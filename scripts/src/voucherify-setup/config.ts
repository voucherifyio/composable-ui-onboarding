import { config } from 'dotenv'
config()

export const NEXT_PUBLIC_VOUCHERIFY_API_URL =
  process.env.NEXT_PUBLIC_VOUCHERIFY_API_URL
export const VOUCHERIFY_APPLICATION_ID = process.env.VOUCHERIFY_APPLICATION_ID
export const VOUCHERIFY_SECRET_KEY = process.env.VOUCHERIFY_SECRET_KEY
