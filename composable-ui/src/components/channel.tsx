import { Select } from '@chakra-ui/react'
import { useChannel, CHANNELS } from 'hooks/use-channel'

const Channel = () => {
  const { channel, updateChannel } = useChannel()
  return (
    <>
      <Select
        value={channel}
        size={'sm'}
        width={'150px'}
        onChange={(e) => updateChannel(e.target.value)}
        color='#000'
        backgroundColor='#FFF'
      >
        {CHANNELS.map((channel) => (
          <option key={channel} value={channel}>
            {channel}
          </option>
        ))}
      </Select>
    </>
  )
}

export default Channel
