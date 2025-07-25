import React, { useState, useEffect } from 'react'
import CountUp from 'react-countup'
import { useMediaQuery } from 'react-responsive'
import { Tooltip } from 'react-tooltip'
import { useWindowWidth } from '@react-hook/window-size'
import ExchangeBancor from '../../assets/images/logos/analytics/exchange_bancor.svg'
import ExchangeBinance from '../../assets/images/logos/analytics/exchange_binance.svg'
import ExchangeCoinbase from '../../assets/images/logos/analytics/exchange_coinbase.svg'
import ExchangeCrypto from '../../assets/images/logos/analytics/exchange_crypto.svg'
import ExchangeKraken from '../../assets/images/logos/analytics/exchange_kraken.svg'
import ExchangeUniswap from '../../assets/images/logos/analytics/exchange_uniswap.svg'
import ExternalDefiLlama from '../../assets/images/logos/analytics/externalDefiLlama.svg'
import ExternalDuno from '../../assets/images/logos/analytics/externalDuno.svg'
import ExternalCamelot from '../../assets/images/logos/analytics/exchange_camelot.svg'
import Farm from '../../assets/images/logos/analytics/farm.svg'
import IFarm from '../../assets/images/logos/iFarm.svg'
import GasSavedImage from '../../assets/images/logos/analytics/GasFeeSave.svg'
import AutoHarvest from '../../assets/images/logos/analytics/AutoHarvest.svg'
import ExternalLink from '../../assets/images/logos/analytics/ExternalLink.svg'
import AnalyticChart from '../../components/AnalyticComponents/AnalyticChart'
import AnimatedDots from '../../components/AnimatedDots'
import { Divider, Monospace, TextContainer } from '../../components/GlobalStyle'
import { CURVE_APY } from '../../constants'
import { useStats } from '../../providers/Stats'
import { useRate } from '../../providers/Rate'
import { useThemeContext } from '../../providers/useThemeContext'
import { truncateNumberString } from '../../utilities/formats'
import {
  BigStatsExchange,
  Container,
  Content,
  DataSource,
  DataSourceDirect,
  DataSourceInner,
  FarmStatsContainer,
  FarmSubTitle,
  ImgList,
  StatsBox,
  StatsContainer,
  StatsContainerRow,
  StatsExchange,
  StatsTooltip,
  StatsValue,
  ValueComponent,
  CompHeader,
  FlexDiv,
  FarmStatsLastContainer,
} from './style'

const MemoizedCounter = React.memo(CountUp)
const imgList = [
  { url: 'https://pro.coinbase.com/trade/FARM-USD', img: ExchangeCoinbase },
  { url: 'https://pro.kraken.com/app/trade/farm-usd', img: ExchangeKraken },
  { url: 'https://www.binance.com/en/trade/FARM_USDT', img: ExchangeBinance },
  { url: 'https://crypto.com/exchange/trade/spot/FARM_USD', img: ExchangeCrypto },
  {
    url: 'https://app.uniswap.org/#/tokens/ethereum/0xa0246c9032bc3a600820415ae600c6388619a14d',
    img: ExchangeUniswap,
  },
  {
    url: 'https://app.bancor.network/trade?from=0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE&to=0xa0246c9032bC3A600820415aE600c6388619A14D',
    img: ExchangeBancor,
  },
]
const dataSources = [
  {
    id: 1,
    img: ExternalDefiLlama,
    text: 'DefiLlama',
    url: 'https://defillama.com/protocol/harvest-finance',
    soon: false,
    background: 'rgba(0, 99, 238, 0.17)',
    color: '#013F92',
  },
  {
    id: 2,
    img: ExternalDuno,
    text: 'Dune Dashboard',
    url: 'https://dune.com/cryptjs13/harvest-finance',
    soon: false,
    background: 'rgba(241, 96, 63, 0.21)',
    color: '#F1603F',
  },
]

