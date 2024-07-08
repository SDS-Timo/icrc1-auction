import React from 'react'

import { Box, Table, Thead, Tbody, Tr, Th } from '@chakra-ui/react'

import PriceHistoryRow from './priceHistoryRow'
import { DataItem } from '../../../types'

interface PriceHistoryProps {
  prices: DataItem[]
}

const TradeHistory: React.FC<PriceHistoryProps> = ({ prices }) => {
  return (
    <Box>
      <Table variant="unstyled" size="sm">
        <Thead>
          <Tr>
            <Th textAlign="center">Price</Th>
            <Th textAlign="center">Amount</Th>
            <Th textAlign="center">Time</Th>
          </Tr>
        </Thead>
        <Tbody>
          {prices.map((price) => (
            <PriceHistoryRow key={price.id} price={price} />
          ))}
        </Tbody>
      </Table>
    </Box>
  )
}

export default TradeHistory
