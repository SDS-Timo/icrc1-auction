import { useState, useEffect } from 'react'

import {
  Button,
  Input,
  VStack,
  Flex,
  Text,
  FormLabel,
  FormControl,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { useFormik } from 'formik'
import { useSelector } from 'react-redux'
import * as Yup from 'yup'

import TradeTypeSelector from './tradeTypeSelector'
import AuthComponent from '../../../components/auth'
import useOrders from '../../../hooks/useOrders'
import { RootState } from '../../../store'

const Trading = () => {
  const bgColor = useColorModeValue('grey.200', 'grey.600')
  const fontColor = useColorModeValue('grey.700', 'grey.25')
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [tradeType, setTradeType] = useState('buy')
  const [selectedPercentage, setSelectedPercentage] = useState(null)
  const [message, setMessage] = useState('')
  const { userAgent } = useSelector((state: RootState) => state.auth)
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  )
  const selectedSymbol = useSelector(
    (state: RootState) => state.tokens.selectedSymbol,
  )
  const symbol = Array.isArray(selectedSymbol)
    ? selectedSymbol[0]
    : selectedSymbol

  const handleTradeTypeChange = (type: any) => {
    setTradeType(type)
  }

  const handlePercentageClick = (percentage: any) => {
    setSelectedPercentage(percentage === selectedPercentage ? null : percentage)
  }

  const initialValues = {
    price: '',
    quoteAmount: '',
    baseAmount: '',
    submit: false,
  }

  const validationSchema = Yup.object().shape(
    {
      price: Yup.number()
        .required('Price is required')
        .typeError('Must be a number'),
      quoteAmount: Yup.number()
        .typeError('Must be a number')
        .min(0, 'Quote amount must be >= 0')
        .when('baseAmount', (baseAmount, schema) =>
          baseAmount ? schema.required('Quote amount is required') : schema,
        ),
      baseAmount: Yup.number()
        .typeError('Must be a number')
        .min(0, 'Base amount must be >= 0')
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
      const { placeOrders } = useOrders()

      const order = {
        volume: parseInt(values.baseAmount),
        price: parseFloat(values.price),
        type: tradeType,
      }

      placeOrders(userAgent, symbol, order)
        .then(() => {
          setStatus({ success: true })
          resetForm({ values: initialValues })
          setMessage('')
          console.log(values)
        })
        .catch((error) => {
          const message = error.response ? error.response.data : error.message
          setMessage(message)
          console.error(message)

          setStatus({ success: false })
          setSubmitting(false)
        })
    },
  })

  useEffect(() => {
    formik.resetForm({ values: initialValues })
    handlePercentageClick(0)
  }, [selectedSymbol])

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
            isDisabled={!selectedSymbol}
            value={formik.values.price}
            onChange={formik.handleChange}
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
        <FormControl variant="floating">
          <Input
            h="58px"
            placeholder=" "
            name="quoteAmount"
            sx={{ borderRadius: '5px' }}
            isDisabled={!formik.values.price || !selectedSymbol}
            value={formik.values.quoteAmount}
            onChange={(e) => {
              formik.handleChange(e)
              if (e.target.value && !isNaN(parseFloat(e.target.value))) {
                formik.setFieldValue(
                  'baseAmount',
                  (
                    parseFloat(e.target.value) / parseFloat(formik.values.price)
                  ).toFixed(symbol?.decimals),
                )
              }
            }}
          />
          <FormLabel color="grey.500" fontSize="15px">
            Amount {symbol?.quote}
          </FormLabel>
          {!!formik.errors.quoteAmount && formik.touched.quoteAmount && (
            <Text color="red.500" fontSize="12px">
              {formik.errors.quoteAmount}
            </Text>
          )}
        </FormControl>
      </Flex>
      <Flex direction="column">
        <FormControl variant="floating">
          <Input
            h="58px"
            placeholder=" "
            name="baseAmount"
            sx={{ borderRadius: '5px' }}
            isDisabled={!formik.values.price || !selectedSymbol}
            value={formik.values.baseAmount}
            onChange={(e) => {
              formik.handleChange(e)
              if (e.target.value && !isNaN(parseFloat(e.target.value))) {
                formik.setFieldValue(
                  'quoteAmount',
                  (
                    parseFloat(e.target.value) * parseFloat(formik.values.price)
                  ).toFixed(2),
                )
              }
            }}
          />
          <FormLabel color="grey.500" fontSize="15px">
            Amount {symbol?.base}
          </FormLabel>
          {formik.errors.baseAmount && formik.touched.baseAmount && (
            <Text color="red.500" fontSize="12px">
              {formik.errors.baseAmount}
            </Text>
          )}
        </FormControl>
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
        <Flex justifyContent="center" alignItems="center" h="10vh">
          <Button
            onClick={onOpen}
            variant="unstyled"
            _hover={{
              bg: bgColor,
              color: fontColor,
            }}
            fontSize="sm"
            size="sm"
            px="15px"
            isDisabled={!symbol}
          >
            Login or Create Account
          </Button>
          <AuthComponent isOpen={isOpen} onClose={onClose} />
        </Flex>
      ) : (
        <>
          <Text textAlign="center" fontSize="14px">
            Available:
            {selectedSymbol
              ? ' 7000 ' +
                (tradeType === 'buy'
                  ? symbol?.quote
                  : tradeType === 'sell'
                    ? symbol?.base
                    : '')
              : ''}
          </Text>
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
            Create Order
          </Button>
        </>
      )}
      {message ?? (
        <Text textAlign="center" fontSize="15px" color="red.500">
          {message}
        </Text>
      )}
    </VStack>
  )
}

export default Trading
