import React, { useRef, useEffect, useState } from 'react'
import { BigNumber } from 'bignumber.js'
import useEffectWithPrevious from 'use-effect-with-previous'
import { find, get, isEmpty, orderBy, isEqual, isNaN } from 'lodash'
import { useMediaQuery } from 'react-responsive'
import { Dropdown, Spinner } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { IoArrowUpCircleOutline, IoCheckmark } from 'react-icons/io5'
import 'react-loading-skeleton/dist/skeleton.css'
import VaultRow from '../../components/DashboardComponents/VaultRow'
import LifetimeYieldData from '../../components/LifetimeYieldChart/LifetimeYieldData'
import Safe from '../../assets/images/logos/dashboard/safe.svg'
import Coin1 from '../../assets/images/logos/dashboard/coins-stacked-02.svg'
import Coin2 from '../../assets/images/logos/dashboard/coins-stacked-04.svg'
import Diamond from '../../assets/images/logos/dashboard/diamond-01.svg'
import Sort from '../../assets/images/logos/dashboard/sort.svg'
import DropDownIcon from '../../assets/images/logos/advancedfarm/drop-down.svg'
import AdvancedImg from '../../assets/images/logos/sidebar/advanced.svg'
import Eye from '../../assets/images/logos/eye-icon.svg'
import ClosedEye from '../../assets/images/logos/eye_closed.svg'
import SkeletonLoader from '../../components/DashboardComponents/SkeletonLoader'
import EarningsHistoryLatest from '../../components/EarningsHistoryLatest/HistoryDataLatest'
import TotalValue from '../../components/TotalValue'
import ConnectSuccessIcon from '../../assets/images/logos/sidebar/connect-success.svg'
import PhoneLogo from '../../assets/images/logos/farm-icon.svg'
import { FARM_TOKEN_SYMBOL, IFARM_TOKEN_SYMBOL, ROUTES, supportedCurrencies } from '../../constants'
import { usePools } from '../../providers/Pools'
import { useThemeContext } from '../../providers/useThemeContext'
import { useVaults } from '../../providers/Vault'
import { useWallet } from '../../providers/Wallet'
import { useRate } from '../../providers/Rate'
import { fromWei } from '../../services/viem'
import {
  isSpecialApp,
  formatAddress,
  formatNumber,
  showUsdValueCurrency,
} from '../../utilities/formats'
import { getCoinListFromApi, getTokenPriceFromApi } from '../../utilities/apiCalls'
import {
  fetchAndParseVaultData,
  getChainIcon,
  getTotalApy,
  handleToggle,
} from '../../utilities/parsers'
import {
  Column,
  Container,
  EmptyInfo,
  EmptyPanel,
  Header,
  Inner,
  SubPart,
  TransactionDetails,
  Col,
  TableContent,
  ConnectButtonStyle,
  CurrencyDropDown,
  CurrencySelect,
  CurrencyDropDownMenu,
  CurrencyDropDownItem,
  HeaderWrap,
  HeaderTitle,
  HeaderButton,
  TableWrap,
  PositionTable,
  YieldTable,
  ContentBox,
  ExploreButtonStyle,
  MobileSwitch,
  SwitchBtn,
  MobileHeader,
  HeaderTop,
  LifetimeValue,
  LifetimeSub,
  LogoDiv,
  Address,
  GreenBox,
  ChartSection,
  ChartBox,
} from './style'

