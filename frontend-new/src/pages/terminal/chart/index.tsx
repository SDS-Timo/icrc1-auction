import { Box } from '@chakra-ui/react'

import Chart from './chart'

const data = [
  { label: '24-jun', price: 72000, volume: 1000 },
  { label: '23-jun', price: 71000, volume: 3000 },
  { label: '22-jun', price: 70000, volume: 5000 },
  { label: '21-jun', price: 69000, volume: 4000 },
  { label: '20-jun', price: 69500, volume: 3000 },
  { label: '19-jun', price: 70000, volume: 5000 },
  { label: '18-jun', price: 68500, volume: 6000 },
  { label: '17-jun', price: 68000, volume: 7000 },
  { label: '16-jun', price: 66000, volume: 5000 },
  { label: '15-jun', price: 64000, volume: 3000 },
]

const ChartPlot = () => {
  return (
    <Box>
      <Chart data={data} />
    </Box>
  )
}

export default ChartPlot
