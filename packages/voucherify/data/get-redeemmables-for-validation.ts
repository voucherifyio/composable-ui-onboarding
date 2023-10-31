export const getRedeemmablesForValidation = (couponCodes: string[]) =>
  couponCodes.map((couponCode) => ({
    id: couponCode,
    object: 'voucher' as const,
  }))
