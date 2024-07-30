import React from 'react'

import {
  Flex,
  Image,
  Tooltip,
  Text,
  IconButton,
  Spinner,
} from '@chakra-ui/react'
import { PiDownloadSimpleBold } from 'react-icons/pi'

import { TokenDataItem } from '../../../types'

interface WalletRowProps {
  token: TokenDataItem
  handleNotify: (principal: string | undefined, base: string) => void
}

const WalletRow: React.FC<WalletRowProps> = ({ token, handleNotify }) => {
  return (
    <Flex key={token.id} justify="space-between" align="center" py={2}>
      <Flex align="center">
        <Image src={token.logo} alt={token.symbol} h="30px" w="30px" />
        <Text ml={2} fontSize="14px" fontWeight={600}>
          {token.symbol}
        </Text>
      </Flex>
      <Flex align="center" ml={2}>
        <Text fontSize="13px" mr={2}>
          {token.volumeInBase.toFixed(token.volumeInBaseDecimals)}
        </Text>
        <Tooltip label="Notify Deposit" aria-label="Notify Deposit">
          <IconButton
            aria-label="Notify Deposit"
            icon={
              token?.action ? (
                <Spinner size="xs" />
              ) : (
                <PiDownloadSimpleBold size="15px" />
              )
            }
            onClick={() => handleNotify(token.principal, token.base)}
            variant="ghost"
            size="xs"
          />
        </Tooltip>
      </Flex>
    </Flex>
  )
}

export default WalletRow
