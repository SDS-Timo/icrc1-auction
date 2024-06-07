import { useMemo, useState } from 'react'

import { Box } from '@chakra-ui/react'
import { Select } from 'bymax-react-select'

import customStyles from './styles.ts'

interface CSSObject {
  [key: string]: string | number | CSSObject | undefined
}

const SymbolSelection = () => {
  const options = useMemo(
    () => [
      {
        id: '1',
        value: 'BTC',
        label: 'Bitcoin',
        image: '../../../assets/img/coins/btc.svg',
        base: 'BTC',
        quote: 'ckUSDC',
      },
      {
        id: '2',
        value: 'eth',
        label: 'Ethereum',
        image: '../../../assets/img/coins/eth.svg',
        base: 'ETH',
        quote: 'ckUSDC',
      },
      {
        id: '3',
        value: 'sol',
        label: 'Solana',
        image: '../../../assets/img/coins/sol.svg',
        base: 'SOL',
        quote: 'ckUSDC',
      },
    ],
    [],
  )

  const [value, setValue] = useState([options[0]])

  return (
    <Box w="100%" zIndex="999">
      <Select
        id="example-id"
        value={value}
        isMulti={false}
        isClearable={true}
        options={options}
        placeholder="Select a coin"
        noOptionsMessage="No coins found"
        onChange={(option: any) => console.log(option)}
        styles={
          customStyles as unknown as {
            [key: string]: () => CSSObject
          }
        }
      />
    </Box>
  )
}

export default SymbolSelection
