import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { useIntl } from 'react-intl'
import {
  Box,
  Heading,
  Text,
  Container,
  Skeleton,
  Divider,
  SkeletonText,
  Button,
  CreateToastFnReturn,
} from '@chakra-ui/react'
import { SimpleAlertBox } from './voucherify/qualifications'
import { useCart, useToast } from '../hooks'
import { useCustomer, WalletStatus } from '../hooks/use-customer'
import { ExtendedRedeemable } from '@composable/voucherify'
import { Accordion } from '@composable/ui'
import { undefined } from 'zod'

export const WalletPage = () => {
  const intl = useIntl()
  const router = useRouter()
  const title = intl.formatMessage({ id: 'walletPage.title' })
  const { cart } = useCart()
  const {
    redeemablesByCampaignType,
    refereeRedeemables,
    refererRedeemables,
    status: walletStatus,
  } = useCustomer()
  const toast = useToast()

  return (
    <Container maxW="container.xl" py={{ base: '4', md: '8' }}>
      <NextSeo title={title} noindex nofollow />

      <Box
        textAlign="center"
        display="flex"
        flexDirection="column"
        justifyContent="center"
      >
        <Heading size="md" mb={3}>
          {title}
        </Heading>
        <Text sx={{ mb: 4 }}>
          {intl.formatMessage({ id: 'walletPage.description' })}
        </Text>
        {walletStatus === WalletStatus.IS_LOADING ? (
          <Box my={{ base: '8', md: '12' }}>
            <Box display="flex">
              <Skeleton flex="1" height="110px" />
            </Box>
          </Box>
        ) : walletStatus === WalletStatus.LOADED ? (
          <>
            {(Object.values(redeemablesByCampaignType).length === 0 &&
              '*found nothing, if you area expecting to see something here please contact customer service*') ||
              undefined}
            {redeemablesByCampaignType?.LOYALTY_PROGRAM && (
              <PrintRedeemables
                extendedRedeemables={redeemablesByCampaignType?.LOYALTY_PROGRAM}
                title={'Loyalty cards'}
                toast={toast}
              />
            )}
            {(refereeRedeemables.length > 0 && (
              <PrintRedeemables
                extendedRedeemables={refereeRedeemables}
                title={'Referee vouchers'}
                toast={toast}
              />
            )) ||
              undefined}
            {(refererRedeemables.length > 0 && (
              <PrintRedeemables
                extendedRedeemables={refererRedeemables}
                title={'Referer vouchers'}
                toast={toast}
              />
            )) ||
              undefined}
            {redeemablesByCampaignType?.GIFT_VOUCHERS && (
              <PrintRedeemables
                extendedRedeemables={redeemablesByCampaignType?.GIFT_VOUCHERS}
                title={'Gift vouchers'}
                toast={toast}
              />
            )}
            {redeemablesByCampaignType?.DISCOUNT_COUPONS && (
              <PrintRedeemables
                extendedRedeemables={
                  redeemablesByCampaignType?.DISCOUNT_COUPONS
                }
                title={'Discount coupons'}
                toast={toast}
              />
            )}
          </>
        ) : (
          <Text color="danger-med">something gone wrong</Text>
        )}
      </Box>
    </Container>
  )
}

export const PrintRedeemables = ({
  extendedRedeemables,
  title,
  toast,
}: {
  extendedRedeemables: ExtendedRedeemable[]
  title: string
  toast: CreateToastFnReturn
}) => {
  return (
    <Accordion
      size="medium"
      items={[
        getExtendedRedeemableAccordionItem({
          extendedRedeemables,
          key: title,
          title,
          toast,
        }),
      ]}
      accordionProps={{
        allowToggle: false,
        allowMultiple: true,
        width: '100%',
      }}
      accordionItemProps={{ border: 'none', width: '100%' }}
      accordionPanelProps={{
        px: 0,
        alignItems: 'left',
        justifyContent: 'start',
        width: '100%',
      }}
      accordionButtonProps={{
        px: 2,
        borderBottomWidth: '1px',
        width: '100%',
      }}
    />
  )
}

