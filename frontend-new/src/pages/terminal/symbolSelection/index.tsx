import React, { useMemo, useState, useEffect } from 'react'

import { Box } from '@chakra-ui/react'
import { Select } from 'bymax-react-select'
import { useSelector, useDispatch } from 'react-redux'

import customStyles from './styles'
import useTokens from '../../../hooks/useTokens'
import { RootState, AppDispatch } from '../../../store'
import { setSelectedSymbol, setSelectedQuote } from '../../../store/tokens'
import { Option, TokenMetadata } from '../../../types'

const SymbolSelection: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const [tokens, setTokens] = useState<TokenMetadata[]>([])
  const [loading, setLoading] = useState(true)
  const { userAgent } = useSelector((state: RootState) => state.auth)
  const selectedSymbol = useSelector(
    (state: RootState) => state.tokens.selectedSymbol,
  )

  async function fetchTokens() {
    setLoading(true)

    const { getTokens } = useTokens()
    const data = await getTokens(userAgent)

    const quoteToken = data.find((token) => token.symbol === 'USDC')
    if (quoteToken) {
      dispatch(setSelectedQuote(quoteToken))
    }

    setTokens(data)
    setLoading(false)
  }

  const filteredTokens = useMemo(
    () => tokens.filter((token) => token.symbol !== 'USDC'),
    [tokens],
  )

  const options: Option[] = useMemo(
    () =>
      filteredTokens.map((token) => ({
        id: token.symbol,
        value: token.symbol,
        label: token.name,
        image: token.logo || '',
        base: token.base,
        quote: token.quote,
        decimals: token.decimals,
        principal: token.principal,
      })),
    [filteredTokens],
  )

  const handleChange = (option: Option | Option[] | null) => {
    dispatch(setSelectedSymbol(option))
  }

  useEffect(() => {
    fetchTokens()
  }, [])

  useEffect(() => {
    if (filteredTokens.length > 0) {
      const initialSymbol = filteredTokens[0].symbol
      const initialOption: Option = {
        id: initialSymbol,
        value: initialSymbol,
        label: filteredTokens[0].name,
        image: filteredTokens[0].logo || '',
        base: filteredTokens[0].base,
        quote: filteredTokens[0].quote,
        decimals: filteredTokens[0].decimals,
        principal: filteredTokens[0].principal,
      }
      dispatch(setSelectedSymbol(initialOption))
    } else {
      dispatch(setSelectedSymbol(null))
    }
  }, [filteredTokens])

  return (
    <Box w="100%" zIndex="9">
      <Select
        id="symbols"
        value={selectedSymbol}
        isMulti={false}
        isClearable={false}
        options={options}
        placeholder={loading ? 'Loading...' : 'Select a symbol'}
        noOptionsMessage="No symbols found"
        isLoading={loading}
        loadingMessage="Loading..."
        onChange={handleChange}
        styles={customStyles as any}
      />
    </Box>
  )
}

export default SymbolSelection
