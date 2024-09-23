import React, { useEffect } from 'react'

import { SettingsIcon } from '@chakra-ui/icons'
import {
  IconButton,
  Flex,
  InputGroup,
  FormControl,
  Input,
  FormLabel,
  InputRightElement,
  Button,
  Text,
  Menu,
  MenuButton,
  MenuList,
  Spinner,
  useColorModeValue,
} from '@chakra-ui/react'
import { useFormik } from 'formik'
import { useSelector, useDispatch } from 'react-redux'
import * as Yup from 'yup'

import useTokens from '../../../hooks/useTokens'
import { RootState, AppDispatch } from '../../../store'
import { setIsRefreshUserData } from '../../../store/orders'
import { setIsRefreshPrices } from '../../../store/prices'
import {
  setTokens,
  setSelectedSymbol,
  setSelectedQuote,
} from '../../../store/tokens'
import { Option } from '../../../types'
import { getActor } from '../../../utils/authUtils'

const NavbarSettings: React.FC = () => {
  const bgColorHover = useColorModeValue('grey.300', 'grey.500')
  const bgColor = useColorModeValue('grey.100', 'grey.900')
  const buttonBgColor = useColorModeValue('grey.200', 'grey.600')
  const fontColor = useColorModeValue('grey.700', 'grey.25')
  const quoteTokenDefault = process.env.ENV_TOKEN_QUOTE_DEFAULT || 'USDT'
  const tokenDefault = process.env.ENV_TOKEN_SELECTED_DEFAULT

  const dispatch = useDispatch<AppDispatch>()

  const { userAgent } = useSelector((state: RootState) => state.auth)

  async function fetchTokens() {
    const { getTokens } = useTokens()
    const data = await getTokens(userAgent)

    const quoteToken = data.tokens.find(
      (token) => token.symbol === (data?.quoteToken?.base || quoteTokenDefault),
    )

    let initialSymbol = data.tokens.find((token) => token.base === tokenDefault)
    initialSymbol =
      initialSymbol && initialSymbol?.base === tokenDefault
        ? initialSymbol
        : data.tokens[0]
    const initialOption: Option = {
      id: initialSymbol.symbol,
      value: initialSymbol.symbol,
      label: initialSymbol.name,
      image: initialSymbol.logo,
      base: initialSymbol.base,
      quote: initialSymbol.quote,
      decimals: initialSymbol.decimals,
      principal: initialSymbol.principal,
    }
    dispatch(setSelectedSymbol(initialOption))

    dispatch(setTokens(data.tokens))

    if (quoteToken) {
      dispatch(setSelectedQuote(quoteToken))
    }
  }

  const initialValues = {
    canisterId: '',
    submit: false,
  }

  const validationSchema = Yup.object().shape({
    canisterId: Yup.string().required('').typeError(''),
  })

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      try {
        const serviceActor = getActor(userAgent, values.canisterId)
        await serviceActor.getQuoteLedger()

        await fetchTokens()
        dispatch(setIsRefreshUserData())
        dispatch(setIsRefreshPrices())

        localStorage.setItem('auctionCanisterId', values.canisterId)

        setStatus({ success: true })
        setSubmitting(false)
      } catch (error) {
        setStatus({ success: false })
        setSubmitting(false)

        formik.setFieldError('canisterId', 'Canister Id Invalid')
      }
    },
  })

  useEffect(() => {
    const auctionCanisterId = localStorage.getItem('auctionCanisterId')

    if (auctionCanisterId) formik.setFieldValue('canisterId', auctionCanisterId)
    else
      formik.setFieldValue('canisterId', process.env.CANISTER_ID_ICRC_AUCTION)
  }, [])

  return (
    <Flex alignItems="center" zIndex="10">
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="Settings"
          icon={<SettingsIcon />}
          variant="unstyled"
          _hover={{ bg: 'transparent' }}
          _focus={{ outline: 'none' }}
        />
        <MenuList bg={bgColor} p={4} w="350px">
          <Flex direction="column">
            <InputGroup>
              <FormControl variant="floating">
                <Input
                  h="58px"
                  placeholder=" "
                  name="canisterId"
                  sx={{ borderRadius: '5px' }}
                  isInvalid={
                    !!formik.errors.canisterId && formik.touched.canisterId
                  }
                  isDisabled={false}
                  value={formik.values.canisterId}
                  onChange={(e) => {
                    formik.handleChange(e)
                  }}
                />
                <FormLabel color="grey.500" fontSize="15px">
                  Backend Canister Id
                </FormLabel>
              </FormControl>
              <InputRightElement h="58px" w="45px">
                <Button
                  h="58px"
                  fontSize="11px"
                  borderRadius="0 5px 5px 0"
                  bgColor={'grey.500'}
                  color="grey.25"
                  _hover={{
                    bg: 'grey.400',
                    color: 'grey.25',
                  }}
                  onClick={() => {
                    formik.setFieldValue(
                      'canisterId',
                      process.env.CANISTER_ID_ICRC_AUCTION,
                    )
                  }}
                >
                  Default
                </Button>
              </InputRightElement>
            </InputGroup>
            {!!formik.errors.canisterId && formik.touched.canisterId && (
              <Text color="red.500" fontSize="12px">
                {formik.errors.canisterId}
              </Text>
            )}

            <Flex direction="column" mt={2}>
              <Button
                background={buttonBgColor}
                variant="solid"
                h="58px"
                color={fontColor}
                _hover={{
                  bg: bgColorHover,
                  color: fontColor,
                }}
                isDisabled={formik.isSubmitting}
                onClick={() => formik.handleSubmit()}
              >
                {formik.isSubmitting ? (
                  <>
                    Save <Spinner ml={2} size="sm" color={fontColor} />
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </Flex>
          </Flex>
        </MenuList>
      </Menu>
    </Flex>
  )
}

export default NavbarSettings
