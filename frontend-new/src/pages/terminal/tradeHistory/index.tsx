import React from 'react'

import { Box, Text, Table, Thead, Tbody, Tr, Th } from '@chakra-ui/react'

import TradeHistoryRow from './tradeHistoryRow'
import { Trade } from '../../../types'

const tradeHistory: Trade[] = [
  { id: '1', price: 70000, amount: 12.5, time: '02:00 PM', type: 'buy' },
  { id: '2', price: 69000, amount: 11.75, time: '01:30 PM', type: 'sell' },
  { id: '3', price: 68000, amount: 3.75, time: '12:30 AM', type: 'buy' },
  { id: '4', price: 69000, amount: 9.75, time: '12:30 AM', type: 'buy' },
  { id: '5', price: 67000, amount: 3.75, time: '11:30 AM', type: 'buy' },
  { id: '6', price: 66000, amount: 7.75, time: '11:30 AM', type: 'sell' },
  { id: '7', price: 65000, amount: 6.75, time: '10:30 AM', type: 'sell' },
  { id: '8', price: 66000, amount: 0.75, time: '10:30 AM', type: 'buy' },
  { id: '9', price: 67000, amount: 1.75, time: '09:30 AM', type: 'buy' },
  { id: '10', price: 68000, amount: 0.75, time: '09:30 AM', type: 'sell' },
  { id: '11', price: 69000, amount: 2.75, time: '08:30 AM', type: 'sell' },
  { id: '12', price: 70000, amount: 6.75, time: '08:30 AM', type: 'sell' },
  { id: '13', price: 71000, amount: 5.75, time: '07:30 AM', type: 'sell' },
  { id: '14', price: 72000, amount: 1.75, time: '06:30 AM', type: 'buy' },
  { id: '15', price: 73000, amount: 0.75, time: '05:30 AM', type: 'sell' },
  { id: '16', price: 74000, amount: 2.75, time: '05:30 AM', type: 'sell' },
  { id: '17', price: 75000, amount: 4.75, time: '05:30 AM', type: 'buy' },
  { id: '18', price: 76000, amount: 3.75, time: '04:30 AM', type: 'buy' },
  { id: '19', price: 75000, amount: 2.55, time: '03:30 AM', type: 'buy' },
]

const TradeHistory: React.FC = () => {
  return (
    <Box>
      <Text mb="20px">Trade History</Text>
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
