import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
// import * as instanceBraze from '@braze/web-sdk'

export type BrazeInstance = {
  openSession: typeof import('@braze/web-sdk').openSession
  isPushPermissionGranted: typeof import('@braze/web-sdk').isPushPermissionGranted
  changeUser: typeof import('@braze/web-sdk').changeUser
  getUser: typeof import('@braze/web-sdk').getUser
  requestPushPermission: typeof import('@braze/web-sdk').requestPushPermission
}

export const useBraze = () => {
  const { data } = useSession()
  const [braze, setBraze] = useState<BrazeInstance | undefined>(undefined)

  useEffect(() => {
    import('../utils/braze-export').then(
      ({
        initialize,
        openSession,
        isPushPermissionGranted,
        changeUser,
        getUser,
        requestPushPermission,
      }) => {
        if (
          process.env.NEXT_PUBLIC_BRAZE_API_KEY &&
          process.env.NEXT_PUBLIC_BRAZE_SDK_ENDPOINT &&
          data?.loggedIn
        ) {
          initialize(process.env.NEXT_PUBLIC_BRAZE_API_KEY, {
            baseUrl: process.env.NEXT_PUBLIC_BRAZE_SDK_ENDPOINT,
            enableLogging: process.env.NODE_ENV !== 'production',
            allowUserSuppliedJavascript: true,
            minimumIntervalBetweenTriggerActionsInSeconds: 5,
          })
          setBraze({
            openSession,
            isPushPermissionGranted,
            changeUser,
            getUser,
            requestPushPermission,
          })
        }
      }
    )
  }, [data])

  // useEffect(() => {
  //   if (
  //     typeof window !== 'undefined' &&
  //     process.env.NEXT_PUBLIC_BRAZE_API_KEY &&
  //     process.env.NEXT_PUBLIC_BRAZE_SDK_ENDPOINT &&
  //     data?.loggedIn
  //   ) {
  //     instanceBraze.initialize(process.env.NEXT_PUBLIC_BRAZE_API_KEY, {
  //       baseUrl: process.env.NEXT_PUBLIC_BRAZE_SDK_ENDPOINT,
  //       enableLogging: process.env.NODE_ENV !== 'production',
  //       allowUserSuppliedJavascript: true,
  //       minimumIntervalBetweenTriggerActionsInSeconds: 5,
  //     })
  //     setBraze(instanceBraze)
  //   }
  // }, [data])

  const updateBrazeUser = async (email: string) => {
    if (typeof window !== 'undefined' && email && braze) {
      braze.changeUser(email)
      return braze.getUser()?.getUserId()
    }
  }

  return { braze, updateBrazeUser }
}
