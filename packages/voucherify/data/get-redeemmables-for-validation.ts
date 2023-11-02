import { PromotionsValidateResponse } from '@voucherify/sdk'

export const getRedeemmablesForValidation = (couponCodes: string[]) =>
  couponCodes.map((couponCode) => ({
    id: couponCode,
    object: 'voucher' as const,
  }))

export const getRedeemmablesForValidationFromPromotions = (
  promotionResult: PromotionsValidateResponse
) =>
  promotionResult.promotions?.map((promotion) => ({
    id: promotion.id,
    object: 'promotion_tier' as const,
  })) || []
