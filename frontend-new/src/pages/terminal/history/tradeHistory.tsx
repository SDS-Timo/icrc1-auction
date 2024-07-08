import React from 'react'

import { Box, Table, Thead, Tbody, Tr, Th } from '@chakra-ui/react'

import TradeHistoryRow from './tradeHistoryRow'
import { DataItem } from '../../../types'

interface TradeHistoryProps {
  transactions: DataItem[]
}

const TradeHistory: React.FC<TradeHistoryProps> = ({ transactions }) => {
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
          {transactions.map((transaction) => (
            <TradeHistoryRow key={transaction.id} trade={transaction} />
          ))}
        </Tbody>
      </Table>
    </Box>
  )
}

export default TradeHistory
