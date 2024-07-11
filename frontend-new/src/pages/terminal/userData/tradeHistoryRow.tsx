import React from 'react'

import { ViewIcon } from '@chakra-ui/icons'
import { Flex, IconButton, Td, Tr, Image, Text } from '@chakra-ui/react'

import { TokenDataItem } from '../../../types'

interface TradeHistoryRowProps {
  data: TokenDataItem
  toggleVolume: string
  handleViewTransaction: (id: number | undefined) => void
}

const TradeHistoryRow: React.FC<TradeHistoryRowProps> = ({
  data,
  toggleVolume,
  handleViewTransaction,
}) => {
  return (
    <Tr key={data.id}>
      <Td textAlign="center">
        <Flex justifyContent="center" alignItems="center">
          <Image src={data.logo} alt={data.symbol} h="20px" w="20px" />
          <Text ml="3px" fontWeight="600">
            {data.base}
          </Text>
          <Text fontSize="10px">/{data.quote}</Text>
        </Flex>
      </Td>
      <Td
        textAlign="center"
        color={data.type === 'buy' ? 'green.500' : 'red.500'}
      >
        {data.type}
      </Td>
      <Td textAlign="center">
        {toggleVolume === 'quote'
          ? data.volumeInQuote.toFixed(data.volumeInQuoteDecimals)
          : data.volumeInBase.toFixed(data.volumeInBaseDecimals)}
      </Td>
      <Td textAlign="center">
        {data.price.toLocaleString('en-US', {
          minimumFractionDigits: data.priceDecimals,
          maximumFractionDigits: data.priceDecimals,
        })}
      </Td>
      <Td textAlign="center">
        <IconButton
          aria-label="View Order"
          icon={<ViewIcon />}
          onClick={() => handleViewTransaction(data.id)}
          variant="ghost"
          size="xs"
        />
      </Td>
    </Tr>
  )
}

export default TradeHistoryRow
