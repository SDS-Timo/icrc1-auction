import React from 'react'

import { Td, Tr, Tooltip } from '@chakra-ui/react'

import { DataItem } from '../../../types'

interface PriceHistoryRowProps {
  price: DataItem
}

const PriceHistoryRow: React.FC<PriceHistoryRowProps> = ({ price }) => {
  return (
    <Tr key={price.id}>
      <Td textAlign="center">
        {price.price.toLocaleString('en-US', {
          minimumFractionDigits: price.priceDecimals,
          maximumFractionDigits: price.priceDecimals,
        })}
      </Td>
      <Td textAlign="center">
        <Tooltip label={price.volumeInBase.toFixed(price.volumeInBaseDecimals)}>
          {price.volume.toFixed(price.volumeDecimals)}
        </Tooltip>
      </Td>
      <Td textAlign="center" whiteSpace="nowrap">
        <Tooltip label={price.datetime}>{price.time?.toUpperCase()}</Tooltip>
      </Td>
    </Tr>
  )
}

export default PriceHistoryRow
