import React from 'react'

import { Box, Table, Thead, Tbody, Tr, Th, Text } from '@chakra-ui/react'

import PriceHistoryRow from './priceHistoryRow'
import { DataItem, Option } from '../../../types'

interface PriceHistoryProps {
  prices: DataItem[]
  selectedSymbol: Option | null
}

const TradeHistory: React.FC<PriceHistoryProps> = ({
  prices,
  selectedSymbol,
}) => {
  return (
    <Box>
      <Table variant="unstyled" size="sm">
        <Thead>
          <Tr>
            <Th textAlign="center">Price</Th>
            <Th textAlign="center" whiteSpace="nowrap">
              Amount
              <Text as="span" fontSize="10px">
                {' '}
                ({selectedSymbol && selectedSymbol.quote})
              </Text>
            </Th>
            <Th textAlign="center">Time</Th>
          </Tr>
        </Thead>
        <Tbody>
          {prices.map((price) => (
            <PriceHistoryRow
              key={price.id}
              price={price}
              selectedSymbol={selectedSymbol}
            />
          ))}
        </Tbody>
      </Table>
    </Box>
  )
}

export default TradeHistory
