import { ValidationResponse } from '../validate-discounts'

export const isRedeemableApplicable = (
  coupon: string,
  validationResult: ValidationResponse
): { isApplicable: boolean; error: undefined | string } => {
  let error
  const addedRedeembale =
    validationResult && validationResult.redeemables
      ? [
          ...validationResult.redeemables,
          ...(validationResult?.inapplicable_redeemables || []),
        ]?.find((redeemable) => redeemable.id === coupon)
      : false

  const isApplicable = addedRedeembale
    ? addedRedeembale.status === 'APPLICABLE'
    : false

  if (!isApplicable) {
    error = addedRedeembale
      ? addedRedeembale.result?.error?.message
      : 'Redeemable not found in response from Voucherify'
  }

  return { isApplicable, error }
}
