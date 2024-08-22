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
import { useToast } from '../hooks'
import { useCustomer, WalletStatus } from '../hooks/use-customer'
import { ExtendedRedeemable } from '@composable/voucherify'
import { Accordion } from '@composable/ui'
import { undefined } from 'zod'
import { api } from '../utils/api'

export const WalletPage = () => {
  const intl = useIntl()
  const title = intl.formatMessage({ id: 'walletPage.title' })
  const {
    redeemablesByCampaignType,
    refereeRedeemables,
    refererRedeemables,
    status: walletStatus,
    setWallet,
  } = useCustomer()
  const toast = useToast()
  const { client } = api.useContext()
  const redeemRewardCallback = async (
    campaignId: string,
    voucherId: string,
    rewardId: string,
    points?: number
  ) => {
    const response = await client.commerce.redeemReward.mutate({
      campaignId,
      voucherId,
      rewardId,
      points,
    })
    if (!response || response.result !== 'SUCCESS') {
      toast({
        status: 'error',
        title: 'Reward not redeemed',
      })
      return
    }
    const newBalance = response.voucher.loyalty_card?.balance
    const rewardVoucher: any =
      'voucher' in response.reward ? response.reward?.voucher : undefined
    const newRedeemable: any = rewardVoucher
      ? {
          campaign_id: rewardVoucher.campaign_id,
          campaign_type: rewardVoucher.campaign_type,
          created_at: '2024-08-19T13:47:32.816Z',
          holder_role: 'OWNER',
          redeemable: {
            status: 'ACTIVE',
            type: 'voucher',
            voucher: rewardVoucher,
          },
        }
      : undefined

    setWallet((wallet: any) => ({
      ...wallet,
      redeemablesByCampaignType: {
        ...wallet.redeemablesByCampaignType,
        LOYALTY_PROGRAM: wallet.redeemablesByCampaignType.LOYALTY_PROGRAM.map(
          (redeemable: ExtendedRedeemable) => {
            if (
              !redeemable.redeemable.voucher ||
              redeemable.redeemable.voucher.code !== voucherId
            ) {
              return redeemable
            }
            if (
              redeemable.redeemable.voucher.loyalty_card &&
              typeof newBalance === 'number'
            ) {
              redeemable.redeemable.voucher.loyalty_card.balance = newBalance
            }
            return redeemable
          }
        ),
        DISCOUNT_COUPONS:
          newRedeemable &&
          newRedeemable.redeemable.voucher?.type === 'DISCOUNT_VOUCHER'
            ? [
                newRedeemable,
                ...(wallet.redeemablesByCampaignType.DISCOUNT_COUPONS || []),
              ]
            : wallet.redeemablesByCampaignType.DISCOUNT_COUPONS,
        GIFT_VOUCHERS:
          newRedeemable &&
          newRedeemable.redeemable.voucher?.type === 'GIFT_VOUCHER'
            ? [
                newRedeemable,
                ...(wallet.redeemablesByCampaignType.GIFT_VOUCHERS || []),
              ]
            : wallet.redeemablesByCampaignType.GIFT_VOUCHERS,
      },
    }))
    toast({
      status: 'success',
      title: 'Reward was redeemed',
    })
  }

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
                redeemRewardCallback={redeemRewardCallback}
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
  redeemRewardCallback,
}: {
  extendedRedeemables: ExtendedRedeemable[]
  title: string
  toast: CreateToastFnReturn
  redeemRewardCallback?: (
    campaignId: string,
    voucherId: string,
    rewardId: string,
    points?: number
  ) => Promise<void>
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
          redeemRewardCallback,
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
  redeemRewardCallback,
}: {
  extendedRedeemables: ExtendedRedeemable[]
  key: string
  title: string
  toast: CreateToastFnReturn
  redeemRewardCallback?: (
    campaignId: string,
    voucherId: string,
    rewardId: string,
    points?: number
  ) => Promise<void>
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
                {redeemable.redeemable?.voucher?.metadata?.voucherName ||
                  redeemable.redeemable?.voucher?.campaign}
                {(redeemable.redeemable?.voucher?.code &&
                  redeemable.redeemable.voucher.type !== 'LOYALTY_CARD' && (
                    <>
                      <br />
                      code: {redeemable.redeemable?.voucher?.code}
                      {
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
                      }
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
                  <PrintRewards
                    redeemRewardCallback={async (
                      rewardId: string,
                      points?: number
                    ) =>
                      await redeemRewardCallback?.(
                        redeemable.campaign_id,
                        redeemable.redeemable.voucher!.code,
                        rewardId,
                        points
                      )
                    }
                    extendedRedeemable={redeemable}
                    toast={toast}
                  />
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
  redeemRewardCallback,
}: {
  extendedRedeemable: ExtendedRedeemable
  title?: string
  toast: CreateToastFnReturn
  redeemRewardCallback?: (rewardId: string, points?: number) => Promise<void>
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
          redeemRewardCallback,
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
  redeemRewardCallback,
}: {
  extendedRedeemable: ExtendedRedeemable
  key: string
  title: string
  toast: CreateToastFnReturn
  redeemRewardCallback?: (rewardId: string, points?: number) => Promise<void>
}) => {
  return {
    defaultOpen: true,
    label: title,
    content: (
      <Box
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}
      >
        {extendedRedeemable.rewards
          ?.filter(
            (extendedRedeemable) => extendedRedeemable?.reward?.type !== 'COIN'
          )
          .map(({ reward, assignment }) => (
            <SimpleAlertBox
              colorLight={'secondary.100'}
              colorDark={'secondary.700'}
              key={reward.id}
              title={reward.name}
              description={
                <Box sx={{ display: 'flex' }}>
                  Cost:{' '}
                  {('parameters' in assignment &&
                    assignment.parameters?.loyalty?.points) ||
                    null}
                  {(typeof extendedRedeemable.redeemable.voucher?.loyalty_card
                    ?.balance === 'number' &&
                    'parameters' in assignment &&
                    typeof assignment?.parameters?.loyalty?.points ===
                      'number' && (
                      <Box sx={{ display: 'flex' }}>
                        {extendedRedeemable.redeemable.voucher.loyalty_card
                          ?.balance >
                        (('parameters' in assignment &&
                          assignment?.parameters?.loyalty?.points) ||
                          0) ? (
                          <Button
                            size={'xs'}
                            sx={{ ml: 2 }}
                            onClick={async () => {
                              await redeemRewardCallback?.(assignment.reward_id)
                            }}
                          >
                            Redeem
                          </Button>
                        ) : null}
                      </Box>
                    )) ||
                    null}
                </Box>
              }
            >
              <>
                {(typeof extendedRedeemable.redeemable.voucher?.loyalty_card
                  ?.balance === 'number' &&
                  'parameters' in assignment &&
                  typeof assignment?.parameters?.loyalty?.points ===
                    'number' && (
                    <Box sx={{ display: 'flex' }}>
                      {extendedRedeemable.redeemable.voucher.loyalty_card
                        ?.balance >
                      (('parameters' in assignment &&
                        assignment?.parameters?.loyalty?.points) ||
                        0)
                        ? null
                        : 'Not enough points'}
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
