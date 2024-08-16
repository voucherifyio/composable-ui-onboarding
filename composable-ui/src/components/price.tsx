import { Box, BoxProps } from '@chakra-ui/react'
import { useIntl } from 'react-intl'
import { APP_CONFIG } from 'utils/constants'

export interface PriceProps {
  rootProps?: BoxProps
  price?: number
}

export const Price = ({ rootProps, price }: PriceProps) => {
  const intl = useIntl()

  if (!price) {
    return null
  }

  return (
    <Box {...rootProps}>
      {Number.isNaN(price)
        ? price
        : intl.formatNumber(price, {
            currency: APP_CONFIG.CURRENCY_CODE,
            style: 'currency',
          })}
    </Box>
  )
}
