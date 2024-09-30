import { useState, useEffect } from 'react'

import {
  Box,
  Button,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  Flex,
  Text,
  FormLabel,
  FormControl,
  useDisclosure,
  useToast,
  Spinner,
  useColorModeValue,
} from '@chakra-ui/react'
import { useFormik } from 'formik'
import { useSelector, useDispatch } from 'react-redux'
import * as Yup from 'yup'

import TradeTypeSelector from './tradeTypeSelector'
import LoginButtonComponent from '../../../components/loginButton'
import useOrders from '../../../hooks/useOrders'
import useBalances from '../../../hooks/useWallet'
import { RootState, AppDispatch } from '../../../store'
import { setBalances } from '../../../store/balances'
import { setIsRefreshUserData } from '../../../store/orders'
import { Result, TokenDataItem } from '../../../types'
import {
  convertPriceToCanister,
  convertVolumeToCanister,
  volumeStepSizeDecimals,
  volumeCalculateStepSize,
  priceDigitLimitValidate,
  volumeDecimalsValidate,
  fixDecimal,
} from '../../../utils/calculationsUtils'
import {
  validationPlaceOrder,
  getErrorMessagePlaceOrder,
} from '../../../utils/orderUtils'

const Trading = () => {
  const toast = useToast({
    duration: 10000,
    position: 'top-right',
    isClosable: true,
  })
  const dispatch = useDispatch<AppDispatch>()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const fontColor = useColorModeValue('grey.800', 'grey.200')

  const [tradeType, setTradeType] = useState('buy')
  const [amountType, setAmountType] = useState('base')
  const [loading, setLoading] = useState(true)
  const [baseStepSize, setBaseStepSize] = useState<number | null>(null)
  const [baseStepSizeDecimal, setBaseStepSizeDecimal] = useState<
    number | undefined
  >(undefined)
  const [available, setAvailable] = useState<TokenDataItem | null>(null)
  const [selectedPercentage, setSelectedPercentage] = useState(null)
  const [message, setMessage] = useState<string | null>(null)
  const { userAgent } = useSelector((state: RootState) => state.auth)
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  )
  const openOrders = useSelector((state: RootState) => state.orders.openOrders)
  const tokens = useSelector((state: RootState) => state.tokens.tokens)
  const balances = useSelector((state: RootState) => state.balances.balances)
  const selectedSymbol = useSelector(
    (state: RootState) => state.tokens.selectedSymbol,
  )
  const selectedQuote = useSelector(
    (state: RootState) => state.tokens.selectedQuote,
  )
  const minimumOrderSize = useSelector(
    (state: RootState) => state.orders.minimumOrderSize,
  )
  const priceDigitsLimit = useSelector(
    (state: RootState) => state.orders.priceDigitsLimit,
  )
  const volumeStepSize = useSelector(
    (state: RootState) => state.orders.volumeStepSize,
  )
  const symbol = Array.isArray(selectedSymbol)
    ? selectedSymbol[0]
    : selectedSymbol

  const initialValues = {
    price: '',
    quoteAmount: '',
    baseAmount: '',
    amountType: amountType,
    available: available?.volumeInAvailable,
    submit: false,
  }

  const validationSchema = Yup.object().shape(
    {
      available: Yup.number(),
      price: Yup.number().required('').typeError(''),
      quoteAmount: Yup.number()
        .typeError('')
        .when('baseAmount', (baseAmount, schema) =>
          baseAmount ? schema.required('') : schema,
        )
        .when(['amountType', 'available'], {
          is: (amountType: string, available: number) =>
            amountType === 'quote' && available <= 0,
          then: (schema) =>
            schema.test('no-credit', 'No credit', function () {
              return false
            }),
        })
        .when('amountType', {
          is: 'quote',
          then: (schema) =>
            schema.min(
              minimumOrderSize,
              `Amount must be ≥ ${minimumOrderSize} ${symbol?.quote}`,
            ),
        })
        .when('amountType', {
          is: 'quote',
          then: (schema) =>
            schema.max(available?.volumeInAvailable || 0, `Not enough funds`),
        }),

      baseAmount: Yup.number()
        .typeError('')
        .when('quoteAmount', (quoteAmount, schema) =>
          quoteAmount ? schema.required('') : schema,
        )
        .when(['amountType', 'available'], {
          is: (amountType: string, available: number) =>
            amountType === 'base' && available <= 0,
          then: (schema) =>
            schema.test('no-credit', 'No credit', function () {
              return false
            }),
        })
        .test('is-valid-step-size', function (value) {
          const { volume: calculatedBaseVolume } = handleBaseVolumeCalculate(
            Number(value),
          )
          return (
            value === Number(calculatedBaseVolume) ||
            this.createError({
              path: this.path,
              message: `Amount must be a multiple of ${fixDecimal(baseStepSize || 0, baseStepSizeDecimal)}`,
            })
          )
        })
        .when('amountType', {
          is: 'base',
          then: (schema) => {
            return schema.test('valid-amount', function (value) {
              const { path, createError } = this
              const minimumBaseAmount: number =
                parseFloat(formik.values.price) > 0
                  ? minimumOrderSize / parseFloat(formik.values.price)
                  : minimumOrderSize

              const volumeInAvailable = parseFloat(
                `${available?.volumeInAvailable}`,
              )
              const price = parseFloat(formik.values.price)
              const maximumBaseAmount: number =
                volumeInAvailable > 0 && price > 0
                  ? tradeType === 'buy'
                    ? volumeInAvailable / price
                    : volumeInAvailable
                  : 0

              if (value && value > maximumBaseAmount) {
                return createError({ path, message: 'Not enough funds' })
              } else if (value && value < minimumBaseAmount) {
                return createError({
                  path,
                  message: `Amount must be ≥ ${minimumBaseAmount.toFixed(
                    symbol?.decimals,
                  )} ${symbol?.base}`,
                })
              }

              return true
            })
          },
        }),
    },
    [['baseAmount', 'quoteAmount']],
  )

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values, { setStatus, setSubmitting }) => {
      setMessage(null)

      const price = convertPriceToCanister(
        Number(values.price),
        Number(symbol?.decimals),
        selectedQuote.decimals,
      )

      const volume = convertVolumeToCanister(
        Number(values.baseAmount),
        Number(symbol?.decimals),
      )

      const order = {
        volume,
        price,
        type: tradeType,
      }

      const orderExists = validationPlaceOrder(
        openOrders,
        symbol?.base,
        symbol?.quote,
        tradeType,
        Number(values.price),
        selectedQuote,
      )

      if (orderExists) {
        setStatus({ success: false })
        setSubmitting(false)
        setMessage(orderExists)
        return
      }

      const toastId = toast({
        title: 'Create order pending',
        description: 'Please wait',
        status: 'loading',
        duration: null,
        isClosable: true,
      })

      const { placeOrder } = useOrders()
      placeOrder(userAgent, symbol, order)
        .then(async (response: Result) => {
          setStatus({ success: true })
          setSubmitting(false)
          setMessage(null)
          dispatch(setIsRefreshUserData())
          fetchBalances()

          if (response.length > 0 && Object.keys(response[0]).includes('Ok')) {
            if (toastId) {
              toast.update(toastId, {
                title: 'Sucess',
                description: 'Order created',
                status: 'success',
                isClosable: true,
              })
            }
          } else {
            if (toastId) {
              const description = getErrorMessagePlaceOrder(response[0].Err)
              toast.update(toastId, {
                title: 'Create order rejected',
                description,
                status: 'error',
                isClosable: true,
              })
            }
          }
        })
        .catch((error) => {
          const message = error.response ? error.response.data : error.message

          if (toastId) {
            toast.update(toastId, {
              title: 'Create order rejected',
              description: `Error: ${message}`,
              status: 'error',
              isClosable: true,
            })
          }

          setStatus({ success: false })
          setSubmitting(false)
          console.error(message)
        })
    },
  })

  async function fetchBalances() {
    setLoading(true)
    const { getBalancesCredits } = useBalances()
    const balancesCredits = await getBalancesCredits(userAgent, tokens)
    dispatch(setBalances(balancesCredits))
    setLoading(false)
  }

  const updateAvailable = (type: string) => {
    const quote = symbol?.quote
    const base = symbol?.base
    const token = type === 'buy' ? quote : base

    const balance = balances.find((balance) => balance.symbol === token)

    if (balance) {
      setAvailable(balance)
    } else {
      setAvailable(null)
    }
    return balance
  }

  const handleTradeTypeChange = (type: string) => {
    if (!formik.isSubmitting) {
      setTradeType(type)
      updateAvailable(type)
    }
  }

  const handleClearForm = () => {
    setMessage(null)
    setSelectedPercentage(null)
    handlePercentageClick(0)
    setAmountType('base')
    formik.resetForm({ values: initialValues })
    setBaseStepSize(null)
  }

  const handlePercentageClick = (percentage: any) => {
    setSelectedPercentage(
      percentage === selectedPercentage ||
        !isAuthenticated ||
        !formik.values.price
        ? null
        : percentage,
    )
  }

  const handleBaseVolumeDecimal = () => {
    if (Number(formik.values.price) > 0) {
      const decimal = volumeStepSizeDecimals(
        Number(formik.values.price),
        volumeStepSize,
        Number(symbol?.decimals),
        selectedQuote.decimals,
      )
      setBaseStepSizeDecimal(decimal)
      return decimal
    }
  }

  const handleBaseVolumeCalculate = (value: number) => {
    const decimal = handleBaseVolumeDecimal()
    const { volume, volumeFloor, stepSize } = volumeCalculateStepSize(
      parseFloat(formik.values.price),
      value,
      Number(decimal),
      volumeStepSize,
    )
    setBaseStepSize(stepSize)
    return { volume, volumeFloor }
  }

  const handlePriceInputChange = (e: { target: { value: any } }) => {
    const newValue = e.target.value
    const numericValue = parseFloat(newValue)

    if (!newValue || priceDigitLimitValidate(numericValue, priceDigitsLimit)) {
      formik.setFieldValue('price', newValue)
    }
  }

  const handleCalculateBaseAmount = (price: string, quoteAmount: string) => {
    if (
      quoteAmount &&
      !isNaN(parseFloat(quoteAmount)) &&
      price &&
      !isNaN(parseFloat(price))
    ) {
      const { volumeFloor } = handleBaseVolumeCalculate(
        parseFloat(quoteAmount) / parseFloat(price),
      )
      formik.setFieldValue('baseAmount', volumeFloor)
    }
  }

  const handleCalculateQuoteAmount = (price: string, baseAmount: string) => {
    if (
      baseAmount &&
      !isNaN(parseFloat(baseAmount)) &&
      price &&
      !isNaN(parseFloat(price))
    ) {
      formik.setFieldValue(
        'quoteAmount',
        fixDecimal(
          parseFloat(baseAmount) * parseFloat(price),
          selectedQuote.decimals,
        ),
      )
    }
  }

  useEffect(() => {
    const balance = updateAvailable(tradeType)

    if (
      (amountType === 'base' &&
        Number(balance?.volumeInAvailable) <
          Number(formik.values.baseAmount)) ||
      (amountType === 'quote' &&
        Number(balance?.volumeInAvailable) < Number(formik.values.quoteAmount))
    ) {
      setSelectedPercentage(null)
      formik.setFieldValue('baseAmount', '', false)
      formik.setFieldValue('quoteAmount', '', false)
      formik.setFieldTouched('baseAmount', false)
      formik.setFieldTouched('quoteAmount', false)
    }
  }, [balances])

  useEffect(() => {
    handleClearForm()
    fetchBalances()
    setTradeType('buy')
  }, [userAgent, selectedSymbol])

  useEffect(() => {
    if (tradeType === 'sell') {
      setAmountType('base')
      formik.setFieldValue('amountType', 'base')
    }
  }, [tradeType])

  useEffect(() => {
    formik.setFieldValue('amountType', amountType)
  }, [amountType])

  useEffect(() => {
    formik.setFieldValue('available', available?.volumeInAvailable)
  }, [available])

  useEffect(() => {
    setBaseStepSizeDecimal(symbol?.decimals)
  }, [symbol])

  useEffect(() => {
    if (
      available &&
      selectedPercentage &&
      formik.values.price &&
      !isNaN(parseFloat(formik.values.price))
    ) {
      const percentageAvailable =
        (selectedPercentage / 100) * available.volumeInBase

      let baseAmount = 0
      let quoteAmount = 0

      if (tradeType === 'buy') {
        quoteAmount = percentageAvailable
        const { volumeFloor } = handleBaseVolumeCalculate(
          quoteAmount / parseFloat(formik.values.price),
        )
        baseAmount = parseFloat(volumeFloor)
      } else {
        const { volumeFloor } = handleBaseVolumeCalculate(percentageAvailable)
        baseAmount = parseFloat(volumeFloor)
        quoteAmount = baseAmount * parseFloat(formik.values.price)
      }

      formik.setFieldValue('baseAmount', baseAmount)
      formik.setFieldValue(
        'quoteAmount',
        fixDecimal(quoteAmount, selectedQuote.decimals),
      )
    }
  }, [selectedPercentage])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null)
      }, 20000)

      return () => clearTimeout(timer)
    }
  }, [message])

  return (
    <VStack spacing={4} align="stretch">
      <TradeTypeSelector
        tradeType={tradeType}
        handleTradeTypeChange={handleTradeTypeChange}
      />
      <Flex direction="column">
        <FormControl variant="floating">
          <Input
            h="58px"
            placeholder=" "
            name="price"
            sx={{ borderRadius: '5px' }}
            isInvalid={!!formik.errors.price && formik.touched.price}
            isDisabled={!selectedSymbol || !isAuthenticated}
            value={formik.values.price}
            onKeyUp={() => formik.validateField('price')}
            onChange={(e) => {
              handlePriceInputChange(e)
              setSelectedPercentage(null)
              setBaseStepSize(null)

              amountType === 'quote'
                ? handleCalculateBaseAmount(
                    e.target.value,
                    formik.values.quoteAmount,
                  )
                : handleCalculateQuoteAmount(
                    e.target.value,
                    formik.values.baseAmount,
                  )
            }}
          />
          <FormLabel color="grey.500" fontSize="15px">
            Price
          </FormLabel>
          {!!formik.errors.price && formik.touched.price && (
            <Text color="red.500" fontSize="12px">
              {formik.errors.price}
            </Text>
          )}
        </FormControl>
      </Flex>
      <Flex direction="column">
        <InputGroup>
          <FormControl variant="floating">
            <Input
              h="58px"
              placeholder=" "
              name="quoteAmount"
              sx={{ borderRadius: '5px' }}
              isInvalid={
                !!formik.errors.quoteAmount && formik.touched.quoteAmount
              }
              isDisabled={
                !formik.values.price || !selectedSymbol || !isAuthenticated
              }
              value={formik.values.quoteAmount}
              onKeyUp={() => {
                formik.validateField('quoteAmount')
                setSelectedPercentage(null)
              }}
              onChange={(e) => {
                formik.handleChange(e)
                handleCalculateBaseAmount(formik.values.price, e.target.value)
              }}
            />
            <FormLabel color="grey.500" fontSize="15px">
              Amount
            </FormLabel>
          </FormControl>
          <InputRightElement h="58px">
            <Button
              h="58px"
              fontSize="11px"
              borderRadius="0 5px 5px 0"
              bgColor={
                amountType === 'quote' && tradeType === 'buy'
                  ? 'green.500'
                  : 'grey.500'
              }
              color="grey.25"
              _hover={{
                bg:
                  amountType === 'quote' && tradeType === 'buy'
                    ? 'green.400'
                    : 'grey.400',
                color: 'grey.25',
              }}
              //onClick={() => tradeType === 'buy' && setAmountType('quote')}
            >
              {symbol?.quote}
            </Button>
          </InputRightElement>
        </InputGroup>
        {!!formik.errors.quoteAmount && formik.touched.quoteAmount && (
          <Text color="red.500" fontSize="12px">
            {formik.errors.quoteAmount}
          </Text>
        )}
      </Flex>
      <Flex direction="column">
        <InputGroup>
          <FormControl variant="floating">
            <Input
              h="58px"
              placeholder=" "
              name="baseAmount"
              sx={{ borderRadius: '5px' }}
              isInvalid={
                !!formik.errors.baseAmount && formik.touched.baseAmount
              }
              isDisabled={
                !formik.values.price || !selectedSymbol || !isAuthenticated
              }
              value={formik.values.baseAmount}
              onKeyUp={() => {
                formik.validateField('baseAmount')
                setSelectedPercentage(null)
              }}
              onChange={(e) => {
                formik.handleChange(e)
                if (e.target.value && !isNaN(parseFloat(e.target.value))) {
                  const decimal = handleBaseVolumeDecimal()
                  const valueValidate = volumeDecimalsValidate(
                    e.target.value,
                    Number(decimal),
                  )
                  formik.setFieldValue('baseAmount', valueValidate)
                  handleCalculateQuoteAmount(
                    formik.values.price,
                    e.target.value,
                  )
                  handleBaseVolumeCalculate(parseFloat(e.target.value))
                }
              }}
            />
            <FormLabel color="grey.500" fontSize="15px">
              Amount
            </FormLabel>
          </FormControl>
          <InputRightElement h="58px">
            <Button
              h="58px"
              fontSize="11px"
              borderRadius="0 5px 5px 0"
              bgColor={
                amountType === 'base' && tradeType === 'buy'
                  ? 'green.500'
                  : tradeType === 'sell'
                    ? 'red.500'
                    : 'grey.500'
              }
              color="grey.25"
              _hover={{
                bg:
                  amountType === 'base' && tradeType === 'buy'
                    ? 'green.400'
                    : tradeType === 'sell'
                      ? 'red.500'
                      : 'grey.400',
                color: 'grey.25',
              }}
              //onClick={() => tradeType === 'buy' && setAmountType('base')}
            >
              {symbol?.base}
            </Button>
          </InputRightElement>
        </InputGroup>
        {baseStepSize && (
          <Text color={fontColor} fontSize="11px">
            Step Size: {fixDecimal(baseStepSize, baseStepSizeDecimal)}
          </Text>
        )}
        {!!formik.errors.baseAmount && formik.touched.baseAmount && (
          <Text color="red.500" fontSize="12px">
            {formik.errors.baseAmount}
          </Text>
        )}
      </Flex>
      <Flex justify="space-between" borderBottom="1px solid gray" pb={2}>
        {[25, 50, 75, 100].map((percentage) => (
          <Button
            key={percentage}
            flex="1"
            size="sm"
            mx={1}
            color={selectedPercentage === percentage ? 'grey.25' : 'inherit'}
            bg={
              selectedPercentage === percentage
                ? tradeType === 'buy'
                  ? 'green.500'
                  : 'red.500'
                : 'transparent'
            }
            onClick={() => handlePercentageClick(percentage)}
            isDisabled={!selectedSymbol}
            _hover={{
              bg: tradeType === 'buy' ? 'green.500' : 'red.500',
              color: 'grey.25',
            }}
          >
            {percentage}%
          </Button>
        ))}
      </Flex>
      {!isAuthenticated ? (
        <LoginButtonComponent
          isOpen={isOpen}
          onOpen={onOpen}
          onClose={onClose}
          symbol={symbol}
          height="10vh"
        />
      ) : (
        <>
          <Box
            filter={loading ? 'blur(5px)' : 'none'}
            pointerEvents={loading ? 'none' : 'auto'}
          >
            <Text textAlign="center" fontSize="14px">
              Available:
            </Text>
            <Text textAlign="center" fontSize="12px">
              {available?.volumeInAvailable &&
              symbol &&
              selectedQuote &&
              tradeType ? (
                <>{` ${tradeType === 'buy' ? fixDecimal(available.volumeInAvailable, selectedQuote?.decimals) : fixDecimal(available.volumeInAvailable, symbol?.decimals)} `}</>
              ) : (
                <>{` 0 `}</>
              )}
              <Text as="span" fontSize="11px">
                {tradeType === 'buy' ? symbol?.quote : symbol?.base}
              </Text>
            </Text>
          </Box>{' '}
          <Flex direction="row" justifyContent="space-between" gap={2}>
            <Button
              background="grey.500"
              variant="solid"
              h="58px"
              w={formik.isSubmitting ? '100px' : '150px'}
              color="grey.25"
              _hover={{
                bg: 'grey.400',
                color: 'grey.25',
              }}
              isDisabled={!selectedSymbol || formik.isSubmitting}
              onClick={handleClearForm}
            >
              Reset
            </Button>
            <Button
              background={tradeType === 'buy' ? 'green.500' : 'red.500'}
              variant="solid"
              h="58px"
              w={formik.isSubmitting ? '200px' : '150px'}
              color="grey.25"
              _hover={{
                bg: tradeType === 'buy' ? 'green.400' : 'red.400',
                color: 'grey.25',
              }}
              isDisabled={!selectedSymbol || formik.isSubmitting}
              onClick={() => formik.handleSubmit()}
            >
              {formik.isSubmitting ? (
                <>
                  Creating <Spinner ml={2} size="sm" color="grey.25" />
                </>
              ) : (
                'Create'
              )}
            </Button>
          </Flex>
        </>
      )}
      {message && (
        <Text textAlign="center" fontSize="13px" color="red.500">
          {message}
        </Text>
      )}
    </VStack>
  )
}

export default Trading
