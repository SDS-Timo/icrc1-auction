import React, { useState } from 'react'

import {
  Flex,
  Image,
  Tooltip,
  Text,
  IconButton,
  Spinner,
  useColorModeValue,
} from '@chakra-ui/react'
import { HttpAgent } from '@dfinity/agent'
import { LuDownload, LuUpload } from 'react-icons/lu'

import useWallet from '../../../hooks/useWallet'
import { TokenDataItem } from '../../../types'
import { fixDecimal } from '../../../utils/calculationsUtils'

interface TokenRowProps {
  token: TokenDataItem
  userAgent: HttpAgent
  isPrincipal: string
  handleNotify: (principal: string | undefined, base: string) => void
}

const TokenRow: React.FC<TokenRowProps> = ({
  token,
  userAgent,
  isPrincipal,
  handleNotify,
}) => {
  const tooltipTextStandard = (
    <>
      {`Checking deposit`}
      <br />
      {`Please wait...`}
    </>
  )

  const bgColorHover = useColorModeValue('grey.300', 'grey.500')
  const [tooltipText, setTooltipText] = useState(tooltipTextStandard)

  const handleTrackedDeposit = async () => {
    setTooltipText(tooltipTextStandard)

    const { getBalance, getTrackedDeposit } = useWallet()

    const balanceOf = await getBalance(
      userAgent,
      [token],
      `${token.principal}`,
      isPrincipal,
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

  return (
    <Flex key={token.id} justify="space-between" align="center" py={2}>
      <Flex align="center">
        <Image src={token.logo} alt={token.symbol} h="30px" w="30px" />
        <Text ml={2} fontSize="15px" fontWeight={600}>
          {token.symbol}
        </Text>
      </Flex>
      <Flex direction="column" align="flex-end" ml={2}>
        <Flex align="center">
          <Text mr={2}>{fixDecimal(token.volumeInTotal, token.decimals)}</Text>
          <Tooltip label={tooltipText} aria-label="Claim Deposit">
            <IconButton
              aria-label="Claim Deposit"
              icon={
                token?.loading ? (
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
            />
          </Tooltip>
        </Flex>
        <Flex direction="row" justify="space-between" align="center" w="full">
          <Text fontSize="12px" color="grey.400">
            {fixDecimal(token.volumeInLocked, token.decimals)} Locked
          </Text>
          <Text ml={2} fontSize="12px" color="grey.400">
            {fixDecimal(token.volumeInAvailable, token.decimals)} Available
          </Text>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default TokenRow
