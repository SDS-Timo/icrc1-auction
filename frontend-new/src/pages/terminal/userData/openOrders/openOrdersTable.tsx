import { MouseEventHandler } from 'react'

import { CloseIcon } from '@chakra-ui/icons'
import {
  Flex,
  Image,
  Text,
  IconButton,
  Spinner,
  Tooltip,
} from '@chakra-ui/react'
import { Row } from 'react-table'

import { ColumnWithSorting } from '../../../../components/pagination'
import { TokenDataItem } from '../../../../types'
import { fixDecimal } from '../../../../utils/calculationsUtils'

export default function tableContent(
  toggleVolume: string,
  handleToggleVolume: MouseEventHandler<HTMLParagraphElement> | undefined,
  handleCancel: (id: bigint | undefined, type: string | undefined) => void,
) {
  const tableColumns: ColumnWithSorting<TokenDataItem>[] = [
    {
      Header: 'Symbol',
      accessor: 'symbol',
      Cell: ({ row }: { row: Row<TokenDataItem> }) => {
        const { symbol, base, quote, logo } = row.original
        return (
          <Flex justifyContent="left" alignItems="center">
            <Image src={logo} alt={symbol} h="20px" w="20px" />
            <Text ml="5px" fontWeight="600">
              {base}
            </Text>
            <Text fontSize="10px">/{quote}</Text>
          </Flex>
        )
      },
    },
    {
      Header: 'Side',
      accessor: 'type',
      Cell: ({ row }: { row: Row<TokenDataItem> }) => {
        const { type } = row.original
        return (
          <Text
            textAlign="center"
            color={type === 'buy' ? 'green.500' : 'red.500'}
          >
            {type}
          </Text>
        )
      },
    },
    {
      Header: 'Limit',
      accessor: 'price',
      Cell: ({ row }: { row: Row<TokenDataItem> }) => {
        const { price, priceDecimals } = row.original
        return (
          <Text textAlign="center">
            {price.toLocaleString('en-US', {
              minimumFractionDigits: priceDecimals,
              maximumFractionDigits: priceDecimals,
            })}
          </Text>
        )
      },
    },
    {
      Header: 'Amount',
      accessor: toggleVolume === 'quote' ? 'volumeInQuote' : 'volumeInBase',
      sortType: (rowA, rowB) => {
        const valA =
          rowA.values[
            toggleVolume === 'quote' ? 'volumeInQuote' : 'volumeInBase'
          ]
        const valB =
          rowB.values[
            toggleVolume === 'quote' ? 'volumeInQuote' : 'volumeInBase'
          ]
        return valA - valB
      },
      Cell: ({ row }: { row: Row<TokenDataItem> }) => {
        const {
          quote,
          base,
          decimals,
          quoteDecimals,
          volumeInQuote,
          volumeInBase,
          volumeInQuoteDecimals,
          volumeInBaseDecimals,
        } = row.original
        return (
          <Text
            textAlign="center"
            onClick={handleToggleVolume}
            sx={{ cursor: 'pointer' }}
          >
            {toggleVolume === 'quote' ? (
              <Tooltip
                label={`${fixDecimal(volumeInQuote, quoteDecimals)} ${quote}`}
                aria-label="Base value"
              >
                <Text as="span">
                  {volumeInQuote.toFixed(volumeInQuoteDecimals)}{' '}
                  <Text as="span" fontSize="10px">
                    {quote}
                  </Text>
                </Text>
              </Tooltip>
            ) : (
              <Tooltip
                label={`${fixDecimal(volumeInBase, decimals)} ${base}`}
                aria-label="Base value"
              >
                <Text as="span">
                  {Number(volumeInBase.toFixed(volumeInBaseDecimals)) > 0
                    ? volumeInBase.toFixed(volumeInBaseDecimals)
                    : volumeInBase.toFixed(decimals)}{' '}
                  <Text as="span" fontSize="10px">
                    {base}
                  </Text>
                </Text>
              </Tooltip>
            )}
          </Text>
        )
      },
    },
    {
      Header: 'Actions',
      accessor: 'actions',
      disableSortBy: true,
      Cell: ({ row }: { row: Row<TokenDataItem> }) => {
        const { id, type, loading } = row.original
        return (
          <Flex justifyContent="center" alignItems="center">
            <IconButton
              aria-label="Cancel Order"
              icon={loading ? <Spinner size="xs" /> : <CloseIcon />}
              onClick={() => handleCancel(id, type)}
              variant="ghost"
              size="xs"
            />
          </Flex>
        )
      },
    },
    {
      accessor: 'base',
    },
    {
      accessor: 'quote',
    },
  ]

  const hiddenColumns: string[] = ['base', 'quote']

  const sortBy: any[] = []

  return { tableColumns, hiddenColumns, sortBy }
}
