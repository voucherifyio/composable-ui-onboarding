import { Box, BoxProps } from '@chakra-ui/react'
import { useIntl } from 'react-intl'
import { APP_CONFIG } from 'utils/constants'

export interface PriceProps {
  rootProps?: BoxProps
  price?: number | string
  displayAlways?: boolean
}

export const Price = ({ rootProps, price, displayAlways }: PriceProps) => {
  const intl = useIntl()

  if (!price && !displayAlways) {
    return null
  }

  if (typeof price === 'number') {
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

  const value = parseFloat(price || '')
  return (
    <Box {...rootProps}>
      {Number.isNaN(value)
        ? price
        : intl.formatNumber(value, {
            currency: APP_CONFIG.CURRENCY_CODE,
            style: 'currency',
          })}
    </Box>
  )
}
