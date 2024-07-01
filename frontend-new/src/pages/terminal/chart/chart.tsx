import React, { useEffect, useRef } from 'react'

import { useTheme, useColorMode } from '@chakra-ui/react'
import Chart from 'chart.js/auto'

import { DataItem } from '../../../types'

interface Props {
  data: DataItem[]
  volumeAxis: string | undefined
}

const AuctionsChart: React.FC<Props> = ({ data, volumeAxis }) => {
  const theme = useTheme()
  const { colorMode } = useColorMode()
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstanceRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d')
      if (ctx) {
        const gradientFillPrice = ctx.createLinearGradient(0, 0, 0, 300)
        gradientFillPrice.addColorStop(0, theme.colors.blue['300'])
        gradientFillPrice.addColorStop(1, 'rgba(0, 0, 0, 0)')

        const gradientFillVolume = ctx.createLinearGradient(0, 0, 0, 300)
        gradientFillVolume.addColorStop(0, theme.colors.yellow['400'])
        gradientFillVolume.addColorStop(1, 'rgba(0, 0, 0, 0)')

        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy()
        }

        chartInstanceRef.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: data.map((item: DataItem) => {
              const date = new Date(item.label)
              const options: Intl.DateTimeFormatOptions = {
                day: '2-digit',
                month: 'short',
              }
              return date.toLocaleDateString('en-GB', options)
            }),
            datasets: [
              {
                label: 'Price',
                data: data.map((item: DataItem) =>
                  item.price !== undefined ? item.price : null,
                ),
                fill: false,
                borderColor: theme.colors.blue['500'],
                borderWidth: 2,
                backgroundColor: theme.colors.blue['500'],
                yAxisID: 'y-price',
              },
              {
                label: 'Volume',
                data: data.map((item: DataItem) =>
                  item.volume !== undefined ? item.volume : null,
                ),
                fill: false,
                borderColor: theme.colors.yellow['500'],
                borderWidth: 2,
                backgroundColor: theme.colors.yellow['500'],
                yAxisID: 'y-volume',
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              'y-price': {
                type: 'linear',
                position: 'left',
                beginAtZero: true,
                grid: {
                  display: false,
                },
                title: {
                  display: true,
                  text: 'Price',
                  color:
                    colorMode === 'dark'
                      ? theme.colors.grey['400']
                      : theme.colors.grey['700'],
                },
                ticks: {
                  color:
                    colorMode === 'dark'
                      ? theme.colors.grey['200']
                      : theme.colors.grey['900'],
                  callback: function (value) {
                    return Number(value).toLocaleString('en-US')
                  },
                },
              },
              'y-volume': {
                type: 'linear',
                position: 'right',
                beginAtZero: true,
                grid: {
                  display: false,
                },
                title: {
                  display: true,
                  text: `Volume ${volumeAxis ?? ''}`,
                  color:
                    colorMode === 'dark'
                      ? theme.colors.grey['200']
                      : theme.colors.grey['900'],
                },
                ticks: {
                  color:
                    colorMode === 'dark'
                      ? theme.colors.grey['200']
                      : theme.colors.grey['900'],
                  callback: function (value) {
                    const decimals = data.length ? data[0].volumeDecimals : 0
                    return Number(value).toFixed(decimals)
                  },
                },
              },
              x: {
                grid: {
                  display: false,
                },
                ticks: {
                  color:
                    colorMode === 'dark'
                      ? theme.colors.grey['200']
                      : theme.colors.grey['900'],
                },
              },
            },
            plugins: {
              legend: {
                display: true,
                labels: {
                  color:
                    colorMode === 'dark'
                      ? theme.colors.grey['200']
                      : theme.colors.grey['900'],
                },
              },
              tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                  title(tooltipItems) {
                    return data[tooltipItems[0].dataIndex].label
                  },
                  label: function (context) {
                    let label = context.dataset.label
                    if (label) {
                      label += ': '
                    }
                    if (context.parsed.y !== null) {
                      if (context.dataset.label === 'Price') {
                        const decimals = data[0].priceDecimals ?? 2
                        const value = context.parsed.y
                        const [integerPart, decimalPart = ''] = value
                          .toString()
                          .split('.')
                        const truncatedDecimalPart = decimalPart
                          .padEnd(decimals, '0')
                          .slice(0, decimals)
                        const adjustedValue = `${integerPart}.${truncatedDecimalPart}`
                        label += Number(adjustedValue).toLocaleString('en-US', {
                          minimumFractionDigits: decimals,
                          maximumFractionDigits: decimals,
                        })
                      } else if (context.dataset.label === 'Volume') {
                        const volumeDecimals = data[0].volumeDecimals ?? 2
                        label += Number(context.parsed.y).toFixed(
                          volumeDecimals,
                        )
                      }
                    }
                    return label
                  },
                },
              },
            },
          },
        })
      } else {
        console.error('Failed to get 2D context from canvas')
      }
    }
  }, [data, colorMode])

  return (
    <div style={{ position: 'relative', height: '30vh', width: '100%' }}>
      <canvas ref={chartRef} />
    </div>
  )
}

export default AuctionsChart
