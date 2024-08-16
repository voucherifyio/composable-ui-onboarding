import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'

export const useBraze = () => {
  const { data } = useSession()

  const { data: braze } = useQuery(['useBrazeInit'], async () => {
    if (
      typeof window !== 'undefined' &&
      process.env.NEXT_PUBLIC_BRAZE_API_KEY &&
      process.env.NEXT_PUBLIC_BRAZE_SDK_ENDPOINT &&
      data?.loggedIn
    ) {
      const instanceBraze = await import('@braze/web-sdk')
      instanceBraze.initialize(process.env.NEXT_PUBLIC_BRAZE_API_KEY, {
        baseUrl: process.env.NEXT_PUBLIC_BRAZE_SDK_ENDPOINT,
        enableLogging: process.env.NODE_ENV !== 'production',
        allowUserSuppliedJavascript: true,
        minimumIntervalBetweenTriggerActionsInSeconds: 5,
      })
      return instanceBraze
    }
  })

  const updateBrazeUser = async (email: string) => {
    if (typeof window !== 'undefined' && email && braze) {
      braze.changeUser(email)
      return braze.getUser()?.getUserId()
    }
  }

  return { braze, updateBrazeUser }
}
