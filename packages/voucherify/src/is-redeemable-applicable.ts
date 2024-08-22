import { ValidateStackableResult } from './validate-discounts'
import { StackableRedeemableInapplicableResponse } from '@voucherify/sdk'

export const isRedeemableApplicable = (
  coupon: string,
  validationResult: ValidateStackableResult
): { isApplicable: boolean; error: undefined | string } => {
  let error
  const addedRedeemable =
    validationResult && validationResult.redeemables
      ? [
          ...validationResult.redeemables,
          ...((validationResult?.inapplicable_redeemables as unknown as StackableRedeemableInapplicableResponse[]) ||
            []),
        ]?.find((redeemable) => redeemable.id === coupon)
      : false

  const isApplicable = addedRedeemable
    ? addedRedeemable.status === 'APPLICABLE'
    : false

  if (!isApplicable) {
    error = addedRedeemable
      ? addedRedeemable.result?.details?.message || addedRedeemable.result?.error?.message
      : 'Redeemable not found in response from Voucherify'
  }

  return { isApplicable, error }
}
