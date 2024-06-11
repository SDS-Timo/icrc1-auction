import React from 'react'

import { CloseIcon, ViewIcon } from '@chakra-ui/icons'
import { Image, IconButton, Td, Tr } from '@chakra-ui/react'

import longIcon from '../../../assets/img/icons/long.svg'
import shortIcon from '../../../assets/img/icons/short.svg'
import { Order } from '../../../types'

interface OrdersRowProps {
  order: Order
  handleCancelOrder: (id: string) => void
  handleViewOrder: (id: string) => void
}

const OrdersRow: React.FC<OrdersRowProps> = ({
  order,
  handleCancelOrder,
  handleViewOrder,
}) => {
  return (
    <Tr key={order.id}>
      <Td
        display="flex"
        alignItems="center"
        justifyContent="center"
        maxH="45px"
      >
        <Image
          src={order.side === 'buy' ? longIcon : shortIcon}
          alt={order.side === 'buy' ? 'Long' : 'Short'}
          mr={2}
        />
        {order.side}
      </Td>
      <Td textAlign="center">{order.amount}</Td>
      <Td textAlign="center">{order.price}</Td>
      <Td textAlign="center">
        <IconButton
          aria-label="Cancel Order"
          icon={<CloseIcon />}
          onClick={() => handleCancelOrder(order.id)}
          variant="ghost"
          size="sm"
          mr={2}
        />
        <IconButton
          aria-label="View Order"
          icon={<ViewIcon />}
          onClick={() => handleViewOrder(order.id)}
          variant="ghost"
          size="sm"
        />
      </Td>
    </Tr>
  )
}

export default OrdersRow
