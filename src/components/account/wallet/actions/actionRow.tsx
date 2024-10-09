import React from 'react'

import { Flex, Image, Text } from '@chakra-ui/react'

import { TokenDataItem } from '../../../../types'
import { fixDecimal } from '../../../../utils/calculationsUtils'
import ActionIcon from '../../../actionIcon'

interface ActionRowProps {
  data: TokenDataItem
}

const ActionRow: React.FC<ActionRowProps> = ({ data }) => {
  return (
    <Flex key={data.id} justify="space-between" align="center" py={2}>
      <Flex align="center">
        <Image src={data.logo} alt={data.symbol} boxSize="30px" />
        <Text ml={2} fontSize="15px" fontWeight={600}>
          {data.symbol}
        </Text>
      </Flex>
      <Flex direction="column" align="flex-end" ml={2} overflowX="auto">
        <Flex align="center" overflowX="auto" whiteSpace="nowrap">
          <Text mr={2}>{fixDecimal(data.volumeInBase, data.decimals)}</Text>
          <ActionIcon action={data.action} />
        </Flex>
        <Flex>
          <Text fontSize="12px" color="grey.400">
            {data.datetime}
          </Text>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default ActionRow
