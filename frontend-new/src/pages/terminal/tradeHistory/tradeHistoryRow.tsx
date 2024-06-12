import React from 'react'

import { Image, Td, Tr } from '@chakra-ui/react'

import longIcon from '../../../assets/img/icons/long.svg'
import shortIcon from '../../../assets/img/icons/short.svg'
import { Trade } from '../../../types'

interface TradeHistoryRowProps {
  trade: Trade
}

const TradeHistoryRow: React.FC<TradeHistoryRowProps> = ({ trade }) => {
  return (
    <Tr key={trade.id} textAlign="center">
      <Td
        display="flex"
        alignItems="center"
        justifyContent="center"
        fontSize="12px"
        maxH="35px"
      >
        <Image
          src={trade.type === 'buy' ? longIcon : shortIcon}
          alt={trade.type === 'buy' ? 'Long' : 'Short'}
          mr={2}
        />
        {trade.price}
      </Td>
      <Td textAlign="center" fontSize="12px">
        {trade.amount}
      </Td>
      <Td width="40%" textAlign="center" fontSize="12px">
        {trade.time}
      </Td>
    </Tr>
  )
}

export default TradeHistoryRow
