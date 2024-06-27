import React, { useEffect, useRef } from 'react'

import { useTheme } from '@chakra-ui/react'
import Chart from 'chart.js/auto'

import { DataItem } from '../../../types'

interface Props {
  data: DataItem[]
  volumeAxis: string | undefined
}

const AuctionsChart: React.FC<Props> = ({ data, volumeAxis }) => {
  const theme = useTheme()
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
            labels: data.map((item: DataItem) => item.label),
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
                },
                ticks: {
                  callback: function (value) {
                    return Number(value).toFixed(2)
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
                },
                ticks: {
                  callback: function (value) {
                    return Number(value).toFixed(6)
                  },
                },
              },
              x: {
                grid: {
                  display: false,
                },
              },
            },
            plugins: {
              tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                  label: function (context) {
                    let label = context.dataset.label || ''
                    if (label) {
                      label += ': '
                    }
                    if (context.parsed.y !== null) {
                      if (context.dataset.label === 'Price') {
                        label += Number(context.parsed.y).toFixed(2)
                      } else if (context.dataset.label === 'Volume') {
                        label += Number(context.parsed.y).toFixed(6)
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
  }, [data, theme])

  return (
    <div style={{ position: 'relative', height: '30vh', width: '100%' }}>
      <canvas ref={chartRef} />
    </div>
  )
}

export default AuctionsChart
