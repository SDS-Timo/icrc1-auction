import React from 'react'

import { Td, Tr, Tooltip } from '@chakra-ui/react'

import { DataItem, Option } from '../../../types'

interface PriceHistoryRowProps {
  price: DataItem
  selectedSymbol: Option | null
}

const PriceHistoryRow: React.FC<PriceHistoryRowProps> = ({
  price,
  selectedSymbol,
}) => {
  return (
    <Tr key={price.id}>
      <Td textAlign="center">
        {price.price.toLocaleString('en-US', {
          minimumFractionDigits: price.priceDecimals,
          maximumFractionDigits: price.priceDecimals,
        })}
      </Td>
      <Td textAlign="center">
        <Tooltip
          label={`${price.volumeInBase.toFixed(price.volumeInBaseDecimals)} ${selectedSymbol?.base}`}
        >
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
