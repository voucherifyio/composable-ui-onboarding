import { useBraze } from 'hooks'
import { createContext } from 'react'

type AppContextType = {
  braze: typeof import('@braze/web-sdk') | undefined
  updateBrazeUser: (email: string) => Promise<string | null | undefined>
}

export const MainAppContext = createContext<AppContextType>({
  braze: undefined,
  updateBrazeUser: async () => undefined,
})

const AppContext = ({ children }: { children: JSX.Element }) => {
  const { updateBrazeUser, braze } = useBraze()

  return (
    <MainAppContext.Provider
      value={{
        braze,
        updateBrazeUser,
      }}
    >
      {children}
    </MainAppContext.Provider>
  )
}

export default AppContext
