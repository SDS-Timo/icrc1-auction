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
import { setIsRefreshOpenOrders } from '../../../store/orders'
import { PlaceOrder, TokenDataItem } from '../../../types'
import {
  convertPriceToCanister,
  convertVolumeToCanister,
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

  const [tradeType, setTradeType] = useState('buy')
  const [amountType, setAmountType] = useState('quote')
  const [loading, setLoading] = useState(true)
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
  const symbol = Array.isArray(selectedSymbol)
    ? selectedSymbol[0]
    : selectedSymbol

  const initialValues = {
    price: '',
    quoteAmount: '',
    baseAmount: '',
    tradeType: tradeType,
    available: available?.volumeInAvailable,
    submit: false,
  }

  const validationSchema = Yup.object().shape(
    {
      tradeType: Yup.string(),
      available: Yup.number(),
      price: Yup.number()
        .required('Price is required')
        .typeError('Must be a number'),
      quoteAmount: Yup.number()
        .typeError('Must be a number')
        .min(minimumOrderSize, `Quote amount must be >= ${minimumOrderSize}`)
        .when(['tradeType', 'available'], {
          is: (tradeType: string, available: number) =>
            tradeType === 'buy' && available <= 0,
          then: (schema) =>
            schema.test('no-credit', 'No credit', function () {
              return false
            }),
        })
        .when('tradeType', {
          is: 'buy',
          then: (schema) =>
            schema.max(
              available?.volumeInAvailable || 0,
              `Quote amount must be <= ${available?.volumeInAvailable?.toFixed(selectedQuote.decimals)}`,
            ),
        })
        .when('baseAmount', (baseAmount, schema) =>
          baseAmount ? schema.required('Quote amount is required') : schema,
        ),
      baseAmount: Yup.number()
        .typeError('Must be a number')
        .when(['tradeType', 'available'], {
          is: (tradeType: string, available: number) =>
            tradeType === 'sell' && available <= 0,
          then: (schema) =>
            schema.test('no-credit', 'No credit', function () {
              return false
            }),
        })
        .when('tradeType', {
          is: 'sell',
          then: (schema) =>
            schema.max(
              available?.volumeInAvailable || 0,
              `Base amount must be <= ${available?.volumeInAvailable?.toFixed(symbol?.decimals)}`,
            ),
        })
        .when('price', ([price], schema) => {
          const minimumBaseAmount =
            typeof price === 'number' && price > 0
              ? minimumOrderSize / price
              : minimumOrderSize
          return schema.min(
            minimumBaseAmount,
            `Base amount must be >= ${minimumBaseAmount.toFixed(symbol?.decimals)}`,
          )
        })
        .when('quoteAmount', (quoteAmount, schema) =>
          quoteAmount ? schema.required('Base amount is required') : schema,
        ),
    },
    [['baseAmount', 'quoteAmount']],
  )

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values, { setStatus, setSubmitting, resetForm }) => {
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
        resetForm({ values: initialValues })

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
        .then((response: PlaceOrder) => {
          setStatus({ success: true })
          resetForm({ values: initialValues })
          setMessage(null)
          dispatch(setIsRefreshOpenOrders())
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

  const handleTradeTypeChange = (type: string) => {
    if (!formik.isSubmitting) {
      setMessage(null)
      setTradeType(type)
      updateAvailable(type)
      setSelectedPercentage(null)
      formik.resetForm({ values: initialValues })
      formik.setFieldValue('price', '')
      formik.setFieldValue('quoteAmount', '')
      formik.setFieldValue('baseAmount', '')
    }
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

  async function fetchBalances() {
    setLoading(true)
    const { getBalancesCredits } = useBalances()
    const balancesCredits = await getBalancesCredits(userAgent, tokens)
    dispatch(setBalances(balancesCredits))
    setLoading(false)
  }

  useEffect(() => {
    formik.resetForm({ values: initialValues })
    handlePercentageClick(0)
    setMessage(null)
  }, [selectedSymbol])

  useEffect(() => {
    updateAvailable(tradeType)
  }, [balances])

  useEffect(() => {
    fetchBalances()
  }, [userAgent, selectedSymbol])

  useEffect(() => {
    formik.setFieldValue('tradeType', tradeType)
  }, [tradeType])

  useEffect(() => {
    formik.setFieldValue('available', available?.volumeInAvailable)
  }, [available])

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
        baseAmount = percentageAvailable / parseFloat(formik.values.price)
        quoteAmount = baseAmount * parseFloat(formik.values.price)
      } else {
        baseAmount = percentageAvailable * parseFloat(formik.values.price)
        quoteAmount = baseAmount / parseFloat(formik.values.price)
      }

      formik.setFieldValue('baseAmount', baseAmount.toFixed(symbol?.decimals))
      formik.setFieldValue(
        'quoteAmount',
        quoteAmount.toFixed(selectedQuote.decimals),
      )
    }
  }, [selectedPercentage])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null)
      }, 30000)

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
            isDisabled={!selectedSymbol || !isAuthenticated}
            value={formik.values.price}
            onChange={(e) => {
              formik.handleChange(e)
              formik.setFieldValue('baseAmount', '')
              formik.setFieldValue('quoteAmount', '')
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
              isDisabled={
                !formik.values.price || !selectedSymbol || !isAuthenticated
              }
              value={formik.values.quoteAmount}
              onChange={(e) => {
                formik.handleChange(e)
                if (e.target.value && !isNaN(parseFloat(e.target.value))) {
                  formik.setFieldValue(
                    'baseAmount',
                    (
                      parseFloat(e.target.value) /
                      parseFloat(formik.values.price)
                    ).toFixed(symbol?.decimals),
                  )
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
              onClick={() => tradeType === 'buy' && setAmountType('quote')}
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
              isDisabled={
                !formik.values.price || !selectedSymbol || !isAuthenticated
              }
              value={formik.values.baseAmount}
              onChange={(e) => {
                formik.handleChange(e)
                if (e.target.value && !isNaN(parseFloat(e.target.value))) {
                  formik.setFieldValue(
                    'quoteAmount',
                    (
                      parseFloat(e.target.value) *
                      parseFloat(formik.values.price)
                    ).toFixed(selectedQuote.decimals),
                  )
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
              onClick={() => tradeType === 'buy' && setAmountType('base')}
            >
              {symbol?.base}
            </Button>
          </InputRightElement>
        </InputGroup>
        {formik.errors.baseAmount && formik.touched.baseAmount && (
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
              {available?.volumeInAvailable && symbol && tradeType ? (
                <>
                  {` ${available.volumeInAvailable.toFixed(available.volumeInBaseDecimals)} `}
                </>
              ) : (
                <>{` 0 `}</>
              )}
              <Text as="span" fontSize="11px">
                {tradeType === 'buy' ? symbol?.quote : symbol?.base}
              </Text>
            </Text>
          </Box>{' '}
          <Button
            background={tradeType === 'buy' ? 'green.500' : 'red.500'}
            variant="solid"
            h="58px"
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
                Creating Order <Spinner ml={2} size="sm" color="grey.25" />
              </>
            ) : (
              'Create Order'
            )}
          </Button>
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
