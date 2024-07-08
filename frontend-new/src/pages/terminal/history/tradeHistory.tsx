import React from 'react'

import { Box, Table, Thead, Tbody, Tr, Th, Text } from '@chakra-ui/react'

import TradeHistoryRow from './tradeHistoryRow'
import { DataItem, Option } from '../../../types'

interface TradeHistoryProps {
  transactions: DataItem[]
  selectedSymbol: Option | null
}

const TradeHistory: React.FC<TradeHistoryProps> = ({
  transactions,
  selectedSymbol,
}) => {
  return (
    <Box>
      <Table variant="unstyled" size="sm">
        <Thead>
          <Tr>
            <Th textAlign="center">Price</Th>
            <Th textAlign="center" whiteSpace="nowrap">
              Amount{' '}
              <Text as="span" fontSize="10px">
                {' '}
                ({selectedSymbol && selectedSymbol.quote})
              </Text>
            </Th>
            <Th textAlign="center">Time</Th>
          </Tr>
        </Thead>
        <Tbody>
          {transactions.map((transaction) => (
            <TradeHistoryRow
              key={transaction.id}
              trade={transaction}
              selectedSymbol={selectedSymbol}
            />
          ))}
        </Tbody>
      </Table>
    </Box>
  )
}

export default TradeHistory
