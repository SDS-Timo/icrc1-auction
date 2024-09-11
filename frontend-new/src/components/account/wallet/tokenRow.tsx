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
import { decodeIcrcAccount } from '@dfinity/ledger-icrc'
import { useFormik } from 'formik'
import { LuDownload, LuUpload } from 'react-icons/lu'
import { RiHandCoinLine } from 'react-icons/ri'
import * as Yup from 'yup'

import useWallet from '../../../hooks/useWallet'
import { TokenDataItem, TokenMetadata } from '../../../types'
import {
  fixDecimal,
  convertVolumeFromCanister,
} from '../../../utils/calculationsUtils'

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
  handleDeposit: (
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
  handleDeposit,
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

  const [action, setAction] = useState('')
  const [allowanceLoading, setAllowanceLoading] = useState(false)
  const [depositAllowance, setDepositAllowance] = useState<string | null>(null)
  const [tooltipText, setTooltipText] = useState(tooltipTextStandard)

  const initialValues = {
    amount: '',
    account: '',
    action: action,
    submit: false,
  }

  const validationSchema = Yup.object().shape({
    amount: Yup.number()
      .required('Amount is a required field')
      .typeError('')
      .when('action', {
        is: 'withdraw',
        then: (schema) =>
          schema.max(token.volumeInAvailable || 0, 'Not enough funds'),
      }),
    account: Yup.string().required('Account is a required field').typeError(''),
  })

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      if (action === 'withdraw') {
        handleWithdraw(Number(values.amount), values.account, token)
      } else if (action === 'deposit') {
        handleDeposit(Number(values.amount), values.account, token)
      }
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

  const handleAccordionToggle = (actionType: string) => {
    if (currentIndex === 0 && action === actionType) {
      onAccordionChange(undefined)
    } else if (currentIndex === undefined) {
      onAccordionChange(0)
      setAction(actionType)
    } else {
      setAction(actionType)
    }
  }

  const handleMaxAvailableClick = () => {
    if (action === 'withdraw')
      formik.setFieldValue('amount', token.volumeInAvailable)
  }

  const handleGetDepositAllowanceInfo = async () => {
    try {
      if (formik.values.account) {
        setAllowanceLoading(true)

        decodeIcrcAccount(formik.values.account)

        const { getDepositAllowanceInfo } = useWallet()

        const result = await getDepositAllowanceInfo(
          userAgent,
          token.principal,
          formik.values.account,
        )

        if (result?.allowance !== undefined && result?.allowance !== null) {
          const { volumeInBase: allowanceResult } = convertVolumeFromCanister(
            Number(result.allowance),
            token.decimals,
            0,
          )
          const amount = fixDecimal(allowanceResult, token.decimals)
          setDepositAllowance(amount)
        } else setDepositAllowance(null)

        setAllowanceLoading(false)
      }
    } catch (error) {
      setAllowanceLoading(false)
      setDepositAllowance(null)
    }
  }

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined

    if (!allowanceLoading && formik.values.account) {
      timer = setInterval(() => {
        handleGetDepositAllowanceInfo()
      }, 2000)
    }

    return () => {
      clearInterval(timer)
    }
  }, [formik.values.account])

  useEffect(() => {
    formik.setFieldValue('action', action)
  }, [action])

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
              <Image src={token.logo} alt={token.symbol} boxSize="30px" />
              <Text ml={2} fontSize="15px" fontWeight={600}>
                {token.symbol}
              </Text>
            </Flex>
            <Flex direction="column" align="flex-end" ml={2}>
              <Flex align="center">
                <Text mr={2}>
                  {fixDecimal(token.volumeInTotal, token.decimals)}
                </Text>
                <Tooltip label="Deposit by Allowance" aria-label="Allowance">
                  <IconButton
                    aria-label="Allowance"
                    icon={<RiHandCoinLine size="15px" />}
                    variant="ghost"
                    size="xs"
                    _hover={{
                      bg: bgColorHover,
                    }}
                    onClick={() => handleAccordionToggle('deposit')}
                  />
                </Tooltip>
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
                    onClick={() => {
                      handleNotify(token.principal, token.base)
                      setAction('claim')
                    }}
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
                    onClick={() => handleAccordionToggle('withdraw')}
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
                  {depositAllowance && (
                    <Text color="grey.400" fontSize="12px">
                      Amount allowance: {depositAllowance} {token.base}
                    </Text>
                  )}
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
                  isDisabled={
                    action === 'withdraw' && token.withdrawStatus === 'loading'
                  }
                  onClick={() => formik.handleSubmit()}
                >
                  {action === 'withdraw' ? (
                    token.withdrawStatus === 'loading' ? (
                      <>
                        Withdraw <Spinner ml={2} size="sm" color={fontColor} />
                      </>
                    ) : (
                      'Withdraw'
                    )
                  ) : action === 'deposit' ? (
                    token.depositStatus === 'loading' ? (
                      <>
                        Deposit <Spinner ml={2} size="sm" color={fontColor} />
                      </>
                    ) : (
                      'Deposit'
                    )
                  ) : null}
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
