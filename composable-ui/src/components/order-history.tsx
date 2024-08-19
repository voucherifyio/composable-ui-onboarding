import React from 'react'
import { Badge, Container, Flex, Kbd, Tag, Text } from '@chakra-ui/react'
import { useIntl } from 'react-intl'
import { NextSeo } from 'next-seo'
import { useQuery } from '@tanstack/react-query'
import { api } from 'utils/api'
import { useSession } from 'next-auth/react'
import { useChannel } from 'hooks/use-channel'
import dayjs from 'dayjs'

const USER_ORDER_HISTORY_KEY = 'useOrderHistory'

type ProductItem = {
  amount: number
  object: 'order_item'
  price: number
  product: {
    name: string
    price: number
  }
  product_id: string
  quantity: number
  sku: { sku: string }
  sku_id: string
  subtotal_amount: number
}

export const OrderHistory = () => {
  const { data: session, status } = useSession()
  const { channel } = useChannel()
  const { client } = api.useContext()
  const { data: historyData } = useQuery(
    [USER_ORDER_HISTORY_KEY],
    async () => {
      const response = await client.commerce.getOrderHistory.query({
        customerSourceId: session?.user?.email || '',
        channel,
      })
      return response
    },
    {
      enabled: status === 'authenticated',
      retry: false,
      keepPreviousData: true,
    }
  )
  const intl = useIntl()
  const title = intl.formatMessage({
    id: 'account.dashboard.menu.orderHistory',
  })

  if (status === 'unauthenticated' || !session?.loggedIn) {
    return (
      <Container
        maxW="container.xl"
        py={{ base: '8', md: '8' }}
        px={{ base: '2' }}
        width={'100%'}
      >
        <Text textAlign={'center'}>
          You are not logged in. Please login to see your order history.
        </Text>
      </Container>
    )
  }

  if (!historyData || historyData?.length <= 0) {
    return (
      <Container
        maxW="container.xl"
        py={{ base: '8', md: '8' }}
        px={{ base: '2' }}
        width={'100%'}
      >
        <Text textAlign={'center'}>
          Your order history is empty. Place an order to view your order
          history.
        </Text>
      </Container>
    )
  }

  return (
    <Container
      maxW="container.xl"
      py={{ base: '4', md: '8' }}
      px={{ base: '2' }}
      width={'100%'}
    >
      <NextSeo title={title} noindex nofollow />

      <Flex
        gap={{ base: '0.5rem', md: '0.625rem' }}
        mb={'1.5rem'}
        alignItems={'baseline'}
      >
        <Text
          textStyle={{ base: 'Mobile/L', md: 'Desktop/L' }}
          color={'shading.700'}
        >
          {title}
        </Text>
      </Flex>
      <Flex direction={'column'} gap={2} width={'100%'}>
        {historyData?.map(({ data }, i) => (
          <Flex
            direction={'column'}
            gap={2}
            key={i}
            border={'1px solid 	#A9A9A9'}
            width={'100%'}
            borderRadius={4}
            px={2}
            py={3}
          >
            <Flex
              width={'100%'}
              justifyContent={'space-between'}
              alignItems={'center'}
            >
              <Text fontSize={'14px'} fontWeight={'700'}>
                Order ID: <Tag variant={'solid'}>{data.order.id}</Tag>
              </Text>
              <Text fontSize={'14px'} fontWeight={'700'}>
                {data.order.metadata?.location_id || '-'}
              </Text>
            </Flex>
            <Flex
              width={'100%'}
              justifyContent={'space-between'}
              alignItems={'center'}
            >
              <Text fontSize={'14px'} fontWeight={'700'}>
                Total amount:{' '}
                <Badge variant={'outline'}>
                  ${(data.order.total_amount / 100).toFixed(2)}
                </Badge>
              </Text>
              <Text fontSize={'14px'} fontWeight={'700'}>
                Status:{' '}
                <Badge variant={'solid'} backgroundColor={'green'}>
                  {data.order.status}
                </Badge>
              </Text>
            </Flex>
            <Flex width={'100%'} gap={2}>
              <Text fontSize={'14px'} fontWeight={'700'}>
                Created at
              </Text>
              <Text fontSize={'14px'}>
                {dayjs(data.created_at).format('MM-DD-YYYY hh:mm:ss')}
              </Text>
            </Flex>
            <Text fontSize={'14px'} fontWeight={700}>
              Products:
            </Text>
            {data.order.items?.map((item: ProductItem, i: number) => (
              <Flex
                key={i}
                justifyContent={'space-between'}
                direction={'column'}
                gap={2}
              >
                <Flex justifyContent={'space-between'} alignItems={'center'}>
                  <Kbd fontSize={'14px'}>
                    {i + 1}. {item.product.name || 'No product name'}
                  </Kbd>
                  <Badge variant={'outline'} fontSize={'14px'}>
                    ${(item.price / 100).toFixed(2)}
                  </Badge>
                </Flex>
                <Flex
                  justifyContent={'space-between'}
                  alignItems={'flex-start'}
                  direction={'column'}
                >
                  <Text fontSize={'14px'} fontWeight={'700'}>
                    Product ID:
                  </Text>
                  <Tag variant={'solid'}>{item.product_id}</Tag>
                </Flex>
                <Flex justifyContent={'space-between'}>
                  <Text fontSize={'14px'} fontWeight={'700'}>
                    {item.sku?.sku || item.sku_id}
                  </Text>
                  <Text fontSize={'14px'} fontWeight={'700'}>
                    Quantity: <span>{item.quantity}</span>
                  </Text>
                </Flex>
              </Flex>
            )) || <Text fontSize={'14px'}>No products</Text>}
          </Flex>
        ))}
      </Flex>
    </Container>
  )
}
