import * as yup from 'yup'
import { useIntl, IntlShape } from 'react-intl'
import { useForm } from 'react-hook-form'
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  HStack,
  Stack,
  Text,
  VStack,
  Link,
} from '@chakra-ui/react'
import { IoLogoFacebook, IoLogoGoogle } from 'react-icons/io5'
import { yupResolver } from '@hookform/resolvers/yup'
import { useSession, signIn } from 'next-auth/react'
import NextLink from 'next/link'
import { useContext, useState } from 'react'

import { AccountForm, AccountPage } from '../account/account-drawer'
import {
  PasswordField,
  InputField,
  SectionDivider,
  TitleSection,
} from '@composable/ui'
import { MainAppContext } from 'app-context/app-context'

export interface LoginFormProps {
  setAccountFormToShow?: React.Dispatch<React.SetStateAction<AccountForm>>
  signIn: typeof signIn
  type?: AccountPage
}

export const LoginForm = ({
  signIn,
  type = AccountPage.PAGE,
  setAccountFormToShow,
}: LoginFormProps) => {
  const intl = useIntl()
  const [simulatingLoading, setSimulatingLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string; password: string }>({
    resolver: yupResolver(loginFormSchema({ intl })),
    mode: 'all',
  })

  const { updateBrazeUser } = useContext(MainAppContext)

  const DEFAULT_DEMO_ACCOUNT = {
    username: 'test@email.com',
    password: 'password',
  }

  const content = {
    ariaLabel: {
      signIn: intl.formatMessage({ id: 'account.login.title' }),
    },
    title: intl.formatMessage({ id: 'account.login.title' }),
    description: intl.formatMessage({ id: 'account.login.description' }),
    loginWithFacebook: intl.formatMessage({
      id: 'account.login.loginWithFacebook',
    }),
    loginWithGoogle: intl.formatMessage({
      id: 'account.login.loginWithGoogle',
    }),
    notAMemberYet: intl.formatMessage({ id: 'account.login.notAMemberYet' }),
    createAnAccount: intl.formatMessage({
      id: 'account.login.createAnAccount',
    }),
    or: intl.formatMessage({ id: 'text.or' }),
    input: {
      email: {
        label: intl.formatMessage({ id: 'account.register.label.email' }),
        placeholder: intl.formatMessage({ id: 'account.login.label.email' }),
      },
      password: {
        label: intl.formatMessage({ id: 'account.login.label.password' }),
        placeholder: intl.formatMessage({
          id: 'account.register.label.password.placeholder',
        }),
      },
    },
    button: {
      login: intl.formatMessage({ id: 'action.signIn' }),
      forgotPassword: intl.formatMessage({ id: 'action.forgotPassword' }),
      needToRegister: intl.formatMessage({ id: 'action.needToRegister' }),
    },
    error: {
      incorrectSignIn: intl.formatMessage({
        id: 'account.login.error.incorrectSignIn',
      }),
    },
  }

  const SocialLogin = () => (
    <VStack padding={'32px 0'} spacing={4} alignItems={'stretch'}>
      <Button
        size={{ base: 'md', md: 'lg' }}
        variant={'outline'}
        border={'1px solid'}
        borderColor={'text-muted'}
        color={'text'}
        leftIcon={<IoLogoFacebook />}
        aria-label={content.loginWithFacebook}
      >
        <Text textStyle={{ base: 'Mobile/XS', md: 'Mobile/S' }}>
          {content.loginWithFacebook}
        </Text>
      </Button>
      {/*<Button*/}
      {/*  size={{ base: 'md', md: 'lg' }}*/}
      {/*  variant={'outline'}*/}
      {/*  border={'1px solid'}*/}
      {/*  borderColor={'text-muted'}*/}
      {/*  color={'text'}*/}
      {/*  leftIcon={<IoLogoGoogle />}*/}
      {/*  aria-label={content.loginWithGoogle}*/}
      {/*  onClick={async () => {*/}
      {/*    // sign out any existing anonymous session before signing in*/}
      {/*    signIn('google')*/}
      {/*  }}*/}
      {/*>*/}
      {/*  <Text textStyle={{ base: 'Mobile/XS', md: 'Mobile/S' }}>*/}
      {/*    {content.loginWithGoogle}*/}
      {/*  </Text>*/}
      {/*</Button>*/}
    </VStack>
  )

  return (
    <Box>
      <TitleSection
        type={type}
        title={content.title}
        description={content.description}
      />
      {isError && (
        <Alert mt="30px" status="error" borderRadius={'6px'}>
          <AlertIcon alignSelf={'flex-start'} />
          {content.error.incorrectSignIn}
        </Alert>
      )}
      <Box py={6}>
        <form
          role={'form'}
          aria-label={content.ariaLabel.signIn}
          onSubmit={handleSubmit((data) => {
            setSimulatingLoading(true)
            signIn('only-email', {
              redirect: true,
              email: data.email,
            })
              .then((_) => {
                updateBrazeUser(data.email)
              })
              .catch((e) => {
                setSimulatingLoading(false)
              })
          })}
        >
          <Stack spacing="20px" direction="column">
            <InputField
              label={content.input.email.label}
              inputProps={{
                defaultValue: DEFAULT_DEMO_ACCOUNT?.username,
                placeholder: content.input.email.placeholder,
                ...register('email'),
              }}
              error={errors.email}
              isRequired
            />
          </Stack>

          <Box>
            <VStack
              mt={6}
              display="flex"
              justifyContent="stretch"
              gap={{ base: 4, md: 6 }}
            >
              <Button
                size={{ base: 'md', md: 'lg' }}
                type="submit"
                isLoading={simulatingLoading}
                colorScheme="blue"
                width={'full'}
              >
                <Text textStyle={'Mobile/S'}>{content.button.login}</Text>
              </Button>
            </VStack>
          </Box>
        </form>
      </Box>
    </Box>
  )
}

const loginFormSchema = (deps: { intl: IntlShape }) => {
  const { intl } = deps
  return yup.object().shape({
    email: yup
      .string()
      .email(intl.formatMessage({ id: 'validation.emailValid' }))
      .required(intl.formatMessage({ id: 'validation.emailRequired' })),
  })
}
