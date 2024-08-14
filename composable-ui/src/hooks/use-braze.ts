import { useEffect, useState } from 'react'
import * as instanceBraze from '@braze/web-sdk'
import { useSession } from 'next-auth/react'

export const useBraze = () => {
  const [braze, setBraze] = useState<
    typeof import('@braze/web-sdk') | undefined
  >()
  const { data } = useSession()

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      process.env.NEXT_PUBLIC_BRAZE_API_KEY &&
      process.env.NEXT_PUBLIC_BRAZE_SDK_ENDPOINT &&
      data?.loggedIn
    ) {
      instanceBraze.initialize(process.env.NEXT_PUBLIC_BRAZE_API_KEY, {
        baseUrl: process.env.NEXT_PUBLIC_BRAZE_SDK_ENDPOINT,
        enableLogging: process.env.NODE_ENV !== 'production',
        allowUserSuppliedJavascript: true,
        minimumIntervalBetweenTriggerActionsInSeconds: 5,
      })
      setBraze(instanceBraze)
    }
  }, [data])

  const updateBrazeUser = async (email: string) => {
    if (typeof window !== 'undefined' && email && braze) {
      braze.changeUser(email)
      return braze.getUser()?.getUserId()
    }
  }

  return { braze, updateBrazeUser }
}
