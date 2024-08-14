import React, { useState } from 'react'

import { SearchIcon } from '@chakra-ui/icons'
import {
  Flex,
  InputGroup,
  Input,
  InputLeftElement,
  Progress,
} from '@chakra-ui/react'
import { HttpAgent } from '@dfinity/agent'

import TokenRow from './tokenRow'
import { TokenDataItem } from '../../../types'

interface TokenTabProps {
  balances: TokenDataItem[]
  userAgent: HttpAgent
  isPrincipal: string
  handleNotify: (principal: string, base: string) => void
  showSearch?: boolean
  loading: boolean
}

const TokenTab: React.FC<TokenTabProps> = ({
  balances,
  userAgent,
  isPrincipal,
  handleNotify,
  showSearch = false,
  loading,
}) => {
  const [filter, setFilter] = useState('')

  const filteredBalances = balances.filter((token) =>
    token.base.toLowerCase().includes(filter.toLowerCase()),
  )

  return (
    <>
      {showSearch && (
        <Flex justifyContent="flex-end" alignItems="center">
          <InputGroup size="xs" width="50%">
            <Input
              placeholder="Search"
              value={filter || ''}
              onChange={(e) => setFilter(e.target.value)}
              pr="2.5rem"
            />
            <InputLeftElement>
              <SearchIcon />
            </InputLeftElement>
          </InputGroup>
        </Flex>
      )}

      {loading ? (
        <Flex justify="center" align="center" h="100px">
          <Progress size="xs" isIndeterminate w="90%" />
        </Flex>
      ) : (
        filteredBalances.map((token) => (
          <TokenRow
            key={token.id}
            token={token}
            userAgent={userAgent}
            isPrincipal={isPrincipal}
            handleNotify={() => handleNotify(token.principal || '', token.base)}
          />
        ))
      )}
    </>
  )
}

export default TokenTab
