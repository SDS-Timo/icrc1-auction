import React, { useMemo, useEffect } from 'react'

import { Box } from '@chakra-ui/react'
import { AnonymousIdentity, HttpAgent } from '@dfinity/agent'
import { Select } from 'bymax-react-select'
import { useSelector, useDispatch } from 'react-redux'

import customStyles from './styles'
import { RootState, AppDispatch } from '../../../store'
import { setUserAgentHost } from '../../../store/auth'
import { setSelectedSymbol } from '../../../store/tokens'
import { fetchTokens } from '../../../store/tokens'
import { Option } from '../../../types'

const SymbolSelection: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { tokens, loading } = useSelector((state: RootState) => state.tokens)
  const selectedSymbol = useSelector(
    (state: RootState) => state.tokens.selectedSymbol,
  )

  const { userAgentHost } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    dispatch(setUserAgentHost(`${process.env.HTTP_AGENT_HOST}`))
  }, [dispatch])

  useEffect(() => {
    if (userAgentHost) {
      const myAgent = new HttpAgent({
        identity: new AnonymousIdentity(),
        host: userAgentHost,
      })
      dispatch(fetchTokens(myAgent))
    }
  }, [dispatch, userAgentHost])

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
        base: token.symbol,
        quote: 'USDC',
        principal: token.principal,
      })),
    [filteredTokens],
  )

  useEffect(() => {
    if (filteredTokens.length > 0) {
      const initialSymbol = filteredTokens[0].symbol
      const initialOption: Option = {
        id: initialSymbol,
        value: initialSymbol,
        label: filteredTokens[0].name,
        image: filteredTokens[0].logo || '',
        base: initialSymbol,
        quote: 'USDC',
        principal: filteredTokens[0].principal,
      }
      dispatch(setSelectedSymbol(initialOption))
    } else {
      dispatch(setSelectedSymbol(null))
    }
  }, [filteredTokens])

  const handleChange = (option: Option | Option[] | null) => {
    dispatch(setSelectedSymbol(option))
  }

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
