import { BannerSplit as BannerSplitTemplate } from '@composable/ui'
import { BannerSplitProps } from '@composable/types'
import { Text } from '@chakra-ui/react'
export const BannerSplit = ({
  imageDesktop,
  imageMobile,
  eyebrow,
  title,
  content,
  ctaAlphaHref,
  ctaAlphaLabel,
  inverted,
  isFullScreen,
  isLazy = true,
}: BannerSplitProps) => {
  return (
    <BannerSplitTemplate
      inverted={inverted ?? undefined}
      isFullScreen={isFullScreen}
      isLazy={isLazy}
      image={{
        imageDesktop: {
          src: '/img/embol-template.png',
          alt: imageDesktop?.title ?? '',
        },
        imageMobile: {
          src: '/img/embol-template.png',
          alt: imageMobile?.title ?? '',
        },
      }}
      text={{
        eyebrow: {
          children: eyebrow,
        },
        title: {
          children: (
            <Text>
              Welcome to <br /> Embol x Voucherify PoC
            </Text>
          ),
        },
        body: {
          children:
            'Start your shopping. Create an account and check your wallet. After making your first order go to your order history.',
        },
        ctaButtonPrimary: {
          children: ctaAlphaLabel,
          href: ctaAlphaHref ?? '',
        },
      }}
    />
  )
}
