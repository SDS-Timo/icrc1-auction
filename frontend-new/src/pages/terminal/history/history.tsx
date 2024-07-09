import React, { useState } from 'react'

import { Box, Table, Thead, Tbody, Tr, Th, Text } from '@chakra-ui/react'

import HistoryRow from './historyRow'
import { DataItem, Option } from '../../../types'

interface HistoryProps {
  historyData: DataItem[]
  selectedSymbol: Option | null
}

const TradeHistory: React.FC<HistoryProps> = ({
  historyData,
  selectedSymbol,
}) => {
  const [toggleVolume, setToggleVolume] = useState('quote')

  const handleToggleVolume = () => {
    setToggleVolume((prevState) => (prevState === 'quote' ? 'base' : 'quote'))
  }

  return (
    <Box>
      <Table variant="unstyled" size="sm">
        <Thead>
          <Tr>
            <Th textAlign="center">Price</Th>
            <Th
              textAlign="center"
              whiteSpace="nowrap"
              cursor="pointer"
              onClick={handleToggleVolume}
              _hover={{ textDecoration: 'underline' }}
            >
              Amount
              <Text as="span" fontSize="10px">
                {' '}
                (
                {selectedSymbol && toggleVolume === 'quote'
                  ? selectedSymbol.quote
                  : selectedSymbol && selectedSymbol.base}
                )
              </Text>
            </Th>
            <Th textAlign="center">Time</Th>
          </Tr>
        </Thead>
        <Tbody>
          {historyData.map((data) => (
            <HistoryRow key={data.id} data={data} toggleVolume={toggleVolume} />
          ))}
        </Tbody>
      </Table>
    </Box>
  )
}

export default TradeHistory
