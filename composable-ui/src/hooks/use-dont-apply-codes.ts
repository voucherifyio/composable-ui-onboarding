import { useLocalStorage, writeStorage } from 'utils/local-storage'

const LOCAL_STORAGE_KEY = 'dont_apply_codes'

export const useDontApplyCodes = () => {
  const [dontApplyCodesAsString] = useLocalStorage<string>(
    LOCAL_STORAGE_KEY,
    '[]'
  )

  const addToDontApplyCodes = (code: string) => {
    writeStorage(
      LOCAL_STORAGE_KEY,
      JSON.stringify([...getDontApplyCodes(), code])
    )
  }

  const removeDontApplyCode = (code: string) => {
    writeStorage(
      LOCAL_STORAGE_KEY,
      JSON.stringify(getDontApplyCodes().filter((_code) => _code !== code))
    )
  }

  const getDontApplyCodes = (): string[] => {
    try {
      const value = JSON.parse(dontApplyCodesAsString)
      value.forEach((dontApplyCode: any) => {
        if (typeof dontApplyCode !== 'string') {
          throw new Error(`Could not get dontApply code: ${dontApplyCode}`)
        }
      })
      return value
    } catch (e) {
      writeStorage(LOCAL_STORAGE_KEY, '[]')
      return []
    }
  }

  return {
    dontApplyCodesAsString,
    getDontApplyCodes,
    removeDontApplyCode,
    addToDontApplyCodes,
  }
}
