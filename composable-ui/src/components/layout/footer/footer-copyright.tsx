import {
  Box,
  ButtonGroup,
  Flex,
  IconButton,
  Stack,
  Text,
} from '@chakra-ui/react'
import { FaInstagramSquare, FaTwitter, FaYoutube } from 'react-icons/fa'

export interface CopyrightFooterProps {
  copyrightText?: string
}

export const CopyrightFooter = ({ copyrightText }: CopyrightFooterProps) => {
  return (
    <Stack
      pb="2"
      justify="center"
      direction={{ base: 'column-reverse', md: 'row' }}
      align="center"
    >
      <Text fontSize="sm" color="#f40008" fontWeight="600" sx={{ mb: 2 }}>
        {copyrightText}
      </Text>

      {/* <ButtonGroup variant="ghost">
        <IconButton
          as="a"
          href="#"
          aria-label="Instagram"
          icon={<FaInstagramSquare fontSize="1.25rem" />}
        />
        <IconButton
          as="a"
          href="#"
          aria-label="Twitter"
          icon={<FaTwitter fontSize="1.25rem" />}
        />
        <IconButton
          as="a"
          href="#"
          aria-label="YouTube"
          icon={<FaYoutube fontSize="1.25rem" />}
        />
      </ButtonGroup> */}
    </Stack>
  )
}
