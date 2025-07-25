import React, { useEffect, useState } from 'react'
import {
  ComposedChart,
  XAxis,
  YAxis,
  Line,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import { useWindowWidth } from '@react-hook/window-size'
import { ClipLoader } from 'react-spinners'
import { useThemeContext } from '../../../providers/useThemeContext'
import { numberWithCommas, formatXAxis, ceil10, floor10 } from '../../../utilities/formats'
import {
  findMaxData,
  findMinData,
  findMinMax,
  getTimeSlots,
  generateColor,
} from '../../../utilities/parsers'
import {
  ChartWrapper,
  LoadingDiv,
  NoData,
  LoaderWrapper,
  TooltipContainer,
  TooltipContent,
  TooltipTotal,
  ProtocolEntry,
  DottedUnderline,
} from './style'

function generateChartDataWithSlots(slots, apiData, sharePriceData) {
  const seriesData = [],
    sl = slots.length,
    al = apiData.length

  for (let i = 0; i < sl; i += 1) {
    for (let j = 0; j < al; j += 1) {
      if (slots[i] >= parseInt(apiData[j].timestamp, 10)) {
        const dataPoint = { x: slots[i] * 1000 }
        Object.keys(sharePriceData).forEach(key => {
          const matchedEntry = sharePriceData[key].find(
            entry => entry.timestamp === apiData[j].timestamp,
          )
          if (matchedEntry) {
            dataPoint[key] = parseFloat(matchedEntry.sharePrice)
          }
        })

        seriesData.push(dataPoint)
        break
      }
    }
  }

  if (seriesData.length === 1) {
    seriesData.push(seriesData[0])
  }

  return seriesData
}

function getYAxisValues(min, max, roundNum) {
  const result = []
  const ary = []
  const bet = Number(max - min)
  for (let i = min; i <= max; i += bet / 4) {
    ary.push(i)
  }
  if (ary.length === 4) {
    ary.push(max)
  }

  for (let j = 0; j < ary.length; j += 1) {
    const val = ary[j].toFixed(roundNum)
    result.push(val)
  }
  return result
}

const ApexChart = ({ chainName, token, loadComplete, sharePriceData, iporHvaultsLFAPY }) => {
  const { fontColor, fontColor5, bgColorChart } = useThemeContext()
  const onlyWidth = useWindowWidth()

  const [mainSeries, setMainSeries] = useState([])
  const [isDataReady, setIsDataReady] = useState('false')
  const [roundedDecimal] = useState(5)
  const [hourUnit, setHourUnit] = useState(false)
  const [minVal, setMinVal] = useState(0)
  const [maxVal, setMaxVal] = useState(0)
  const [yAxisTicks, setYAxisTicks] = useState([])

  const renderTooltipContent = o => {
    const { payload, label } = o

    const date = new Date(label)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours().toString().padStart(2, '0')
    const mins = date.getMinutes().toString().padStart(2, '0')

    return (
      <TooltipContainer>
        <TooltipContent>
          <TooltipTotal>{`${day}/${month}/${year} ${hour}:${mins}`}</TooltipTotal>
          {payload
            .filter(entry => Object.keys(iporHvaultsLFAPY).includes(entry.dataKey))
            .filter(entry => entry?.value)
            .sort((a, b) => b.value - a.value)
            .map((entry, index) => {
              const value = entry.value || 0
              if (value <= 0) return null

              const vaultParts = entry.dataKey
                .split('_')
                .map((part, i) => (i === 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part))
              let vaultName = vaultParts
                .filter(part => !part.toLowerCase().includes(chainName.toLowerCase()))
                .join(' ')
              if (vaultName === 'USDC') vaultName = 'Compound V3 USDC'
              if (vaultName === 'WETH') vaultName = 'Compound V3 WETH'

              return (
                <ProtocolEntry
                  key={`item-${index}`}
                  $fontcolor={
                    entry.dataKey !== token.id
                      ? generateColor(iporHvaultsLFAPY, entry.dataKey)
                      : '#5dcf46'
                  }
                >
                  <DottedUnderline>
                    {entry.dataKey !== token.id ? vaultName : `Autopilot ${token.tokenNames[0]}`}
                  </DottedUnderline>
                  &nbsp;&nbsp;
                  {value.toFixed(5)}
                </ProtocolEntry>
              )
            })}
        </TooltipContent>
      </TooltipContainer>
    )
  }

  const renderCustomXAxisTick = ({ x, y, payload }) => {
    let path = ''

    if (payload.value !== '') {
      path = formatXAxis(payload.value, hourUnit)
    }
    return (
      <text
        orientation="bottom"
        x={x - 12}
        y={y + 4}
        width={24}
        height={24}
        viewBox="0 0 1024 1024"
        fill={fontColor5}
      >
        <tspan dy="0.71em">{path}</tspan>
      </text>
    )
  }

  const renderCustomYAxisTick = ({ x, y, payload }) => {
    let path = ''

    if (payload.value !== '') {
      path = `${numberWithCommas(Number(payload.value).toFixed(5))}`
    }
    return (
      <text
        orientation="left"
        className="recharts-text recharts-cartesian-axis-tick-value"
        x={x}
        y={y}
        width={60}
        height={310}
        stroke="none"
        fill="#00D26B"
        textAnchor="start"
      >
        <tspan dx={0} dy="0.355em">
          {path}
        </tspan>
      </text>
    )
  }

  useEffect(() => {
    const init = async () => {
      let mainData = [],
        firstDate1,
        slotCount = 50,
        length,
        minValue,
        maxValue,
        unitBtw

      const dl = sharePriceData[token.id]?.length ?? 0
      if (loadComplete && dl === 0) {
        setIsDataReady('false')
      } else if (!loadComplete && dl === 0) {
        setIsDataReady('loading')
      } else if (dl !== 0) {
        setIsDataReady('true')
      }

      if (
        sharePriceData[token.id] === undefined ||
        (Object.keys(sharePriceData[token.id]).length === 0 &&
          sharePriceData[token.id].constructor === Object) ||
        dl === 0
      ) {
        return
      }

      for (let i = dl - 1; i >= 0; i -= 1) {
        if (sharePriceData[token.id][i].sharePrice !== 0) {
          firstDate1 = sharePriceData[token.id][i].timestamp
          break
        }
      }
      if (firstDate1 === undefined) {
        firstDate1 = sharePriceData[token.id][dl - 1].timestamp
      }

      const nowDate = new Date()
      const currentTimeStamp = Math.floor(nowDate.getTime() / 1000)

      const periodDate = (currentTimeStamp - Number(firstDate1)) / (24 * 60 * 60)

      const ago = periodDate < 0 ? 1 : Math.ceil(periodDate)
      if (ago === 1) {
        setHourUnit(true)
      } else {
        setHourUnit(false)
      }

      slotCount = sharePriceData[token.id].length

      const slots = getTimeSlots(ago, slotCount)

      mainData = generateChartDataWithSlots(slots, sharePriceData[token.id], sharePriceData)

      if (mainData.length === 1) {
        const firstObject = {}
        Object.keys(sharePriceData).forEach(key => {
          firstObject[key] = mainData[0][key]
        })
        firstObject.x = currentTimeStamp

        mainData.unshift(firstObject)
      }

      const maxValueData = {},
        minValueData = {}
      Object.keys(sharePriceData).forEach(key => {
        const { min, max } = findMinMax(mainData, key)
        maxValueData[key] = max
        minValueData[key] = min
      })

      minValue = findMinData(minValueData)
      maxValue = findMaxData(maxValueData)

      const between = maxValue - minValue
      unitBtw = between / 4
      if (unitBtw >= 1) {
        length = (1 / unitBtw).toString().length
        maxValue = ceil10(maxValue, -length)
        minValue = floor10(minValue, -length)
      } else if (unitBtw === 0) {
        length = (1 / maxValue).toString().length
        maxValue += 1
        minValue -= 1
      } else {
        length = (1 / unitBtw).toString().length
        maxValue = ceil10(maxValue, -length)
        minValue = floor10(minValue, -length + 1)
      }

      if (unitBtw === 0) {
        unitBtw = (maxValue - minValue) / 4
      } else {
        const rate = Number(unitBtw / maxValue) + 1
        maxValue *= rate
        maxValue = ceil10(maxValue, -length)
        minValue /= rate
      }

      setMinVal(minValue)
      setMaxVal(maxValue)

      const yAxisAry = getYAxisValues(minValue, maxValue, roundedDecimal)

      setYAxisTicks(yAxisAry)

      setMainSeries(mainData)
    }

    init()
  }, [isDataReady, loadComplete])

  return (
    <>
      {isDataReady === 'true' ? (
        <ChartWrapper $bgcolorchart={bgColorChart}>
          <ResponsiveContainer width="100%" height={onlyWidth > 1291 ? 346 : 365}>
            <ComposedChart
              data={mainSeries}
              margin={{
                top: 20,
                right: 0,
                bottom: 0,
                left: roundedDecimal === 3 ? -14 : 0,
              }}
            >
              <defs>
                <linearGradient id="colorUvPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D26B" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="0"
                strokeLinecap="butt"
                stroke="rgba(228, 228, 228, 0.2)"
                vertical={false}
              />
              {Object.keys(sharePriceData).map(key => {
                const color = key === token.id ? '#5dcf46' : generateColor(iporHvaultsLFAPY, key)
                return (
                  <Line
                    key={key}
                    dataKey={key}
                    type="monotone"
                    strokeLinecap="round"
                    strokeWidth={2}
                    stroke={color}
                    dot={false}
                    legendType="none"
                    yAxisId="left"
                  />
                )
              })}
              <XAxis dataKey="x" tickLine={false} tickCount={5} tick={renderCustomXAxisTick} />
              <YAxis
                dataKey={token.id}
                tickCount={5}
                tick={renderCustomYAxisTick}
                ticks={yAxisTicks}
                domain={[minVal, maxVal]}
                stroke="#00D26B"
                yAxisId="left"
                orientation="left"
                mirror
              />
              <Tooltip content={renderTooltipContent} />
            </ComposedChart>
          </ResponsiveContainer>
          <></>
        </ChartWrapper>
      ) : (
        <LoadingDiv>
          {isDataReady === 'loading' ? (
            <LoaderWrapper $height={onlyWidth > 1291 ? '346px' : '365px'}>
              <ClipLoader size={30} margin={2} color={fontColor} />
            </LoaderWrapper>
          ) : (
            <NoData $fontcolor={fontColor}>Shareprice data soon to be available.</NoData>
          )}
        </LoadingDiv>
      )}
    </>
  )
}

export default ApexChart