const Analytic = () => {
  const {
    monthlyProfit,
    totalValueLocked,
    percentOfFarmStaked,
    totalGasSaved,
    profitShareAPY,
    profitShareAPYFallback,
  } = useStats()
  const { darkMode, bgColorNew, fontColor, borderColorBox, boxShadowColor, analyticTitleColor } =
    useThemeContext()

  const ratePerDay = Number(CURVE_APY) / 365 / 100
  const MINUTE_MS = 60000
  const onlyWidth = useWindowWidth()
  const isMobile = useMediaQuery({ query: '(max-width: 992px)' })

  const [loadComplete, setLoadComplete] = useState(false)
  const { rates } = useRate()
  const [currencySym, setCurrencySym] = useState('$')
  const [currencyRate, setCurrencyRate] = useState(1)

  useEffect(() => {
    if (rates.rateData) {
      setCurrencySym(rates.currency.icon)
      setCurrencyRate(rates.rateData[rates.currency.symbol])
    }
  }, [rates])
  useEffect(() => {
    setLoadComplete(true)
    const interval = setInterval(() => {}, MINUTE_MS)

    return () => clearInterval(interval) // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
  }, [])

  return (
    <Container $backcolor={bgColorNew}>
      <Content>
        <FarmStatsContainer $firstline="true">
          <ValueComponent
            $bordercolor={borderColorBox}
            $backcolor={bgColorNew}
            $fontcolor={fontColor}
            $width={onlyWidth <= 1310 ? '48%' : '25%'}
          >
            <CompHeader $darkmode={darkMode} $fontcolor={analyticTitleColor}>
              Total Value Locked
            </CompHeader>
            <FarmSubTitle $bold={600} $size="30px" $lineheight="38px">
              {Number(totalValueLocked) === 0 ? (
                <AnimatedDots />
              ) : (
                <>
                  {`${currencySym}`}&nbsp;
                  <MemoizedCounter
                    start={Number(totalValueLocked) * Number(currencyRate)}
                    end={
                      (Number(totalValueLocked) + Number(totalValueLocked) * Number(ratePerDay)) *
                      Number(currencyRate)
                    }
                    separator=","
                    useEasing={false}
                    delay={0}
                    decimals={0}
                    duration={864000}
                  />{' '}
                </>
              )}
            </FarmSubTitle>
          </ValueComponent>

          <ValueComponent
            $bordercolor={borderColorBox}
            $backcolor={bgColorNew}
            $fontcolor={fontColor}
            $width={onlyWidth <= 1310 ? '48%' : '25%'}
          >
            <CompHeader $darkmode={darkMode} $fontcolor={analyticTitleColor}>
              Monthly Crops to Farmers
            </CompHeader>
            <FarmSubTitle
              data-tip
              id="profits-to-farmers"
              $bold={600}
              $size="30px"
              $lineheight="38px"
            >
              {!monthlyProfit ? (
                <AnimatedDots />
              ) : (
                <>
                  {`${currencySym}`}&nbsp;
                  {Number(
                    truncateNumberString(Number(monthlyProfit) * Number(currencyRate)),
                  ).toLocaleString('en-US')}
                </>
              )}
            </FarmSubTitle>
            <Tooltip
              id="profits-to-farmers"
              anchorSelect="#profits-to-farmers"
              backgroundColor={darkMode ? 'white' : '#101828'}
              borderColor={darkMode ? 'white' : 'black'}
              textColor={darkMode ? 'black' : 'white'}
              effect="float"
              getContent={() => (
                <TextContainer $textalign="left" $margin="0px">
                  <b>70%</b> of profits goes to farmers depositing in <b>asset pools</b>
                  <br /> <b>30%</b> goes to those farmers staking <b>FARM</b>
                </TextContainer>
              )}
            />
          </ValueComponent>

          <ValueComponent
            $bordercolor={borderColorBox}
            $backcolor={bgColorNew}
            $fontcolor={fontColor}
            $width={onlyWidth <= 1310 ? '48%' : '25%'}
          >
            <CompHeader $fontcolor={analyticTitleColor}>iFARM/FARM staking APY:</CompHeader>
            <FarmSubTitle
              data-tip
              data-for="details-box"
              $bold={600}
              $size="30px"
              $lineheight="38px"
            >
              {profitShareAPY ? `${Number(profitShareAPY).toFixed(2)}%` : <AnimatedDots />}
            </FarmSubTitle>
          </ValueComponent>
          <ValueComponent
            $fontcolor={fontColor}
            $bordercolor={borderColorBox}
            $backcolor={bgColorNew}
            $width={onlyWidth <= 1310 ? '48%' : '25%'}
          >
            <CompHeader $fontcolor={analyticTitleColor}>Total FARM staked:</CompHeader>
            <FarmSubTitle
              data-tip
              data-for="details-box"
              $bold={600}
              $size="30px"
              $lineheight="38px"
            >
              {percentOfFarmStaked ? (
                `${Math.round(Number(percentOfFarmStaked))}%`
              ) : (
                <AnimatedDots />
              )}
            </FarmSubTitle>
            <Tooltip
              id="details-box"
              backgroundColor={darkMode ? 'white' : '#101828'}
              borderColor={darkMode ? 'white' : 'black'}
              textColor={darkMode ? 'black' : 'white'}
              effect="float"
              getContent={() => (
                <StatsTooltip>
                  <b>FARM</b> stakers receive <b>30%</b> of profits generated by all other pools
                  <br />
                  {profitShareAPYFallback ? (
                    <>
                      <b>FARM</b> staking APY is a <b>realtime estimate</b>, updated <b>hourly</b>
                    </>
                  ) : (
                    <>
                      <b>FARM</b> staking APY is a <b>7 day</b> historical average
                    </>
                  )}
                </StatsTooltip>
              )}
            />
          </ValueComponent>
        </FarmStatsContainer>
        <Divider $height="20px" />
        <FarmStatsLastContainer>
          <StatsBox
            $width={isMobile ? '100%' : '100%'}
            $align="flex-start"
            $direction="row"
            $height="450px"
            $fontcolor={fontColor}
            $backcolor={bgColorNew}
            $bordercolor={borderColorBox}
          >
            {loadComplete && <AnalyticChart />}
          </StatsBox>
        </FarmStatsLastContainer>
        <Divider $height="30px" />
        <FarmStatsLastContainer>
          <StatsValue $width={isMobile ? '100%' : '50%'}>
            <StatsValue $width="100%" $direction="row" $fontcolor={fontColor}>
              <ValueComponent
                $bordercolor={borderColorBox}
                $fontcolor={fontColor}
                $backcolor={bgColorNew}
                $width="49%"
                className="child first-comp"
              >
                <CompHeader $darkmode={darkMode} $fontcolor={analyticTitleColor}>
                  <img src={GasSavedImage} alt="" />
                  Gas fees saved
                </CompHeader>
                <FarmSubTitle
                  $lineheightbold={600}
                  $size={isMobile ? '16px' : '30px'}
                  $lineheight={isMobile ? '24px' : '38px'}
                >
                  <Monospace>
                    {!Number(totalGasSaved) ? (
                      <AnimatedDots />
                    ) : (
                      <>
                        {`${currencySym}`}
                        <MemoizedCounter
                          start={Number(totalGasSaved) * Number(currencyRate)}
                          end={
                            (Number(totalGasSaved) + Number(totalGasSaved) * Number(ratePerDay)) *
                            Number(currencyRate)
                          }
                          separator=","
                          useEasing={false}
                          delay={0}
                          decimals={0}
                          duration={86400 * 200}
                        />
                      </>
                    )}
                  </Monospace>
                </FarmSubTitle>
              </ValueComponent>

              <ValueComponent
                $bordercolor={borderColorBox}
                $backcolor={bgColorNew}
                $fontcolor={fontColor}
                $width="49%"
                className="child"
              >
                <CompHeader $darkmode={darkMode} $fontcolor={analyticTitleColor}>
                  <img src={AutoHarvest} alt="" />
                  Auto Harvesting Yields
                </CompHeader>
                <FarmSubTitle
                  $bold={600}
                  $size={isMobile ? '16px' : '30px'}
                  $lineheight={isMobile ? '24px' : '38px'}
                >
                  <Monospace>
                    {!Number(totalValueLocked) ? (
                      <AnimatedDots />
                    ) : (
                      <>
                        {`${currencySym}`}
                        <MemoizedCounter
                          start={Number(totalValueLocked) * Number(currencyRate)}
                          end={
                            (Number(totalValueLocked) +
                              Number(totalValueLocked) * Number(ratePerDay)) *
                            Number(currencyRate)
                          }
                          separator=","
                          useEasing={false}
                          delay={0}
                          decimals={0}
                          duration={86400 * 20}
                        />
                      </>
                    )}
                  </Monospace>
                </FarmSubTitle>
              </ValueComponent>
            </StatsValue>
            <Divider $height="20px" />
            <StatsBox
              $width="100%"
              $align="flex-start"
              $direction="column"
              $fontcolor={fontColor}
              $backcolor={bgColorNew}
              $bordercolor={borderColorBox}
            >
              <StatsContainerRow $margin="27px 29px">
                <DataSourceInner>
                  <BigStatsExchange $darkmode={darkMode}>
                    <img src={ExternalLink} alt="" />
                    External Data Sources
                  </BigStatsExchange>
                  <FlexDiv>
                    {dataSources.map((el, i) => (
                      <DataSourceDirect key={i} href={el.url} target="_blank">
                        <div className="back">
                          <DataSource
                            $fontcolor={el.color}
                            $background={el.background}
                            $boxshadowcolor={boxShadowColor}
                          >
                            <div className="avatar">
                              <img src={el.img} alt="" />
                            </div>
                            {el.text}
                          </DataSource>
                        </div>
                      </DataSourceDirect>
                    ))}
                  </FlexDiv>
                </DataSourceInner>
              </StatsContainerRow>
            </StatsBox>
          </StatsValue>
          <StatsExchange
            $width={isMobile ? '100%' : '50%'}
            $direction="row"
            $fontcolor={fontColor}
            $backcolor={bgColorNew}
            $bordercolor={borderColorBox}
          >
            <StatsContainer>
              <BigStatsExchange $fontcolor={fontColor}>
                <img src={Farm} width="32px" height="32px" alt="" />
                FARM Exchanges
              </BigStatsExchange>
              <ImgList>
                {imgList.map((el, i) => (
                  <a key={i} href={el.url} target="_blank" rel="noopener noreferrer">
                    <img src={el.img} alt="" />
                  </a>
                ))}
              </ImgList>
              <Divider $height="16px" />
              <BigStatsExchange $fontcolor={fontColor}>
                <img src={IFarm} width="32px" height="32px" alt="" />
                iFARM Exchanges
              </BigStatsExchange>
              <ImgList>
                <img src={ExternalCamelot} alt="" />
              </ImgList>
            </StatsContainer>
          </StatsExchange>
        </FarmStatsLastContainer>
      </Content>
    </Container>
  )
}

export default Analytic
