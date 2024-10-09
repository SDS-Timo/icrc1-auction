import React, { useState, useEffect } from 'react'

import { Flex, Progress, useColorModeValue } from '@chakra-ui/react'
import { HttpAgent } from '@dfinity/agent'

import ActionRow from './actionRow'
import useDepositHistory from '../../../../hooks/useDepositHistory'
import { TokenDataItem, TokenMetadata } from '../../../../types'
import Pagination from '../../../pagination'

interface ActionTabProps {
  userAgent: HttpAgent
  tokens: TokenMetadata[]
}

const ActionTab: React.FC<ActionTabProps> = ({ userAgent, tokens }) => {
  const bgColor = useColorModeValue('grey.200', 'grey.700')
  const fontColor = useColorModeValue('grey.700', 'grey.25')
  const pageSize = 20

  const [loading, setLoading] = useState(true)
  const [histories, setHistories] = useState<TokenDataItem[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [canNextPage, setCanNextPage] = useState(false)
  const [canPreviousPage, setCanPreviousPage] = useState(false)

  async function fetchDepositHistory(page: number) {
    setLoading(true)
    const { getDepositHistory } = useDepositHistory()
    const data = await getDepositHistory(
      userAgent,
      tokens,
      pageSize,
      page * pageSize,
    )
    setHistories(data)
    setCanPreviousPage(page > 0)
    setCanNextPage(data.length === pageSize)
    setLoading(false)
  }

  useEffect(() => {
    fetchDepositHistory(currentPage)
  }, [currentPage])

  const nextPage = () => {
    setHistories([])
    if (canNextPage) setCurrentPage(currentPage + 1)
  }

  const previousPage = () => {
    setHistories([])
    if (canPreviousPage) setCurrentPage(currentPage - 1)
  }

  return (
    <>
      {loading && histories?.length <= 0 ? (
        <Flex justify="center" align="center" h="100px">
          <Progress size="xs" isIndeterminate w="90%" />
        </Flex>
      ) : (
        <>
          {histories.map((data) => (
            <ActionRow key={data.id} data={data} />
          ))}

          <Flex justify="center" mt={4}>
            <Pagination
              canPreviousPage={canPreviousPage}
              canNextPage={canNextPage}
              previousPage={previousPage}
              nextPage={nextPage}
              bgColor={bgColor}
              fontColor={fontColor}
              currentPage={currentPage}
              fontSize="11px"
            />
          </Flex>
        </>
      )}
    </>
  )
}

export default ActionTab
