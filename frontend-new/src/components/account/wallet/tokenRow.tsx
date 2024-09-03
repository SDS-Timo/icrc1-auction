import React, { useState, useEffect } from 'react'

import {
  Flex,
  Image,
  Tooltip,
  Text,
  IconButton,
  Spinner,
  useColorModeValue,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  FormControl,
  FormLabel,
  Button,
  Input,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react'
import { HttpAgent } from '@dfinity/agent'
import { useFormik } from 'formik'
import { LuDownload, LuUpload } from 'react-icons/lu'
import * as Yup from 'yup'

import useWallet from '../../../hooks/useWallet'
import { TokenDataItem, TokenMetadata } from '../../../types'
import { fixDecimal } from '../../../utils/calculationsUtils'

interface TokenRowProps {
  token: TokenDataItem
  userAgent: HttpAgent
  userPrincipal: string
  handleNotify: (principal: string | undefined, base: string) => void
  handleWithdraw: (
    amount: number,
    account: string | undefined,
    token: TokenMetadata,
  ) => void
  currentIndex: number | undefined
  onAccordionChange: (index: number | undefined) => void
}

const TokenRow: React.FC<TokenRowProps> = ({
  token,
  userAgent,
  userPrincipal,
  handleNotify,
  handleWithdraw,
  currentIndex,
  onAccordionChange,
}) => {
  const tooltipTextStandard = (
    <>
      {`Checking deposit`}
      <br />
      {`Please wait...`}
    </>
  )

  const bgColorHover = useColorModeValue('grey.300', 'grey.500')
  const bgColor = useColorModeValue('grey.200', 'grey.600')
  const fontColor = useColorModeValue('grey.700', 'grey.25')

  const [tooltipText, setTooltipText] = useState(tooltipTextStandard)

  const initialValues = {
    amount: '',
    account: '',
    submit: false,
  }

  const validationSchema = Yup.object().shape({
    amount: Yup.number()
      .required('')
      .typeError('')
      .max(token.volumeInAvailable || 0, `Not enough funds`),
    account: Yup.string().typeError(''),
  })

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      handleWithdraw(Number(values.amount), values.account, token)
    },
  })

  const handleTrackedDeposit = async () => {
    setTooltipText(tooltipTextStandard)

    const { getBalance, getTrackedDeposit } = useWallet()

    const balanceOf = await getBalance(
      userAgent,
      [token],
      `${token.principal}`,
      userPrincipal,
    )

    const deposit = await getTrackedDeposit(
      userAgent,
      [token],
      `${token.principal}`,
    )

    if (
      typeof balanceOf !== 'number' ||
      typeof deposit !== 'number' ||
      isNaN(balanceOf) ||
      isNaN(deposit)
    ) {
      setTooltipText(<>{`Not Available`}</>)
    } else if (balanceOf <= deposit) {
      setTooltipText(<>{`No deposits available`}</>)
    } else {
      setTooltipText(
        <>
          {`Claim deposit`}
          <br />
          {`${fixDecimal(balanceOf - deposit, token.decimals)} ${token.base} available`}
        </>,
      )
    }
  }

  const handleWithdrawClick = () => {
    onAccordionChange(currentIndex === 0 ? undefined : 0)
  }

  const handleMaxAvailableClick = () => {
    formik.setFieldValue('amount', token.volumeInAvailable)
  }

  useEffect(() => {
    if (token.withdrawStatus === 'success') {
      formik.setStatus({ success: true })
      formik.resetForm({ values: initialValues })
    } else if (token.withdrawStatus === 'error') {
      formik.setStatus({ success: false })
    }
  }, [token.withdrawStatus])

  return (
    <Accordion allowToggle index={currentIndex === 0 ? 0 : undefined}>
      <AccordionItem border="none">
        <>
          <AccordionButton display="none" />
          <Flex key={token.id} justify="space-between" align="center" py={2}>
            <Flex align="center">
              <Image src={token.logo} alt={token.symbol} h="30px" w="30px" />
              <Text ml={2} fontSize="15px" fontWeight={600}>
                {token.symbol}
              </Text>
            </Flex>
            <Flex direction="column" align="flex-end" ml={2}>
              <Flex align="center">
                <Text mr={2}>
                  {fixDecimal(token.volumeInTotal, token.decimals)}
                </Text>
                <Tooltip label={tooltipText} aria-label="Claim Deposit">
                  <IconButton
                    aria-label="Claim Deposit"
                    icon={
                      token?.notifyLoading ? (
                        <Spinner size="xs" />
                      ) : (
                        <LuDownload size="15px" />
                      )
                    }
                    onClick={() => handleNotify(token.principal, token.base)}
                    onMouseEnter={() => handleTrackedDeposit()}
                    variant="ghost"
                    size="xs"
                    _hover={{
                      bg: bgColorHover,
                    }}
                  />
                </Tooltip>
                <Tooltip label="Withdraw" aria-label="Withdraw">
                  <IconButton
                    aria-label="Withdraw"
                    icon={<LuUpload size="15px" />}
                    variant="ghost"
                    size="xs"
                    _hover={{
                      bg: bgColorHover,
                    }}
                    onClick={handleWithdrawClick}
                  />
                </Tooltip>
              </Flex>
              <Flex
                direction="row"
                justify="space-between"
                align="center"
                w="full"
              >
                <Text fontSize="12px" color="grey.400">
                  {fixDecimal(token.volumeInLocked, token.decimals)} Locked
                </Text>
                <Text ml={2} fontSize="12px" color="grey.400">
                  {fixDecimal(token.volumeInAvailable, token.decimals)}{' '}
                  Available
                </Text>
              </Flex>
            </Flex>
          </Flex>

          <AccordionPanel pb={4}>
            <Flex direction="column" gap={4}>
              <Flex direction="column">
                <InputGroup>
                  <FormControl variant="floating">
                    <Input
                      h="58px"
                      placeholder=" "
                      name="amount"
                      sx={{ borderRadius: '5px' }}
                      isInvalid={
                        !!formik.errors.amount && formik.touched.amount
                      }
                      isDisabled={false}
                      value={formik.values.amount}
                      onKeyUp={() => formik.validateField('amount')}
                      onChange={(e) => {
                        formik.handleChange(e)
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
                      bgColor={'grey.500'}
                      color="grey.25"
                      _hover={{
                        bg: 'grey.400',
                        color: 'grey.25',
                      }}
                      onClick={handleMaxAvailableClick}
                    >
                      Max
                    </Button>
                  </InputRightElement>
                </InputGroup>
                {!!formik.errors.amount && formik.touched.amount && (
                  <Text color="red.500" fontSize="12px">
                    {formik.errors.amount}
                  </Text>
                )}
              </Flex>
              <Flex direction="column">
                <FormControl variant="floating">
                  <Input
                    h="58px"
                    placeholder=" "
                    name="account"
                    sx={{ borderRadius: '5px' }}
                    isInvalid={
                      !!formik.errors.account && formik.touched.account
                    }
                    isDisabled={false}
                    value={formik.values.account}
                    onKeyUp={() => formik.validateField('account')}
                    onChange={(e) => {
                      formik.handleChange(e)
                    }}
                  />
                  <FormLabel color="grey.500" fontSize="15px">
                    Account
                  </FormLabel>
                  {!!formik.errors.account && formik.touched.account && (
                    <Text color="red.500" fontSize="12px">
                      {formik.errors.account}
                    </Text>
                  )}
                </FormControl>
              </Flex>
              <Flex direction="column">
                <Button
                  background={bgColor}
                  variant="solid"
                  h="58px"
                  color={fontColor}
                  _hover={{
                    bg: bgColorHover,
                    color: fontColor,
                  }}
                  isDisabled={token.withdrawStatus === 'loading'}
                  onClick={() => formik.handleSubmit()}
                >
                  {token.withdrawStatus === 'loading' ? (
                    <>
                      Withdraw <Spinner ml={2} size="sm" color={fontColor} />
                    </>
                  ) : (
                    'Withdraw'
                  )}
                </Button>
              </Flex>
            </Flex>
          </AccordionPanel>
        </>
      </AccordionItem>
    </Accordion>
  )
}

export default TokenRow
