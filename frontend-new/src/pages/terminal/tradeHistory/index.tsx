import React from 'react'

import { Box, Text, Table, Thead, Tbody, Tr, Th } from '@chakra-ui/react'

import TradeHistoryRow from './tradeHistoryRow'
import { Trade } from '../../../types'

const tradeHistory: Trade[] = [
  { id: '1', price: 30000, amount: 1.5, time: '10:00 AM', type: 'buy' },
  { id: '2', price: 31000, amount: 0.75, time: '11:30 AM', type: 'sell' },
]

const TradeHistory: React.FC = () => {
  return (
    <Box>
      <Text mb="20px" fontWeight="bold">
        Trade History
      </Text>
      <Table variant="unstyled" size="sm">
        <Thead>
          <Tr>
            <Th textAlign="center">Price</Th>
            <Th textAlign="center">Amount</Th>
            <Th textAlign="center">Time</Th>
          </Tr>
        </Thead>
        <Tbody>
          {tradeHistory.map((trade) => (
            <TradeHistoryRow key={trade.id} trade={trade} />
          ))}
        </Tbody>
      </Table>
    </Box>
  )
}

export default TradeHistory