const Portfolio = () => {
  const navigate = useNavigate()
  const { connected, connectAction, account, balances, getWalletBalances } = useWallet()
  const { userStats, fetchUserPoolStats, totalPools, disableWallet } = usePools()
  const { vaultsData, getFarmingBalances } = useVaults()

  const { tokens } = require('../../data')
  const {
    showInactiveFarms,
    darkMode,
    bgColorNew,
    hoverColor,
    hoverColorNew,
    filterColor,
    backColor,
    fontColor,
    fontColor1,
    fontColor2,
    borderColor,
    borderColorBox,
    inputBorderColor,
    btnHoverColor,
    btnColor,
  } = useThemeContext()

  const isMobile = useMediaQuery({ query: '(max-width: 992px)' })
  const { rates, updateCurrency } = useRate()
  const [curCurrency, setCurCurrency] = useState(supportedCurrencies[0])
  const [apiData, setApiData] = useState([])
  const [farmTokenList, setFarmTokenList] = useState([])
  const [filteredFarmList, setFilteredFarmList] = useState([])
  const [noFarm, setNoFarm] = useState(false)
  const [totalDeposit, setTotalDeposit] = useState(0)
  const [totalRewards, setTotalRewards] = useState(0)
  const [totalYieldDaily, setTotalYieldDaily] = useState(0)
  const [totalYieldMonthly, setTotalYieldMonthly] = useState(0)
  const [depositToken, setDepositToken] = useState([])
  const [sortOrder, setSortOrder] = useState(false)
  const [showLatestYield, setShowLatestYield] = useState(false)
  const [currencySym, setCurrencySym] = useState('$')
  const [currencyRate, setCurrencyRate] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [oneDayYield, setOneDayYield] = useState(0)
  const [showAddress, setShowAddress] = useState(true)
  const [onceRun, setOnceRun] = useState(false)
  const [, setNoHarvestsData] = useState(false)
  const [, setNoRewardsData] = useState(false)
  const [totalLifetimeYield, setTotalLifetimeYield] = useState(0)
  const [vaultNetChangeList, setVaultNetChangeList] = useState([])
  const [totalHistoryData, setTotalHistoryData] = useState([])

  useEffect(() => {
    const getCoinList = async () => {
      const data = await getCoinListFromApi()
      setApiData(data)
    }
    getCoinList()
  }, [])

  useEffect(() => {
    if (connected && (totalDeposit !== 0 || totalLifetimeYield !== 0)) {
      setIsLoading(false)
    }
    if (connected && (totalLifetimeYield === 0 || totalLifetimeYield === -1)) {
      setIsLoading(true)
    }
  }, [totalLifetimeYield, connected, totalDeposit])

  useEffect(() => {
    if (rates.rateData) {
      setCurrencySym(rates.currency.icon)
      setCurrencyRate(rates.rateData[rates.currency.symbol])
    }
  }, [rates])

  useEffect(() => {
    setCurCurrency(supportedCurrencies[rates.currency.id])
  }, [rates])

  const groupOfVaults = { ...vaultsData }

  const firstWalletBalanceLoad = useRef(true)
  useEffectWithPrevious(
    ([prevAccount, prevBalances]) => {
      const hasSwitchedAccount = account !== prevAccount && account
      if (
        hasSwitchedAccount ||
        firstWalletBalanceLoad.current ||
        (balances && !isEqual(balances, prevBalances))
      ) {
        const getBalance = async () => {
          firstWalletBalanceLoad.current = false
          await getWalletBalances([IFARM_TOKEN_SYMBOL, FARM_TOKEN_SYMBOL], false, true)
        }

        getBalance()
      }
    },
    [account, balances],
  )

  useEffect(() => {
    if (!connected) {
      setTotalDeposit(0)
      setTotalRewards(0)
      setTotalYieldDaily(0)
      setTotalYieldMonthly(0)
    }
  }, [connected])

  useEffect(() => {
    if (account && !isEmpty(userStats) && !isEmpty(depositToken)) {
      const loadUserPoolsStats = async () => {
        const poolsToLoad = [],
          dl = depositToken.length
        for (let i = 0; i < dl; i += 1) {
          const token = groupOfVaults[depositToken[i]]

          const vaultPool = find(totalPools, pool => pool.collateralAddress === token.vaultAddress)

          if (vaultPool) {
            poolsToLoad.push(vaultPool)
          }
        }
        await fetchUserPoolStats(poolsToLoad, account, userStats)
        await getFarmingBalances(depositToken)
      }
      loadUserPoolsStats()
    }
  }, [account, totalPools, depositToken])

  useEffect(() => {
    if (!isEmpty(userStats) && account) {
      const getFarmTokenInfo = async () => {
        let stakedVaults = [],
          totalBalanceUSD = 0,
          valueRewards = 0,
          totalDailyYield = 0,
          totalMonthlyYield = 0,
          sortedTokenList

        if (showInactiveFarms) {
          stakedVaults = Object.keys(userStats).filter(
            poolId =>
              new BigNumber(userStats[poolId].totalStaked).gt(0) ||
              new BigNumber(userStats[poolId].lpTokenBalance).gt(0),
          )
        } else {
          const stakedVaultsTemp = Object.keys(userStats).filter(
            poolId =>
              new BigNumber(userStats[poolId].totalStaked).gt(0) ||
              new BigNumber(userStats[poolId].lpTokenBalance).gt(0),
          )

          stakedVaults = stakedVaultsTemp.filter(
            poolId => groupOfVaults[poolId] && groupOfVaults[poolId].inactive !== true,
          )
        }

        if (depositToken.length !== stakedVaults.length) {
          setDepositToken(stakedVaults)
        }

        const newStats = [],
          sl = stakedVaults.length

        for (let i = 0; i < sl; i += 1) {
          const stats = {
            chain: '',
            symbol: '',
            logos: [],
            status: '',
            platform: '',
            unstake: '',
            stake: '',
            reward: [],
            rewardSymbol: [],
            rewardUSD: [],
            totalRewardUsd: 0,
            token: {},
          }
          let symbol = stakedVaults[i],
            fAssetPool = {},
            token = null

          token = groupOfVaults[symbol]
          fAssetPool = find(totalPools, pool => pool.collateralAddress === token?.vaultAddress)

          if (token) {
            let tokenName = '',
              totalRewardAPRByPercent = 0,
              usdPrice = 1,
              showAPY = null

            const ttl = token.tokenNames.length
            for (let k = 0; k < ttl; k += 1) {
              tokenName += token.tokenNames[k]
              if (k !== ttl - 1) {
                tokenName += ' - '
              }
            }
            stats.token = token
            stats.symbol = tokenName
            stats.logos = token.logoUrl
            stats.chain = getChainIcon(token.chain)
            stats.platform = token.subLabel
              ? token.platform[0] && `${token.platform[0]} - ${token.subLabel}`
              : token.platform[0] && token.platform[0]
            stats.status = token.inactive ? 'Inactive' : 'Active'

            usdPrice = token.vaultPrice

            const unstake = fromWei(
              get(userStats, `[${symbol}]['lpTokenBalance']`, 0),
              token?.vaultDecimals || token?.decimals || 18,
              token?.vaultDecimals || token?.decimals || 18,
            )
            stats.unstake = isNaN(unstake) ? 0 : unstake

            const stake = fromWei(
              get(userStats, `[${symbol}]['totalStaked']`, 0),
              token?.vaultDecimals || token?.decimals,
              token?.vaultDecimals || token?.decimals,
            )
            stats.stake = isNaN(stake) ? 0 : stake

            const finalBalance = Number(stake) + Number(unstake)
            stats.balance = finalBalance * usdPrice
            totalBalanceUSD += stats.balance

            const rewardTokenSymbols = get(fAssetPool, 'rewardTokenSymbols', [])
            for (let l = 0; l < rewardTokenSymbols.length; l += 1) {
              let rewardSymbol = rewardTokenSymbols[l].toUpperCase(),
                rewards,
                rewardToken,
                usdRewardPrice = 0,
                rewardDecimal = get(tokens[rewardSymbol], 'decimals', 18)

              if (rewardTokenSymbols.includes(IFARM_TOKEN_SYMBOL)) {
                rewardSymbol = IFARM_TOKEN_SYMBOL
              }

              if (rewardTokenSymbols[l].substring(0, 1) === 'f') {
                if (rewardTokenSymbols[l] === 'fLODE') {
                  rewardToken = groupOfVaults.lodestar_LODE
                } else if (rewardTokenSymbols[l] === 'fSUSHI') {
                  rewardToken = groupOfVaults.SUSHI_HODL
                } else if (rewardTokenSymbols[l] === 'fDEN_4EUR') {
                  rewardToken = groupOfVaults.jarvis_DEN_4EUR
                } else if (rewardTokenSymbols[l] === 'fDEN2_4EUR') {
                  rewardToken = groupOfVaults.jarvis_DEN2_4EUR
                } else if (rewardTokenSymbols[l] === 'fDENMAY22_4EUR') {
                  rewardToken = groupOfVaults.jarvis_DENMAY22_4EUR
                } else if (rewardTokenSymbols[l] === 'fDENJUL22_4EUR') {
                  rewardToken = groupOfVaults.jarvis_DENJUL22_4EUR
                } else if (rewardTokenSymbols[l] === 'fAURFEB22_USDC') {
                  rewardToken = groupOfVaults.jarvis_AUR_USDC_V2
                } else if (
                  rewardTokenSymbols[l] === 'fQUI_2CAD' ||
                  rewardTokenSymbols[l] === 'fSES_2JPY' ||
                  rewardTokenSymbols[l] === 'fJRTMAY22_USDC' ||
                  rewardTokenSymbols[l] === 'fJRTJUL22_USDC' ||
                  rewardTokenSymbols[l] === 'fJRTSEP22_USDC' ||
                  rewardTokenSymbols[l] === 'fJRTNOV22_USDC' ||
                  rewardTokenSymbols[l] === 'fAURAPR22_USDC'
                ) {
                  rewardToken = groupOfVaults.jarvis_AUR_USDC_V2
                } else {
                  const underlyingRewardSymbol = rewardTokenSymbols[l].substring(1)
                  rewardToken = groupOfVaults[underlyingRewardSymbol]
                }
              } else {
                rewardToken = groupOfVaults[rewardSymbol]
              }

              if (rewardTokenSymbols.length > 1) {
                const rewardsEarned = userStats[stakedVaults[i]].rewardsEarned
                if (
                  rewardsEarned !== undefined &&
                  !(Object.keys(rewardsEarned).length === 0 && rewardsEarned.constructor === Object)
                ) {
                  rewards = rewardsEarned[rewardTokenSymbols[l]]
                }
              } else {
                rewards = userStats[stakedVaults[i]].totalRewardsEarned
              }

              if (rewardToken) {
                usdRewardPrice = Number(rewardToken.vaultPrice) || 0

                rewardDecimal = rewardToken.decimals
              } else {
                try {
                  const al = apiData.length
                  for (let ids = 0; ids < al; ids += 1) {
                    const tempData = apiData[ids]
                    const tempSymbol = tempData.symbol
                    if (
                      rewardSymbol === 'ECOCNG'
                        ? tempSymbol.toLowerCase() === 'cng'
                        : rewardSymbol === 'GENE'
                          ? tempSymbol.toLowerCase() === '$gene'
                          : rewardSymbol.toLowerCase() === tempSymbol.toLowerCase()
                    ) {
                      usdRewardPrice = await getTokenPriceFromApi(tempData.id)
                      break
                    }
                  }
                } catch (error) {
                  console.error('Error:', error)
                }
              }
              const rewardValues =
                rewards === undefined ? 0 : fromWei(rewards, rewardDecimal, rewardDecimal, true)
              stats.reward.push(Number(rewardValues))
              stats.totalRewardUsd += Number(rewardValues * Number(usdRewardPrice))
              valueRewards += Number(rewardValues * Number(usdRewardPrice))
              stats.rewardSymbol.push(rewardSymbol)

              const rewardPriceUSD = rewardValues * Number(usdRewardPrice)
              stats.rewardUSD.push(rewardPriceUSD)
            }

            const totalApy = getTotalApy(fAssetPool, token)

            showAPY = token.inactive ? 'Inactive' : totalApy || null
            if (showAPY === 'Inactive' || showAPY === null) {
              stats.apy = Number(-1)
            } else {
              stats.apy = Number(showAPY)
            }

            const estimatedApyByPercent = get(token, `estimatedApy`, 0)
            const estimatedApy = estimatedApyByPercent / 100
            const vaultAPRDaily = (1 + estimatedApy) ** (1 / 365) - 1
            const vaultAPYMonthly = (1 + vaultAPRDaily) ** 30 - 1
            if (fAssetPool) {
              const frl = fAssetPool.rewardAPR?.length || 0

              for (let j = 0; j < frl; j += 1) {
                totalRewardAPRByPercent += Number(fAssetPool.rewardAPR[j])
              }
            }
            const totalRewardAPR = totalRewardAPRByPercent / 100
            const poolAPRDaily = totalRewardAPR / 365
            const poolAPRMonthly = totalRewardAPR / 12

            const swapFeeAPRYearly = Number(fAssetPool?.tradingApy) / 100 || 0
            const swapFeeAPRDaily = swapFeeAPRYearly / 365
            const swapFeeAPRMonthly = swapFeeAPRYearly / 12

            const dailyYield =
              Number(stake) * usdPrice * (vaultAPRDaily + poolAPRDaily + swapFeeAPRDaily) +
              Number(unstake) * usdPrice * (vaultAPRDaily + swapFeeAPRDaily)
            const monthlyYield =
              Number(stake) * usdPrice * (vaultAPYMonthly + poolAPRMonthly + swapFeeAPRMonthly) +
              Number(unstake) * usdPrice * (vaultAPYMonthly + swapFeeAPRMonthly)

            stats.dailyYield = dailyYield
            stats.monthlyYield = monthlyYield

            totalDailyYield += dailyYield
            totalMonthlyYield += monthlyYield
            newStats.push(stats)
          }
        }

        setTotalDeposit(totalBalanceUSD)
        setTotalRewards(valueRewards)
        setTotalYieldDaily(totalDailyYield)
        setTotalYieldMonthly(totalMonthlyYield)

        const storedSortingDashboard = localStorage.getItem('sortingDashboard')
        if (storedSortingDashboard && JSON.parse(storedSortingDashboard) !== 'lifetimeYield') {
          sortedTokenList = orderBy(newStats, [JSON.parse(storedSortingDashboard)], ['desc'])
        } else {
          sortedTokenList = orderBy(newStats, ['balance'], ['desc'])
        }
        setFarmTokenList(sortedTokenList)
        if (sortedTokenList.length === 0) {
          setNoFarm(true)
        }
      }

      getFarmTokenInfo()
    }
  }, [account, userStats, showInactiveFarms])

  useEffect(() => {
    if (!isEmpty(userStats) && account && !onceRun) {
      setOnceRun(true)
      const getNetProfitValue = async () => {
        const {
          vaultNetChanges,
          sortedCombinedEnrichedArray,
          cumulativeLifetimeYield,
          stakedVaults,
          rewardsAPIDataLength,
        } = await fetchAndParseVaultData({
          account,
          groupOfVaults,
        })

        if (stakedVaults.length === 0) {
          setNoHarvestsData(true)
        }

        if (rewardsAPIDataLength === 0) {
          setNoRewardsData(true)
        }

        setTotalLifetimeYield(cumulativeLifetimeYield)
        setVaultNetChangeList(vaultNetChanges)
        setTotalHistoryData(sortedCombinedEnrichedArray)
      }

      getNetProfitValue()
      setOnceRun(false)
    } else {
      setTotalLifetimeYield(0)
      setVaultNetChangeList([])
      setTotalHistoryData([])
    }
  }, [account, userStats])

  const sortCol = field => {
    if (field === 'lifetimeYield') {
      const sortedVaultList = orderBy(
        vaultNetChangeList,
        ['sumNetChangeUsd'],
        [sortOrder ? 'asc' : 'desc'],
      )

      const idIndexMap = {}
      sortedVaultList.forEach((vault, index) => {
        idIndexMap[vault.id] = index
      })

      const sortedFarmTokenList = [...farmTokenList].sort((a, b) => {
        const aIndex = a.token.data
          ? idIndexMap[a.symbol]
          : idIndexMap[a.token.pool?.id] !== undefined
            ? idIndexMap[a.token.pool?.id]
            : Infinity

        const bIndex = b.token.data
          ? idIndexMap[b.symbol]
          : idIndexMap[b.token.pool?.id] !== undefined
            ? idIndexMap[b.token.pool?.id]
            : Infinity

        return aIndex - bIndex
      })

      setFarmTokenList(sortedFarmTokenList)
      setSortOrder(!sortOrder)
    } else {
      const tokenList = orderBy(farmTokenList, [field], [sortOrder ? 'asc' : 'desc'])
      setFarmTokenList(tokenList)
      setSortOrder(!sortOrder)
    }
    localStorage.setItem('sortingDashboard', JSON.stringify(field))
  }

  useEffect(() => {
    const filteredVaultList = showInactiveFarms
      ? farmTokenList
      : farmTokenList.filter(farm => farm.status === 'Active')
    setFilteredFarmList(filteredVaultList)
  }, [showInactiveFarms, farmTokenList])

  const positionHeader = [
    { width: isMobile ? '23%' : '40%', sort: 'symbol', name: 'Farm' },
    { width: isMobile ? '20%' : '15%', sort: 'balance', name: 'Balance', img: Sort },
    { width: isMobile ? '20%' : '15%', sort: 'lifetimeYield', name: 'Lifetime Yield', img: Sort },
    { width: isMobile ? '20%' : '15%', sort: 'totalRewardUsd', name: 'Rewards', img: Sort },
    { width: isMobile ? '12%' : '15%', sort: 'apy', name: 'Live APY', img: Sort },
  ]

  const TopBoxData = [
    {
      icon: Safe,
      content: 'Total Balance',
      price: totalDeposit,
      toolTipTitle: 'tt-total-balance',
      toolTip:
        "Sum of your wallet's staked and unstaked fTokens, denominated in USD. Note that displayed amounts are subject to change due to the live pricing of underlying tokens.",
    },
    {
      icon: Safe,
      content: 'Lifetime Yield',
      price: totalLifetimeYield,
      toolTipTitle: 'tt-total-profit',
      toolTip: (
        <>
          This metric represents your wallet&apos;s total lifetime yield from Harvest, including
          both &apos;harvest&apos; events and claimed rewards.
          <br />
          <br />
          Note: Yield from Liquidity Provision activities is not included in this metric or its
          associated chart.
        </>
      ),
    },
    {
      icon: Diamond,
      content: 'Claimable Rewards',
      price: totalRewards,
      toolTipTitle: 'tt-rewards',
      toolTip:
        'Accrued rewards on all your staked fTokens, denominated in USD. Note that displayed amounts are subject to change due to the live pricing of underlying tokens.',
    },
    {
      icon: Coin1,
      content: 'Monthly Yield Forecast',
      price: totalYieldMonthly,
      toolTipTitle: 'tt-monthly-yield',
      toolTip:
        'Estimated monthly yield on all your fTokens, denominated in USD. Note that displayed amounts are subject to change due to the live pricing of underlying tokens.',
    },
    {
      icon: Coin2,
      content: 'Daily Yield Forecast',
      price: totalYieldDaily,
      toolTipTitle: 'tt-daily-yield',
      toolTip:
        'Estimated daily yield on all your fTokens, denominated in USD. Note that displayed amounts are subject to change due to the live pricing of underlying tokens.',
    },
  ]

  const MobileTopBoxData = [
    {
      icon: Safe,
      content: 'Balance',
      price: totalDeposit,
      toolTipTitle: 'tt-total-balance',
      toolTip:
        "Sum of your wallet's staked and unstaked fTokens, denominated in USD. Note that displayed amounts are subject to change due to the live pricing of underlying tokens.",
    },
    {
      icon: Diamond,
      content: 'Rewards',
      price: totalRewards,
      toolTipTitle: 'tt-rewards',
      toolTip:
        'Accrued rewards on all your staked fTokens, denominated in USD. Note that displayed amounts are subject to change due to the live pricing of underlying tokens.',
    },
    {
      icon: Safe,
      content: 'Monthly Forecast',
      price: totalYieldMonthly,
      toolTipTitle: 'tt-monthly-yield',
      toolTip:
        'Estimated monthly yield on all your fTokens, denominated in USD. Note that displayed amounts are subject to change due to the live pricing of underlying tokens.',
    },
  ]

  return (
    <Container $bgcolor={bgColorNew} $fontcolor={fontColor}>
      <Inner>
        <HeaderWrap $padding="25px" $bordercolor={borderColorBox}>
          {!isMobile && (
            <HeaderTitle $fontcolor={fontColor} $fontcolor1={fontColor1}>
              <div className="title">Overview</div>
              <div className="desc">Displaying data from across all networks.</div>
            </HeaderTitle>
          )}
          {isMobile && (
            <MobileHeader>
              <HeaderTop>
                <LogoDiv>
                  <img src={PhoneLogo} alt="harvest logo" />
                  <div style={{ marginLeft: '10px', fontWeight: '700', fontSize: '16px' }}>
                    Harvest
                  </div>
                </LogoDiv>
                {connected && (
                  <LogoDiv $bgcolor="#F8F8F8" $borderradius="16px" $padding="3px 8px">
                    <img src={ConnectSuccessIcon} alt="connect success" width={6} height={6} />
                    <Address>{showAddress ? formatAddress(account) : '**********'}</Address>
                    <div
                      onClick={handleToggle(setShowAddress)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleToggle(setShowAddress)
                        }
                      }}
                      style={{ cursor: 'pointer', alignItems: 'center', display: 'flex' }}
                      aria-label="Toggle address visibility"
                      role="button"
                      tabIndex="0"
                    >
                      <img
                        src={showAddress ? Eye : ClosedEye}
                        alt="Toggle address visibility"
                        style={{ marginLeft: '5px' }}
                      />
                    </div>
                  </LogoDiv>
                )}
              </HeaderTop>
              <LifetimeValue
                $isloading={isLoading}
                $noFarm={noFarm}
                $connected={connected}
                $fontcolor={fontColor1}
              >
                {!connected || noFarm ? (
                  `${currencySym}0.00`
                ) : isLoading ? (
                  <Spinner
                    as="span"
                    animation="border"
                    style={{ width: '2rem', height: '2rem' }}
                    role="status"
                    aria-hidden="true"
                  />
                ) : (
                  showUsdValueCurrency(totalLifetimeYield, currencySym, currencyRate)
                )}
              </LifetimeValue>
              <LifetimeSub $fontcolor={fontColor1}>
                Lifetime Yield
                <GreenBox>
                  <IoArrowUpCircleOutline color="#5dcf46" fontsize={14} />
                  {!connected || noFarm
                    ? `${currencySym}0.00`
                    : oneDayYield === 0
                      ? `${currencySym}0.00`
                      : oneDayYield * currencyRate >= 0.01
                        ? `${currencySym}${formatNumber(oneDayYield * currencyRate)} (24h)`
                        : `<${currencySym}0.01 (24h)`}
                </GreenBox>
              </LifetimeSub>
            </MobileHeader>
          )}
          <HeaderButton>
            {!isMobile && (
              <Dropdown>
                <CurrencyDropDown
                  id="dropdown-basic"
                  $bgcolor={bgColorNew}
                  $fontcolor2={fontColor2}
                  $hovercolor={hoverColorNew}
                  style={{ padding: 0 }}
                >
                  {curCurrency ? (
                    <CurrencySelect
                      $backcolor={backColor}
                      $fontcolor2={fontColor2}
                      $hovercolor={hoverColor}
                    >
                      <img
                        className={darkMode ? 'logo-dark' : 'logo'}
                        src={curCurrency.imgPath}
                        width={16}
                        height={16}
                        alt=""
                      />
                      <span>{curCurrency.symbol}</span>
                      <img className="dropdown-icon" src={DropDownIcon} alt="" />
                    </CurrencySelect>
                  ) : (
                    <></>
                  )}
                </CurrencyDropDown>
                {!isSpecialApp ? (
                  <CurrencyDropDownMenu $backcolor={bgColorNew}>
                    {supportedCurrencies.map(elem => {
                      return (
                        <CurrencyDropDownItem
                          onClick={() => {
                            updateCurrency(elem.id)
                          }}
                          $fontcolor={fontColor}
                          $filtercolor={filterColor}
                          $hovercolor={hoverColorNew}
                          key={elem.id}
                        >
                          <img
                            className={darkMode ? 'logo-dark' : 'logo'}
                            src={elem.imgPath}
                            width={14}
                            height={14}
                            alt=""
                          />
                          <span>{elem.symbol}</span>
                          {curCurrency.id === elem.id ? (
                            <IoCheckmark className="check-icon" />
                          ) : (
                            <></>
                          )}
                        </CurrencyDropDownItem>
                      )
                    })}
                  </CurrencyDropDownMenu>
                ) : (
                  <></>
                )}
              </Dropdown>
            )}
          </HeaderButton>
        </HeaderWrap>

        <div>
          <ChartSection>
            <ChartBox
              $align="flex-start"
              $direction="row"
              $fontcolor={fontColor}
              $backcolor={backColor}
              $bordercolor={borderColor}
            >
              <LifetimeYieldData noFarm={noFarm} totalHistoryData={totalHistoryData} />
            </ChartBox>
            {!isMobile && (
              <YieldTable $display={showLatestYield ? 'block' : 'none'}>
                <div className="table-title">Latest Yield</div>
                <EarningsHistoryLatest
                  historyData={totalHistoryData}
                  noFarm={noFarm}
                  setOneDayYield={setOneDayYield}
                />
              </YieldTable>
            )}
          </ChartSection>
          <SubPart>
            {!isMobile
              ? TopBoxData.map((data, index) => (
                  <TotalValue
                    key={index}
                    icon={data.icon}
                    content={data.content}
                    price={data.price}
                    toolTipTitle={data.toolTipTitle}
                    toolTip={data.toolTip}
                    connected={connected}
                    isloading={isLoading}
                    farmTokenListLength={filteredFarmList.length}
                  />
                ))
              : MobileTopBoxData.map((data, index) => (
                  <TotalValue
                    key={index}
                    icon={data.icon}
                    content={data.content}
                    price={data.price}
                    toolTipTitle={data.toolTipTitle}
                    toolTip={data.toolTip}
                    connected={connected}
                    isloading={isLoading}
                    farmTokenListLength={filteredFarmList.length}
                  />
                ))}
          </SubPart>
        </div>

        <TableWrap $fontcolor1={fontColor1}>
          {isMobile && (
            <MobileSwitch $darkmode={darkMode}>
              <SwitchBtn
                $fontcolor={
                  darkMode
                    ? showLatestYield
                      ? '#fff'
                      : '#15191C'
                    : showLatestYield
                      ? '#15191C'
                      : '#fff'
                }
                $backcolor={showLatestYield ? 'unset' : '#5DCF46'}
                $boxshadow={
                  showLatestYield
                    ? 'none'
                    : '0px 1px 3px 0px rgba(16, 24, 40, 0.1), 0px 1px 2px 0px rgba(16, 24, 40, 0.06)'
                }
                onClick={() => setShowLatestYield(false)}
              >
                Positions
              </SwitchBtn>
              <SwitchBtn
                $fontcolor={
                  darkMode
                    ? showLatestYield
                      ? '#15191C'
                      : '#fff'
                    : showLatestYield
                      ? '#fff'
                      : '#15191C'
                }
                $backcolor={showLatestYield ? '#5DCF46' : 'unset'}
                $boxshadow={
                  showLatestYield
                    ? '0px 1px 3px 0px rgba(16, 24, 40, 0.1), 0px 1px 2px 0px rgba(16, 24, 40, 0.06)'
                    : 'none'
                }
                onClick={() => setShowLatestYield(true)}
              >
                Latest Yield
              </SwitchBtn>
            </MobileSwitch>
          )}
          <PositionTable $display={showLatestYield ? 'none' : 'block'}>
            <div className="table-title">Positions</div>
            <TransactionDetails>
              <TableContent $count={filteredFarmList.length}>
                <Header $bordercolor={borderColorBox} $backcolor={bgColorNew}>
                  {positionHeader.map((data, index) => (
                    <Column key={index} $width={data.width} $fontcolor={fontColor}>
                      <Col
                        onClick={() => {
                          sortCol(data.sort)
                        }}
                      >
                        {data.name}
                      </Col>
                    </Column>
                  ))}
                </Header>
                {connected && filteredFarmList.length > 0 ? (
                  <ContentBox $bordercolor={borderColorBox}>
                    {filteredFarmList.map((el, i) => {
                      const info = filteredFarmList[i]
                      let lifetimeYield = -1
                      if (vaultNetChangeList.length > 0) {
                        let found = false
                        vaultNetChangeList.some(item => {
                          if (item.id === info.token?.id || item.id === info.token?.pool?.id) {
                            lifetimeYield = item.sumNetChangeUsd
                            found = true
                            return true
                          }
                          return false
                        })
                        if (!found) {
                          lifetimeYield = 0
                        }
                      }
                      return (
                        <VaultRow
                          key={i}
                          info={info}
                          lifetimeYield={lifetimeYield}
                          lastElement={i === filteredFarmList.length - 1 ? 'yes' : 'no'}
                          cKey={i}
                          darkMode={darkMode}
                        />
                      )
                    })}
                  </ContentBox>
                ) : connected ? (
                  !noFarm ? (
                    <SkeletonLoader isPosition="true" />
                  ) : (
                    <EmptyPanel $bordercolor={borderColorBox} $height="400px">
                      <EmptyInfo
                        $height="100%"
                        $weight={500}
                        $size={14}
                        $lineheight={20}
                        $flexflow="column"
                        $fontcolor={fontColor}
                        $gap="0px"
                      >
                        <div>
                          Looks like you are not farming anywhere. Let&apos;s put your assets to
                          work!
                        </div>
                        <ExploreButtonStyle
                          onClick={() => {
                            navigate(ROUTES.ADVANCED)
                          }}
                          $inputbordercolor={inputBorderColor}
                          $bordercolor={fontColor}
                          $disabled={disableWallet}
                          $backcolor={btnColor}
                          $hovercolor={btnHoverColor}
                        >
                          <img src={AdvancedImg} className="explore-farms" alt="" />
                          Explore Farms
                        </ExploreButtonStyle>
                      </EmptyInfo>
                    </EmptyPanel>
                  )
                ) : (
                  <EmptyPanel $bordercolor={borderColorBox} $height="400px">
                    <EmptyInfo $height="100%" $flexflow="column" $gap="0px">
                      <EmptyInfo $weight={500} $size={14} $lineheight={20} $fontcolor={fontColor}>
                        Connect wallet to see your positions.
                      </EmptyInfo>
                      <ConnectButtonStyle
                        onClick={() => {
                          connectAction()
                        }}
                        $inputbordercolor={inputBorderColor}
                        $bordercolor={fontColor}
                        $disabled={disableWallet}
                        $hovercolor={btnHoverColor}
                        $backcolor={btnColor}
                      >
                        Connect
                      </ConnectButtonStyle>
                    </EmptyInfo>
                  </EmptyPanel>
                )}
              </TableContent>
            </TransactionDetails>
          </PositionTable>
          {isMobile && (
            <YieldTable $display={showLatestYield ? 'block' : 'none'}>
              <div className="table-title">Latest Yield</div>
              <EarningsHistoryLatest
                historyData={totalHistoryData}
                isDashboard="true"
                noData={noFarm}
                setOneDayYield={setOneDayYield}
                isloading={isLoading}
              />
            </YieldTable>
          )}
        </TableWrap>
      </Inner>
    </Container>
  )
}

export default Portfolio
