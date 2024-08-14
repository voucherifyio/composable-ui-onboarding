import { useLocalStorage, writeStorage } from 'utils/local-storage'

const LOCAL_STORAGE_CHANNEL = 'embol_channel_id'

export const CHANNELS = ['Web B2B', 'App B2B']

export const useChannel = () => {
  const [channel] = useLocalStorage(LOCAL_STORAGE_CHANNEL, CHANNELS[0])

  const updateChannel = (newChannel: string) => {
    if (!CHANNELS.includes(newChannel)) {
      throw new Error(
        '[useChannel][updateChannel] newChannel not from acceptable range'
      )
    }
    writeStorage(LOCAL_STORAGE_CHANNEL, newChannel)
  }

  return {
    updateChannel,
    channel,
  }
}
