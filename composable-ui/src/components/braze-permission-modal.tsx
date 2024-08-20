import { Box, Button, Text } from '@chakra-ui/react'
import { BrazeInstance } from 'hooks'
import { FC, useState } from 'react'

type BrazePermissionModalProps = {
  braze: BrazeInstance | undefined
}

const BrazePermissionModal: FC<BrazePermissionModalProps> = ({ braze }) => {
  const [isOpen, setIsOpen] = useState(true)

  if (isOpen)
    return (
      <Box
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#fff',
          zIndex: 999,
          padding: '20px',
          boxShadow: '0px 0px 30px 10px rgba(191, 189, 189, 1)',
          width: '90%',
          maxWidth: '400px',
        }}
      >
        <Text style={{ fontWeight: 700 }}>
          Allow Braze to send you notifications?
        </Text>
        <Box
          style={{
            display: 'flex',
            width: '100%',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '20px',
          }}
        >
          <Button
            backgroundColor={'green'}
            _hover={{ bg: 'green' }}
            onClick={() => {
              braze?.requestPushPermission()
              braze?.openSession()
              setIsOpen(false)
            }}
          >
            Allow
          </Button>
          <Button
            backgroundColor={'#000'}
            _hover={{ bg: '#000' }}
            onClick={() => {
              localStorage.setItem('notifications', 'denied')
              setIsOpen(false)
            }}
          >
            Don&apos;t allow
          </Button>
        </Box>
      </Box>
    )
  return null
}

export default BrazePermissionModal