const getExtendedRedeemableAccordionItem = ({
  extendedRedeemables,
  key,
  title,
  toast,
}: {
  extendedRedeemables: ExtendedRedeemable[]
  key: string
  title: string
  toast: CreateToastFnReturn
}) => {
  return {
    defaultOpen: true,
    label: title,
    content: (
      <Box
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}
      >
        {extendedRedeemables.map((redeemable) => (
          <SimpleAlertBox
            key={redeemable.id}
            title={
              <>
                {redeemable.redeemable?.voucher?.campaign}
                {(redeemable.redeemable?.voucher?.code && (
                  <>
                    <br />
                    code: {redeemable.redeemable?.voucher?.code}
                    <Button
                      size={'xs'}
                      sx={{ ml: 2 }}
                      onClick={() => {
                        navigator.clipboard.writeText(
                          redeemable.redeemable?.voucher?.code || ''
                        )
                        toast({
                          status: 'success',
                          title: 'Voucher was copied to clipboard',
                        })
                      }}
                    >
                      Copy
                    </Button>
                  </>
                )) ||
                  undefined}
              </>
            }
            description={
              <>
                {(typeof redeemable.redeemable.voucher?.loyalty_card
                  ?.balance === 'number' && (
                  <>
                    balance:{' '}
                    {redeemable.redeemable.voucher?.loyalty_card.balance}
                  </>
                )) ||
                  undefined}
              </>
            }
          >
            <>
              {(redeemable.voucher_type === 'LOYALTY_CARD' &&
                !redeemable?.rewards?.length && (
                  <Text color="danger-med" sx={{ mt: 2 }}>
                    No rewards found
                  </Text>
                )) ||
                undefined}
              {(redeemable?.rewards?.length && (
                <Box sx={{ mt: 2 }}>
                  <PrintRewards extendedRedeemable={redeemable} toast={toast} />
                </Box>
              )) ||
                null}
            </>
          </SimpleAlertBox>
        ))}
      </Box>
    ),
    id: key,
  }
}

export const PrintRewards = ({
  extendedRedeemable,
  title = 'Rewards',
  toast,
}: {
  extendedRedeemable: ExtendedRedeemable
  title?: string
  toast: CreateToastFnReturn
}) => {
  return (
    <Accordion
      size="medium"
      items={[
        getExtendedRedeemableRewardsAccordionItem({
          extendedRedeemable,
          key: title,
          title,
          toast,
        }),
      ]}
      accordionProps={{
        allowToggle: false,
        allowMultiple: true,
        width: '100%',
      }}
      accordionItemProps={{
        border: 'none',
        width: '100%',
        background: 'white',
      }}
      accordionPanelProps={{
        px: 0,
        alignItems: 'left',
        justifyContent: 'start',
        width: '100%',
        background: 'white',
      }}
      accordionButtonProps={{
        px: 2,
        borderBottomWidth: '1px',
        width: '100%',
        backgroundColor: 'white',
      }}
    />
  )
}

const getExtendedRedeemableRewardsAccordionItem = ({
  extendedRedeemable,
  key,
  title,
  toast,
}: {
  extendedRedeemable: ExtendedRedeemable
  key: string
  title: string
  toast: CreateToastFnReturn
}) => {
  return {
    defaultOpen: true,
    label: title,
    content: (
      <Box
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}
      >
        {extendedRedeemable.rewards?.map(({ reward, assignment }) => (
          <SimpleAlertBox
            colorLight={'secondary.100'}
            colorDark={'secondary.700'}
            key={reward.id}
            title={reward.name}
            description={
              <>
                {reward.type === 'COIN' ? (
                  <>
                    Pay with points, {reward.parameters.coin.points_ratio}{' '}
                    points for {reward.parameters.coin.exchange_ratio}$
                  </>
                ) : (
                  //@ts-ignore
                  <>Cost: {assignment.parameters?.loyalty?.points}</>
                )}
              </>
            }
          >
            <>
              {(typeof extendedRedeemable.redeemable.voucher?.loyalty_card
                ?.balance === 'number' &&
                //@ts-ignore
                typeof assignment?.parameters?.loyalty?.points === 'number' && (
                  <>
                    {extendedRedeemable.redeemable.voucher.loyalty_card
                      ?.balance >
                    //@ts-ignore
                    assignment?.parameters?.loyalty?.points ? (
                      <Button
                        size={'xs'}
                        sx={{ ml: 2 }}
                        onClick={() => {
                          toast({
                            status: 'success',
                            title: 'Reward redeemed',
                          })
                        }}
                      >
                        Redeem
                      </Button>
                    ) : (
                      'Not enough points'
                    )}
                  </>
                )) ||
                undefined}
              {(typeof extendedRedeemable.redeemable.voucher?.loyalty_card
                ?.balance === 'number' &&
                //@ts-ignore
                typeof reward?.parameters?.coin?.points_ratio === 'number' && (
                  <>
                    {extendedRedeemable.redeemable.voucher.loyalty_card
                      ?.balance >
                    //@ts-ignore
                    reward.parameters.coin.points_ratio ? (
                      <Button
                        size={'xs'}
                        sx={{ ml: 2 }}
                        onClick={() => {
                          toast({
                            status: 'success',
                            title: 'Reward redeemed',
                          })
                        }}
                      >
                        Redeem
                      </Button>
                    ) : (
                      'Not enough points'
                    )}
                  </>
                )) ||
                undefined}
            </>
          </SimpleAlertBox>
        ))}
      </Box>
    ),
    id: key,
  }
}
