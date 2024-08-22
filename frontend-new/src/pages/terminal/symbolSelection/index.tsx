import React, { useMemo, useState, useEffect } from 'react'

import { Box } from '@chakra-ui/react'
import { Select } from 'bymax-react-select'
import { useSelector, useDispatch } from 'react-redux'

import customStyles from './styles'
import useTokens from '../../../hooks/useTokens'
import { RootState, AppDispatch } from '../../../store'
import {
  setTokens,
  setSelectedSymbol,
  setSelectedQuote,
} from '../../../store/tokens'
import { Option } from '../../../types'

const SymbolSelection: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const [loading, setLoading] = useState(true)
  const [quoteSymbol, setQuoteSymbol] = useState('USDC')
  const { userAgent } = useSelector((state: RootState) => state.auth)
  const tokens = useSelector((state: RootState) => state.tokens.tokens)
  const tokenDefault = process.env.ENV_TOKEN_SELECTED_DEFAULT
  const selectedSymbol = useSelector(
    (state: RootState) => state.tokens.selectedSymbol,
  )

  async function fetchTokens() {
    setLoading(true)

    const { getTokens, getQuoteToken } = useTokens()
    const data = await getTokens(userAgent)
    const quote = await getQuoteToken(userAgent, data)

    setTokens(data)
    if (quote) setQuoteSymbol(quote.base)
    dispatch(setTokens(data))
    setLoading(false)
  }

  const filteredTokens = useMemo(
    () => tokens.filter((token) => token.symbol !== quoteSymbol),
    [tokens, quoteSymbol],
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
    const quoteToken = tokens.find((token) => token.symbol === quoteSymbol)
    if (quoteToken) {
      dispatch(setSelectedQuote(quoteToken))
    }
  }, [tokens, quoteSymbol])

  useEffect(() => {
    fetchTokens()
  }, [])

  useEffect(() => {
    if (filteredTokens.length > 0) {
      let initialSymbol = filteredTokens.find(
        (token) => token.base === tokenDefault,
      )
      initialSymbol =
        initialSymbol && initialSymbol?.base === tokenDefault
          ? initialSymbol
          : filteredTokens[0]
      const initialOption: Option = {
        id: initialSymbol.symbol,
        value: initialSymbol.symbol,
        label: initialSymbol.name,
        image: initialSymbol.logo,
        base: initialSymbol.base,
        quote: initialSymbol.quote,
        decimals: initialSymbol.decimals,
        principal: initialSymbol.principal,
      }
      dispatch(setSelectedSymbol(initialOption))
    } else {
      dispatch(setSelectedSymbol(null))
    }
  }, [userAgent, filteredTokens])

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
