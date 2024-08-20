import { Key, ReactNode } from 'react'
import { AddIcon, CloseIcon } from '@chakra-ui/icons'
import {
  Accordion as ChackraAccordion,
  AccordionProps as ChackraAccordionProps,
  AccordionButton,
  AccordionButtonProps as ChackraAccordionButtonProps,
  AccordionItem,
  AccordionItemProps as ChackraAccordionItemProps,
  AccordionPanel,
  AccordionPanelProps as ChackraAccordionPanelProps,
  Box,
} from '@chakra-ui/react'

type DefaultStyleItemType = {
  fontSize: string
  height: string
  iconSize: string
}

type DefaultStylesTypes = {
  small: DefaultStyleItemType
  medium: DefaultStyleItemType
  large: DefaultStyleItemType
}

const DefaultStyles: DefaultStylesTypes = {
  small: {
    fontSize: 'sm',
    height: '11.25',
    iconSize: '11.25',
  },
  medium: {
    fontSize: 'base',
    height: '14',
    iconSize: '11.25',
  },
  large: {
    fontSize: 'lg',
    height: '15.5',
    iconSize: '11.25',
  },
}

interface ItemProps extends AccordionItemProps {
  defaultOpen: Boolean
}

export interface AccordionProps {
  accordionButtonProps?: ChackraAccordionButtonProps
  accordionItemProps?: ChackraAccordionItemProps
  accordionPanelProps?: ChackraAccordionPanelProps
  accordionProps?: ChackraAccordionProps
  items: ItemProps[]
  showLeftIcon?: boolean
  showRightIcon?: boolean
  size?: AccordionSize
}

export type AccordionItemProps = {
  label: string
  content?: ReactNode
  isDisabled?: boolean
  id: string
}

export type AccordionSize = 'small' | 'medium' | 'large'

export const Accordion = ({
  accordionButtonProps,
  accordionItemProps,
  accordionPanelProps,
  accordionProps,
  items = [],
  showLeftIcon = false,
  showRightIcon = true,
  size = 'medium',
}: AccordionProps) => {
  if (!items || items.length === 0) {
    return null
  }

  const defaultIndex = items.reduce(
    (arr: number[], item, idx) => (item.defaultOpen ? [...arr, idx] : arr),
    []
  )

  const renderLeftIcon = (fontSize: string) => (
    <AddIcon fontSize={fontSize} mr={4} />
  )

  const renderRightIcon = (isExpanded: boolean, fontSize: string) => {
    return isExpanded ? (
      <CloseIcon fontSize={fontSize} />
    ) : (
      <AddIcon fontSize={fontSize} />
    )
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      sx={{ width: '100%' }}
    >
      <ChackraAccordion
        allowToggle
        width="100%"
        marginTop={0}
        defaultIndex={defaultIndex}
        {...accordionProps}
        style={{ width: '100%' }}
      >
        {items.map((item) => {
          return (
            <AccordionItem
              isDisabled={item?.isDisabled ?? false}
              width="100%"
              key={item?.id}
              {...accordionItemProps}
            >
              {({ isExpanded }) => (
                <Box sx={{ width: '100%' }}>
                  <h2 style={{ width: '100%' }}>
                    <AccordionButton
                      width="100%"
                      height={DefaultStyles[size].height}
                      {...accordionButtonProps}
                    >
                      {showLeftIcon &&
                        renderLeftIcon(DefaultStyles[size].iconSize)}
                      <Box
                        flex="1"
                        textAlign="left"
                        textStyle={'Desktop/Default'}
                        sx={{ width: '100%' }}
                      >
                        {item?.label ?? ''}
                      </Box>
                      {showRightIcon &&
                        renderRightIcon(
                          isExpanded,
                          DefaultStyles[size].iconSize
                        )}
                    </AccordionButton>
                  </h2>
                  <AccordionPanel
                    width="100%"
                    pb={4}
                    textStyle={'Desktop/Body-S'}
                    {...accordionPanelProps}
                    sx={{ width: '100%' }}
                  >
                    {item?.content ?? ''}
                  </AccordionPanel>
                </Box>
              )}
            </AccordionItem>
          )
        })}
      </ChackraAccordion>
    </Box>
  )
}
