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
  const claimTooltipTextStandard = (
    <>
      {`Claim Direct Deposit`}
      <br />
      {`Please wait...`}
    </>
  )

  const bgColorHover = useColorModeValue('grey.300', 'grey.500')
  const bgColor = useColorModeValue('grey.200', 'grey.600')
  const fontColor = useColorModeValue('grey.700', 'grey.25')

  const [action, setAction] = useState('')
  const [depositAllowance, setDepositAllowance] = useState<string | null>(null)
  const [maxDepositAllowance, setMaxDepositAllowance] = useState<string | null>(
    null,
  )
  const [claimTooltipText, setClaimTooltipText] = useState(
    claimTooltipTextStandard,
  )

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
      if (Number(values.amount) > 0) {
        if (action === 'withdraw') {
          handleWithdraw(Number(values.amount), values.account, token)
        } else if (action === 'deposit') {
          handleDeposit(Number(values.amount), values.account, token)
        }
      }
    },
  })

  const getBalanceOf = async (account: string | null = null) => {
    const { getBalance } = useWallet()
    const accountData = account ? account : userPrincipal
    const action = !account ? 'claim' : 'deposit'

    return await getBalance(
      userAgent,
      [token],
      `${token.principal}`,
      accountData,
      action,
    )
  }

  const handleTrackedDeposit = async () => {
    setClaimTooltipText(claimTooltipTextStandard)

    const { getTrackedDeposit } = useWallet()

    const balanceOf = await getBalanceOf()

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
      setClaimTooltipText(
        <>
          {`Claim Direct Deposit`}
          <br />
          {`Not Available`}
        </>,
      )
    } else if (balanceOf <= deposit) {
      setClaimTooltipText(
        <>
          {`Claim Direct Deposit`}
          <br />
          {`No deposits available`}
        </>,
      )
    } else {
      setClaimTooltipText(
        <>
          {`Claim Direct Deposit`}
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

  const handleMaxDepositAllowance = async (depositAllowanceAmount: string) => {
    if (formik.values.account && depositAllowanceAmount) {
      const balanceOf = await getBalanceOf(formik.values.account)

      const max =
        Math.min(Number(depositAllowanceAmount), Number(balanceOf)) -
        Number(token.fee)

      const amount = max > 0 ? fixDecimal(max, token.decimals) : '0'
      setMaxDepositAllowance(amount)
    }
  }

  const handleGetDepositAllowanceInfo = async () => {
    setMaxDepositAllowance(null)

    if (formik.values.account) {
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
        handleMaxDepositAllowance(amount)
      } else setDepositAllowance(null)
    }
  }

  useEffect(() => {
    if (action === 'deposit') {
      handleGetDepositAllowanceInfo()
    }
  }, [formik.values.account])

  useEffect(() => {
    formik.setFieldValue('action', action)
    formik.resetForm({ values: initialValues })
    setMaxDepositAllowance(null)
    setDepositAllowance(null)
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
            <Flex direction="column" align="flex-end" ml={2} overflowX="auto">
              <Flex align="center" overflowX="auto" whiteSpace="nowrap">
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
                <Tooltip label={claimTooltipText} aria-label="Claim Deposit">
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
                    {action === 'deposit'
                      ? 'Source account'
                      : 'Destination account'}
                  </FormLabel>
                  {depositAllowance && (
                    <Text color="grey.400" fontSize="12px">
                      Allowance amount: {depositAllowance} {token.base}
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
                      onClick={() => {
                        if (action === 'withdraw') {
                          handleMaxAvailableClick()
                        } else if (action === 'deposit' && depositAllowance) {
                          handleMaxDepositAllowance(depositAllowance)
                        }
                      }}
                    >
                      Max
                    </Button>
                  </InputRightElement>
                </InputGroup>
                {maxDepositAllowance && (
                  <Text color="grey.400" fontSize="12px">
                    Max available: {maxDepositAllowance} {token.base}
                  </Text>
                )}
                {!!formik.errors.amount && formik.touched.amount && (
                  <Text color="red.500" fontSize="12px">
                    {formik.errors.amount}
                  </Text>
                )}
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
                    (action === 'withdraw' &&
                      token.withdrawStatus === 'loading') ||
                    (action === 'deposit' && token.depositStatus === 'loading')
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
