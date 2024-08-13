import { MouseEventHandler } from 'react'

import { Flex, Image, Text, HStack } from '@chakra-ui/react'
import { Row } from 'react-table'

import { ColumnWithSorting } from '../../../../components/pagination'
import { TokenDataItem } from '../../../../types'

export default function tableContent(
  toggleVolume: string,
  handleToggleVolume: MouseEventHandler<HTMLParagraphElement> | undefined,
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
      Header: 'Price',
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
              <>
                {volumeInQuote.toFixed(volumeInQuoteDecimals)}{' '}
                <Text as="span" fontSize="10px">
                  {quote}
                </Text>
              </>
            ) : (
              <>
                {volumeInBase.toFixed(volumeInBaseDecimals)}{' '}
                <Text as="span" fontSize="10px">
                  {base}
                </Text>
              </>
            )}
          </Text>
        )
      },
    },
    {
      Header: 'Date',
      accessor: 'datetime',
      sortType: (rowA, rowB, columnId) => {
        const dateA = new Date(rowA.values[columnId])
        const dateB = new Date(rowB.values[columnId])

        if (dateA < dateB) {
          return -1
        } else if (dateA > dateB) {
          return 1
        } else {
          return 0
        }
      },
      Cell: ({ row }: { row: Row<TokenDataItem> }) => {
        const { date, time } = row.original
        return (
          <HStack
            justifyContent="flex-end"
            w="95%"
            textAlign="right"
            whiteSpace="nowrap"
          >
            <Text fontSize="13px" w="100%" textAlign="right">
              {`${date}, ${time}`}
            </Text>
          </HStack>
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

  const sortBy = [{ id: 'datetime', desc: true }]

  return { tableColumns, hiddenColumns, sortBy }
}
