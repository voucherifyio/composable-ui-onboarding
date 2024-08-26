import React, { StrictMode, useContext, useEffect } from 'react'
import { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'

import { theme } from '@composable/ui'

import { api } from 'utils/api'
import { ErrorBoundary } from 'components/error-boundary'
import { Composable } from 'components/composable'
import { Layout } from 'components/layout/layout'
import { GOOGLE_TAG_MANAGER_ID } from 'utils/constants'
import AppContext, { MainAppContext } from 'app-context/app-context'
import BrazePermissionModal from '../components/braze-permission-modal'

const App = ({ Component, pageProps: { session, ...pageProps } }: AppProps) => {
  return (
    <StrictMode>
      <ErrorBoundary>
        <SessionProvider session={session}>
          <Composable theme={theme} googleTagManagerId={GOOGLE_TAG_MANAGER_ID}>
            <AppContext>
              <Layout>
                <ErrorBoundary>
                  <Component {...pageProps} />
                </ErrorBoundary>
              </Layout>
            </AppContext>
          </Composable>
        </SessionProvider>
      </ErrorBoundary>
    </StrictMode>
  )
}

export default api.withTRPC(App)
