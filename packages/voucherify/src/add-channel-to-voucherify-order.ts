import { OrdersCreate } from '@voucherify/sdk'

const CHANNELS = ['Web B2B', 'App B2B']

export const addChannelToOrder = (order: OrdersCreate, channel?: string) => {
  if (!channel || !CHANNELS.includes(channel)) {
    return order
  }

  return {
    ...order,
    metadata: { ...(order?.metadata || {}), location_id: channel },
  }
}
