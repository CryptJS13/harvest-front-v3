import BigNumber from 'bignumber.js'
import { find, get, isEqual, isArray } from 'lodash'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useMediaQuery } from 'react-responsive'
import ReactHtmlParser from 'react-html-parser'
import ReactTooltip from 'react-tooltip'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import useEffectWithPrevious from 'use-effect-with-previous'
import { getBalances, getSupportedTokens } from 'wido'
// import axios from 'axios'
import tokenMethods from '../../services/web3/contracts/token/methods'
import tokenContract from '../../services/web3/contracts/token/contract.json'
import ARBITRUM from '../../assets/images/chains/arbitrum.svg'
import BASE from '../../assets/images/chains/base.svg'
import ETHEREUM from '../../assets/images/chains/ethereum.svg'
import POLYGON from '../../assets/images/chains/polygon.svg'
import Back from '../../assets/images/logos/earn/back-arrow.svg'
import Info from '../../assets/images/logos/earn/info.svg'
// import BeginnerFriendly from '../../assets/images/logos/beginners/beginner-friendly.svg'
import WithdrawAnytime from '../../assets/images/logos/beginners/check-circle.svg'
import Safe from '../../assets/images/logos/beginners/safe.svg'
import BarChart from '../../assets/images/logos/beginners/bar-chart-01.svg'
// import Thumbsup from '../../assets/images/logos/beginners/thumbs-up.svg'
import DOT from '../../assets/images/logos/beginners/dot.svg'
import BottomEffect from '../../assets/images/logos/beginners/Top Banner.svg'
import AnimatedDots from '../../components/AnimatedDots'
import DepositBase from '../../components/AdvancedFarmComponents/Deposit/DepositBase'
import DepositSelectToken from '../../components/AdvancedFarmComponents/Deposit/DepositSelectToken'
import DepositStart from '../../components/AdvancedFarmComponents/Deposit/DepositStart'
import DepositResult from '../../components/AdvancedFarmComponents/Deposit/DepositResult'
import WithdrawBase from '../../components/AdvancedFarmComponents/Withdraw/WithdrawBase'
import WithdrawSelectToken from '../../components/AdvancedFarmComponents/Withdraw/WithdrawSelectToken'
import WithdrawStart from '../../components/AdvancedFarmComponents/Withdraw/WithdrawStart'
import WithdrawResult from '../../components/AdvancedFarmComponents/Withdraw/WithdrawResult'
import FarmDetailChart from '../../components/DetailChart/FarmDetailChart'
import PriceShareData from '../../components/PriceShareChart/PriceShareData'
import {
  DECIMAL_PRECISION,
  FARM_GRAIN_TOKEN_SYMBOL,
  FARM_TOKEN_SYMBOL,
  FARM_WETH_TOKEN_SYMBOL,
  IFARM_TOKEN_SYMBOL,
  ROUTES,
  SPECIAL_VAULTS,
  POOL_BALANCES_DECIMALS,
} from '../../constants'
import { fromWei, newContractInstance, getWeb3, getExplorerLink } from '../../services/web3'
import { addresses } from '../../data'
import { usePools } from '../../providers/Pools'
import { useStats } from '../../providers/Stats'
import { useThemeContext } from '../../providers/useThemeContext'
import { useVaults } from '../../providers/Vault'
import { useWallet } from '../../providers/Wallet'
import {
  displayAPY,
  getTotalApy,
  formatNumber,
  getAdvancedRewardText,
  getLastHarvestInfo,
} from '../../utils'
import {
  BackArrow,
  BackBtnRect,
  BackText,
  BigDiv,
  DetailView,
  FlexDiv,
  FlexTopDiv,
  HalfContent,
  InfoIcon,
  Inner,
  TopInner,
  TopBtnInner,
  TopButton,
  LogoImg,
  NewLabel,
  RestContent,
  TopDesc,
  TopPart,
  MyBalance,
  GuideSection,
  GuidePart,
  DepositSection,
  WithdrawSection,
  MainSection,
  ChainBack,
  MainTag,
  MainDescText,
  InternalSection,
  HalfInfo,
  InfoLabel,
  DescInfo,
  LastHarvestInfo,
  RestInternal,
  MainTagPanel,
  FirstPartSection,
  APRValueShow,
  BorderBottomDiv,
} from './style'
import { CHAIN_IDS } from '../../data/constants'
// import { array } from 'prop-types'

const chainList = [
  { id: 1, name: 'Ethereum', chainId: 1 },
  { id: 2, name: 'Polygon', chainId: 137 },
  { id: 3, name: 'Arbitrum', chainId: 42161 },
  { id: 4, name: 'Base', chainId: 8453 },
]

const mainTags = [
  { name: 'Deposit', img: Safe },
  { name: 'Details', img: BarChart },
]

const getVaultValue = token => {
  const poolId = get(token, 'data.id')

  switch (poolId) {
    case SPECIAL_VAULTS.FARM_WETH_POOL_ID:
      return get(token, 'data.lpTokenData.liquidity')
    case SPECIAL_VAULTS.NEW_PROFIT_SHARING_POOL_ID: {
      if (!get(token, 'data.lpTokenData.price')) {
        return null
      }

      return new BigNumber(get(token, 'data.totalValueLocked', 0))
    }
    case SPECIAL_VAULTS.FARM_GRAIN_POOL_ID:
    case SPECIAL_VAULTS.FARM_USDC_POOL_ID:
      return get(token, 'data.totalValueLocked')
    default:
      return token.usdPrice
        ? new BigNumber(token.underlyingBalanceWithInvestment)
            .times(token.usdPrice)
            .dividedBy(new BigNumber(10).pow(token.decimals))
        : null
  }
}

const BeginnersFarm = () => {
  const { paramAddress } = useParams()
  // Switch Tag (Deposit/Withdraw)
  const [activeDepo, setActiveDepo] = useState(true)

  const isMobile = useMediaQuery({ query: '(max-width: 992px)' })

  const { push } = useHistory()

  const { vaultsData, loadingVaults } = useVaults()
  const { pools, userStats, fetchUserPoolStats } = usePools()
  const { connected, account, balances, getWalletBalances } = useWallet()
  const { profitShareAPY } = useStats()
  /* eslint-disable global-require */
  const { tokens } = require('../../data')
  /* eslint-enable global-require */

  const farmProfitSharingPool = pools.find(
    pool => pool.id === SPECIAL_VAULTS.NEW_PROFIT_SHARING_POOL_ID,
  )
  const farmWethPool = pools.find(pool => pool.id === SPECIAL_VAULTS.FARM_WETH_POOL_ID)
  const farmGrainPool = pools.find(pool => pool.id === SPECIAL_VAULTS.FARM_GRAIN_POOL_ID)

  const poolVaults = useMemo(
    () => ({
      [FARM_TOKEN_SYMBOL]: {
        poolVault: true,
        profitShareAPY,
        data: farmProfitSharingPool,
        logoUrl: ['./icons/ifarm.svg'],
        tokenAddress: addresses.FARM,
        vaultAddress: addresses.FARM,
        rewardSymbol: 'iFarm',
        tokenNames: ['FARM'],
      },
      [FARM_WETH_TOKEN_SYMBOL]: {
        liquidityPoolVault: true,
        tokenNames: ['FARM, ETH'], // 'FARM/ETH',
        platform: ['Uniswap'],
        data: farmWethPool,
        vaultAddress: addresses.FARM_WETH_LP,
        logoUrl: ['./icons/farm.svg', './icons/eth.svg'],
        rewardSymbol: FARM_TOKEN_SYMBOL,
      },
      [FARM_GRAIN_TOKEN_SYMBOL]: {
        liquidityPoolVault: true,
        tokenNames: ['FARM, GRAIN'], // 'FARM/GRAIN',
        platform: ['Uniswap'],
        data: farmGrainPool,
        vaultAddress: addresses.FARM_GRAIN_LP,
        logoUrl: ['./icons/farm.svg', './icons/grain.svg'],
        rewardSymbol: FARM_TOKEN_SYMBOL,
      },
    }),
    [farmGrainPool, farmWethPool, farmProfitSharingPool, profitShareAPY],
  )

  const groupOfVaults = { ...vaultsData, ...poolVaults }
  const vaultsKey = Object.keys(groupOfVaults)
  const vaultIds = vaultsKey.filter(
    vaultId =>
      groupOfVaults[vaultId].vaultAddress === paramAddress ||
      groupOfVaults[vaultId].tokenAddress === paramAddress,
  )
  const id = vaultIds[0]
  const token = groupOfVaults[id]

  const { logoUrl } = token

  const isSpecialVault = token.liquidityPoolVault || token.poolVault
  const tokenVault = get(vaultsData, token.hodlVaultId || id)

  const vaultPool = isSpecialVault
    ? token.data
    : find(pools, pool => pool.collateralAddress === get(tokenVault, `vaultAddress`))

  const farmAPY = get(vaultPool, 'totalRewardAPY', 0)
  const tradingApy = get(vaultPool, 'tradingApy', 0)
  const boostedEstimatedAPY = get(tokenVault, 'boostedEstimatedAPY', 0)
  const boostedRewardAPY = get(vaultPool, 'boostedRewardAPY', 0)
  const totalApy = isSpecialVault
    ? getTotalApy(null, token, true)
    : getTotalApy(vaultPool, tokenVault)

  const chain = token.chain || token.data.chain

  const BadgeAry = [ETHEREUM, POLYGON, ARBITRUM, BASE]

  const [badgeId, setBadgeId] = useState(-1)
  useEffect(() => {
    const getBadge = () => {
      chainList.forEach((el, i) => {
        if (el.chainId === Number(chain)) {
          setBadgeId(i)
        }
      })
    }
    getBadge()
  }, [chain])

  useEffect(() => {
    // 👇️ scroll to top on page load
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }, [])

  const useIFARM = id === FARM_TOKEN_SYMBOL
  const fAssetPool = isSpecialVault
    ? token.data
    : find(pools, pool => pool.collateralAddress === tokens[id].vaultAddress)
  const multipleAssets = useMemo(
    () =>
      isArray(tokens[id].tokenAddress) &&
      tokens[id].tokenAddress.map(address => {
        const selectedSymbol = Object.keys(tokens).find(
          symbol =>
            !isArray(tokens[symbol].tokenAddress) &&
            tokens[symbol].tokenAddress.toLowerCase() === address.toLowerCase(),
        )
        return selectedSymbol
      }),
    [id, tokens],
  )

  const tokenDecimals = token.decimals || tokens[id].decimals
  const lpTokenBalance = get(userStats, `[${fAssetPool.id}]['lpTokenBalance']`, 0)

  const usdPrice =
    token.usdPrice || (token.data && token.data.lpTokenData && token.data.lpTokenData.price)

  // Deposit
  const [depositStart, setDepositStart] = useState(false)
  const [selectTokenDepo, setSelectTokenDepo] = useState(false)
  // const [clickTokenIdDepo, setClickedTokenIdDepo] = useState(-1)
  const [balanceDepo, setBalanceDepo] = useState(0)
  const [pickedTokenDepo, setPickedTokenDepo] = useState({ symbol: 'Select Token' })
  const [depositFinalStep, setDepositFinalStep] = useState(false)
  const [quoteValueDepo, setQuoteValueDepo] = useState(null)
  const [inputAmountDepo, setInputAmountDepo] = useState(0)
  const [partHeightDepo, setPartHeightDepo] = useState(null)

  // Withdraw
  const [withdrawStart, setWithdrawStart] = useState(false)
  const [selectTokenWith, setSelectTokenWith] = useState(false)
  const [pickedTokenWith, setPickedTokenWith] = useState({ symbol: 'Select' })
  const [withdrawFinalStep, setWithdrawFinalStep] = useState(false)
  const [unstakeBalance, setUnstakeBalance] = useState('0')
  // const [clickTokenIdWith, setClickedTokenIdWith] = useState(-1)
  const [partHeightWith, setPartHeightWith] = useState(null)
  const [quoteValueWith, setQuoteValueWith] = useState(null)

  const [balanceList, setBalanceList] = useState([])
  const [supTokenList, setSupTokenList] = useState([])
  const [supTokenNoBalanceList, setSupTokenNoBalanceList] = useState([])
  const [defaultToken, setDefaultToken] = useState({})
  const [soonToSupList, setSoonToSupList] = useState([])

  const toTokenAddress = useIFARM ? addresses.iFARM : token.vaultAddress || token.tokenAddress
  useEffect(() => {
    const getTokenBalance = async () => {
      try {
        if (chain && account && Object.keys(balances).length !== 0) {
          const curBalances = await getBalances(account, [chain.toString()])
          const curSortedBalances = curBalances.sort(function reducer(a, b) {
            return Number(fromWei(b.balance, b.decimals)) - Number(fromWei(a.balance, a.decimals))
          })
          setBalanceList(curSortedBalances)
          let supList = [],
            directInSup = {},
            directInBalance = {}
          try {
            supList = await getSupportedTokens({
              chainId: [chain],
              toToken: toTokenAddress,
              toChainId: chain,
            })
          } catch (err) {
            console.log('getSupportedTokens of Wido: ', err)
          }
          const tokenAddress =
            token.tokenAddress !== undefined && token.tokenAddress.length !== 2
              ? token.tokenAddress
              : token.vaultAddress

          supList = supList.map(sup => {
            const supToken = curBalances.find(el => el.address === sup.address)
            if (supToken) {
              sup.balance = supToken.balance
              sup.usdValue = supToken.balanceUsdValue
              sup.usdPrice = supToken.usdPrice
            } else {
              sup.balance = '0'
              sup.usdValue = '0'
            }
            sup.default = false

            if (Object.keys(directInSup).length === 0 && tokenAddress.length !== 2) {
              if (sup.address.toLowerCase() === tokenAddress.toLowerCase()) {
                directInSup = sup
              }
            }
            return sup
          })

          supList = supList.sort(function reducer(a, b) {
            return Number(fromWei(b.balance, b.decimals)) - Number(fromWei(a.balance, a.decimals))
          })

          for (let j = 0; j < curBalances.length; j += 1) {
            if (Object.keys(directInBalance).length === 0 && tokenAddress.length !== 2) {
              if (curBalances[j].address.toLowerCase() === tokenAddress.toLowerCase()) {
                directInBalance = curBalances[j]
              }
            }
          }

          const vaultId = Object.keys(groupOfVaults).find(
            key => groupOfVaults[key].tokenAddress === tokenAddress,
          )
          const directBalance = balances[vaultId]
          const directUsdPrice = token.usdPrice
          const directUsdValue =
            directUsdPrice && directBalance
              ? new BigNumber(directBalance)
                  .div(10 ** tokenDecimals)
                  .times(directUsdPrice)
                  .toFixed(4)
              : '0'

          if (!(Object.keys(directInSup).length === 0 && directInSup.constructor === Object)) {
            directInSup.balance = directBalance
            directInSup.usdPrice = directInSup.usdPrice > 0 ? directInSup.usdPrice : directUsdPrice
            directInSup.usdValue = directInSup.usdValue > 0 ? directInSup.usdValue : directUsdValue
            supList = supList.sort(function result(x, y) {
              return x === directInSup ? -1 : y === directInSup ? 1 : 0
            })
            supList[0].default = true
          } else if (
            !(Object.keys(directInBalance).length === 0 && directInBalance.constructor === Object)
          ) {
            directInBalance.balance = directBalance || '0'
            directInBalance.usdPrice =
              directInBalance.usdPrice > 0 ? directInBalance.usdPrice : directUsdPrice
            directInBalance.usdValue =
              directInBalance.usdValue > 0 ? directInBalance.usdValue : directUsdValue
            supList.unshift(directInBalance)
            supList[0].default = true
          } else {
            const web3Client = await getWeb3(chain, null)
            const { getSymbol } = tokenMethods
            const lpInstance = await newContractInstance(
              id,
              tokenAddress,
              tokenContract.abi,
              web3Client,
            )
            const lpSymbol = await getSymbol(lpInstance)
            const direct = {
              symbol: lpSymbol,
              address: tokenAddress,
              balance: directBalance || '0',
              default: true,
              usdPrice: directUsdPrice || '0',
              usdValue: directUsdValue || '0',
              logoURI: 'https://etherscan.io/images/main/empty-token.png',
              decimals: tokenDecimals,
              chainId: parseInt(chain, 0),
            }
            supList.unshift(direct)
          }
          if (supList[0].default) {
            setDefaultToken(supList[0])
          }
          supList.shift()
          setSupTokenList(supList)

          const supNoBalanceList = []
          if (supList.length > 0) {
            for (let i = 0; i < supList.length; i += 1) {
              if (Number(supList[i].balance) === 0) {
                supNoBalanceList.push(supList[i])
              }
            }
          }
          setSupTokenNoBalanceList(supNoBalanceList)

          const soonSupList = []
          for (let j = 0; j < curBalances.length; j += 1) {
            const supToken = supList.find(el => el.address === curBalances[j].address)
            if (!supToken) {
              soonSupList.push(curBalances[j])
            }

            if (Object.keys(directInBalance).length === 0 && tokenAddress.length !== 2) {
              if (curBalances[j].address.toLowerCase() === tokenAddress.toLowerCase()) {
                directInBalance = curBalances[j]
              }
            }
          }
          setSoonToSupList(soonSupList)
        }
      } catch (err) {
        console.log('getTokenBalance: ', err)
      }
    }

    getTokenBalance()
  }, [account, chain, balances]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (supTokenList.length > 0) {
      for (let i = 0; i < supTokenList.length; i += 1) {
        if (supTokenList[i].symbol === 'USDC') {
          setPickedTokenDepo(supTokenList[i])
          setBalanceDepo(
            fromWei(
              supTokenList[i].balance ? supTokenList[i].balance : 0,
              supTokenList[i].decimals,
            ),
          )
          return
        }
      }
    }
  }, [supTokenList])

  const { pageBackColor, fontColor, filterColor } = useThemeContext()

  const firstUserPoolsLoad = useRef(true)
  const firstWalletBalanceLoad = useRef(true)

  useEffectWithPrevious(
    ([prevAccount, prevUserStats, prevBalances]) => {
      const hasSwitchedAccount = account !== prevAccount && account

      if (
        hasSwitchedAccount ||
        firstUserPoolsLoad.current ||
        (userStats && !isEqual(userStats, prevUserStats))
      ) {
        const loadUserPoolsStats = async () => {
          firstUserPoolsLoad.current = false
          const poolsToLoad = [fAssetPool]
          await fetchUserPoolStats(poolsToLoad, account, userStats)
        }
        loadUserPoolsStats()
      }

      if (
        hasSwitchedAccount ||
        firstWalletBalanceLoad.current ||
        (balances && !isEqual(balances, prevBalances))
      ) {
        const getBalance = async () => {
          firstWalletBalanceLoad.current = false
          await getWalletBalances([IFARM_TOKEN_SYMBOL, FARM_TOKEN_SYMBOL, id], false, true)
        }

        getBalance()
      }
    },
    [account, userStats, balances],
  )

  // Switch Deposit / Withdraw
  const switchDepoMethod = () => setActiveDepo(prev => !prev)

  // Count of users that used token
  // const [holderCount, setHolderCount] = useState(0)
  // useEffect(() => {
  //   const getTokenHolder = async () => {
  //     const chainName =
  //       chain === CHAIN_IDS.ETH_MAINNET
  //         ? 'eth'
  //         : chain === CHAIN_IDS.ARBITRUM_ONE
  //         ? 'arbitrum'
  //         : chain === CHAIN_IDS.POLYGON_MAINNET
  //         ? 'polygon'
  //         : ''

  //     const options = {
  //       method: 'POST',
  //       url:
  //         'https://rpc.ankr.com/multichain/79258ce7f7ee046decc3b5292a24eb4bf7c910d7e39b691384c7ce0cfb839a01/',
  //       // eslint-disable-next-line camelcase
  //       params: { ankr_getTokenHolders: '' },
  //       headers: { accept: 'application/json', 'content-type': 'application/json' },
  //       data: {
  //         jsonrpc: '2.0',
  //         method: 'ankr_getTokenHolders',
  //         params: {
  //           blockchain: chainName,
  //           contractAddress: paramAddress,
  //         },
  //         id: 1,
  //       },
  //     }

  //     axios
  //       .request(options)
  //       .then(response => {
  //         if (response.data.result === undefined) {
  //           return
  //         }
  //         setHolderCount(response.data.result.holdersCount)
  //       })
  //       .catch(error => {
  //         console.error(error)
  //       })
  //   }

  //   getTokenHolder()
  // }, [paramAddress, chain, token])

  // Deposit / Stake / Details
  const [activeMainTag, setActiveMainTag] = useState(0)

  const curUrl = document.location.href
  useEffect(() => {
    if (curUrl.includes('#details')) {
      setActiveMainTag(1)
    }
  }, [curUrl])

  const [vaultValue, setVaultValue] = useState(null)
  const [lastHarvest, setLastHarvest] = useState('')

  const [loadData, setLoadData] = useState(true)
  useEffect(() => {
    const getLastHarvest = async () => {
      const value = await getLastHarvestInfo(paramAddress, chain)
      setLastHarvest(value)
    }

    getLastHarvest()
  }, [paramAddress, chain])

  useEffect(() => {
    setVaultValue(getVaultValue(token))
  }, [token])

  const { pathname } = useLocation()

  const apyDaily = totalApy
    ? (((Number(totalApy) / 100 + 1) ** (1 / 365) - 1) * 100).toFixed(3)
    : null

  const showAPY = () => {
    return (
      <>
        {isSpecialVault ? (
          token.data &&
          token.data.loaded &&
          (token.data.dataFetched === false || totalApy !== null) ? (
            <div>{token.inactive ? 'Inactive' : <>{totalApy ? displayAPY(totalApy) : null}</>}</div>
          ) : (
            <div>
              <AnimatedDots />
            </div>
          )
        ) : vaultPool.loaded && totalApy !== null && !loadingVaults ? (
          <div>
            {token.inactive || token.testInactive || token.hideTotalApy || !token.dataFetched ? (
              token.inactive || token.testInactive ? (
                'Inactive'
              ) : null
            ) : (
              <>{displayAPY(totalApy, DECIMAL_PRECISION, 10)}</>
            )}
          </div>
        ) : (
          <div>
            <AnimatedDots />
          </div>
        )}
      </>
    )
  }

  const showTVL = () => {
    return (
      <>
        {token.excludeVaultStats ? (
          'N/A'
        ) : vaultValue ? (
          <>${formatNumber(vaultValue, 2)}</>
        ) : (
          <AnimatedDots />
        )}
      </>
    )
  }

  const showApyDaily = () => {
    return (
      <>
        {isSpecialVault ? (
          token.data &&
          token.data.loaded &&
          (token.data.dataFetched === false || totalApy !== null) ? (
            <div>{token.inactive ? 'Inactive' : <>{totalApy ? `${apyDaily}%` : null}</>}</div>
          ) : (
            <AnimatedDots />
          )
        ) : vaultPool.loaded && totalApy !== null && !loadingVaults ? (
          <div>
            {token.inactive || token.testInactive || token.hideTotalApy || !token.dataFetched ? (
              token.inactive || token.testInactive ? (
                'Inactive'
              ) : null
            ) : (
              <>{apyDaily}%</>
            )}
          </div>
        ) : (
          <AnimatedDots />
        )}
      </>
    )
  }

  const rewardTxt = getAdvancedRewardText(
    token,
    vaultPool,
    tradingApy,
    farmAPY,
    totalApy,
    true,
    boostedEstimatedAPY,
    boostedRewardAPY,
  )

  const profitShare =
    chain === CHAIN_IDS.ETH_MAINNET ? '10' : chain === CHAIN_IDS.POLYGON_MAINNET ? '5' : '7'
  const harvestTreasury =
    chain === CHAIN_IDS.ETH_MAINNET ? '5' : chain === CHAIN_IDS.POLYGON_MAINNET ? '3' : '3'

  return (
    <DetailView pageBackColor={pageBackColor} fontColor={fontColor}>
      {!isMobile && (
        <TopBtnInner>
          <TopButton className="back-btn">
            <BackBtnRect
              onClick={() => {
                push(ROUTES.BEGINNERS)
              }}
            >
              <BackArrow src={Back} alt="" />
              <BackText>Back</BackText>
            </BackBtnRect>
          </TopButton>
        </TopBtnInner>
      )}
      <TopInner>
        <TopPart>
          <FlexTopDiv>
            {isMobile && (
              <FlexDiv>
                {logoUrl.map((el, i) => (
                  <LogoImg className="logo" src={el.slice(1, el.length)} key={i} alt="" />
                ))}
                <ChainBack>
                  <img src={BadgeAry[badgeId]} width={6} height={10} alt="" />
                </ChainBack>
              </FlexDiv>
            )}
            {!isMobile && (
              <FlexDiv>
                {logoUrl.map((el, i) => (
                  <LogoImg className="logo" src={el.slice(1, el.length)} key={i} alt="" />
                ))}
                <ChainBack>
                  <img src={BadgeAry[badgeId]} width={10} height={15} alt="" />
                </ChainBack>
              </FlexDiv>
            )}
            <TopDesc
              weight={600}
              size={isMobile ? '19.7px' : '25px'}
              height={isMobile ? '45px' : '82px'}
              marginBottom={isMobile ? '5px' : '10px'}
            >
              {token.tokenNames.join(' • ')}
            </TopDesc>
            <GuideSection>
              <GuidePart fontWeight="600">
                <img src={DOT} alt="" />
                {displayAPY(totalApy, DECIMAL_PRECISION, 10)}
                &nbsp;APR
              </GuidePart>
              <GuidePart fontWeight="500">
                <img className="icon" src={WithdrawAnytime} alt="" />
                Withdraw Anytime
              </GuidePart>
            </GuideSection>
          </FlexTopDiv>
          <img className="bottom" src={BottomEffect} alt="" />
          <BorderBottomDiv />
        </TopPart>
      </TopInner>
      <Inner>
        <BigDiv>
          <MainTagPanel>
            {mainTags.map((tag, i) => (
              <MainTag
                key={i}
                active={activeMainTag === i ? 'true' : 'false'}
                onClick={() => {
                  setActiveMainTag(i)
                  if (i !== 0) {
                    push(`${pathname}#${tag.name.toLowerCase()}`)
                  } else {
                    push(pathname)
                  }
                }}
              >
                <img src={tag.img} alt="logo" />
                <p>{tag.name}</p>
              </MainTag>
            ))}
          </MainTagPanel>
          {activeMainTag === 0 ? (
            <MainDescText>
              Turn any token from your wallet into auto-compounding fToken to start farming.
            </MainDescText>
          ) : (
            <MainDescText>
              Preview live data, APY breakdown and source of yield to make informed farming
              decisions.
            </MainDescText>
          )}
          <InternalSection height={activeMainTag === 0 ? '500px' : 'unset'}>
            <MainSection height={activeMainTag === 0 ? '100%' : 'fit-content'}>
              {activeMainTag === 0 ? (
                loadData ? (
                  <PriceShareData
                    token={token}
                    vaultPool={vaultPool}
                    tokenSymbol={id}
                    setLoadData={setLoadData}
                  />
                ) : (
                  <HalfInfo padding="25px 18px" marginBottom="0">
                    <FarmDetailChart
                      token={token}
                      vaultPool={vaultPool}
                      lastTVL={Number(vaultValue)}
                      lastAPY={Number(totalApy)}
                    />
                  </HalfInfo>
                )
              ) : (
                <>
                  {loadData && (
                    <HalfInfo padding="25px 18px" marginBottom="23px">
                      <FarmDetailChart
                        token={token}
                        vaultPool={vaultPool}
                        lastTVL={Number(vaultValue)}
                        lastAPY={Number(totalApy)}
                      />
                    </HalfInfo>
                  )}
                  <HalfInfo marginBottom="20px">
                    <NewLabel
                      weight={700}
                      size="14px"
                      height="24px"
                      padding="10px 15px"
                      borderRadius="15px 15px 0 0"
                    >
                      Source of Yield
                    </NewLabel>
                    <DescInfo>{ReactHtmlParser(vaultPool.stakeAndDepositHelpMessage)}</DescInfo>
                    <FlexDiv className="address" padding="0 15px 20px">
                      {token.vaultAddress && (
                        <InfoLabel
                          display="flex"
                          href={`${getExplorerLink(token.chain)}/address/${token.vaultAddress}`}
                          target="_blank"
                          onClick={e => e.stopPropagation()}
                          rel="noopener noreferrer"
                        >
                          <NewLabel
                            size="12px"
                            weight={isMobile ? 400 : 600}
                            height="16px"
                            self="center"
                            color="#15202b"
                          >
                            Vault Address
                          </NewLabel>
                        </InfoLabel>
                      )}
                      {vaultPool.autoStakePoolAddress && (
                        <InfoLabel
                          display="flex"
                          href={`${getExplorerLink(token.chain)}/address/${
                            vaultPool.contractAddress
                          }`}
                          target="_blank"
                          onClick={e => e.stopPropagation()}
                          rel="noopener noreferrer"
                        >
                          <NewLabel
                            size="12px"
                            weight={isMobile ? 400 : 600}
                            height="16px"
                            self="center"
                            color="#15202b"
                          >
                            Strategy Address
                          </NewLabel>
                        </InfoLabel>
                      )}
                      <InfoLabel
                        display="flex"
                        href={`${getExplorerLink(token.chain)}/address/${
                          vaultPool.autoStakePoolAddress || vaultPool.contractAddress
                        }`}
                        onClick={e => e.stopPropagation()}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <NewLabel
                          size="12px"
                          weight={isMobile ? 400 : 600}
                          height="16px"
                          self="center"
                          color="#15202b"
                        >
                          Pool Address
                        </NewLabel>
                      </InfoLabel>
                    </FlexDiv>
                  </HalfInfo>
                  {!isMobile && !loadData && (
                    <MyBalance marginBottom={isMobile ? '24px' : '20px'}>
                      <NewLabel
                        size={isMobile ? '12px' : '14px'}
                        weight="700"
                        height={isMobile ? '18px' : '24px'}
                        color="#344054"
                        padding={isMobile ? '9px 13px' : '10px 15px'}
                        borderBottom="1px solid #EBEBEB"
                      >
                        APY Breakdown
                      </NewLabel>
                      <NewLabel padding={isMobile ? '9px 13px' : '0px 15px 10px'}>
                        <div dangerouslySetInnerHTML={{ __html: rewardTxt }} />
                      </NewLabel>
                    </MyBalance>
                  )}
                </>
              )}
            </MainSection>
            <RestContent height={activeMainTag === 0 ? '100%' : 'fit-content'}>
              {activeMainTag === 0 ? (
                <FirstPartSection>
                  <MyBalance
                    marginBottom={isMobile ? '0' : '23px'}
                    marginTop={isMobile ? '0px' : '0'}
                  >
                    <NewLabel
                      size={isMobile ? '12px' : '14px'}
                      weight="600"
                      height={isMobile ? '18px' : '24px'}
                      color="#344054"
                      padding={isMobile ? '7px 11px' : '10px 15px'}
                      borderBottom="1px solid #EBEBEB"
                    >
                      My Balance
                    </NewLabel>
                    <FlexDiv
                      justifyContent="space-between"
                      padding={isMobile ? '7px 11px' : '10px 15px'}
                    >
                      <NewLabel
                        display="flex"
                        size={isMobile ? '10px' : '14px'}
                        weight="500"
                        height={isMobile ? '18px' : '24px'}
                        color="#344054"
                      >
                        {`f${id}`}
                        <InfoIcon
                          className="info"
                          width={isMobile ? 10 : 16}
                          src={Info}
                          alt=""
                          data-tip
                          data-for="tooltip-balance"
                          filterColor={filterColor}
                        />
                        <ReactTooltip
                          id="tooltip-balance"
                          backgroundColor="black"
                          borderColor="black"
                          textColor="white"
                        >
                          <NewLabel
                            size={isMobile ? '10px' : '12px'}
                            height={isMobile ? '15px' : '18px'}
                            weight="600"
                            color="white"
                          >
                            This fToken represents your share in this farm.
                          </NewLabel>
                        </ReactTooltip>
                      </NewLabel>
                      <NewLabel
                        size={isMobile ? '10px' : '14px'}
                        height={isMobile ? '18px' : '24px'}
                        weight="700"
                        color="#00D26B"
                      >
                        {!connected ? (
                          0
                        ) : lpTokenBalance ? (
                          fromWei(
                            lpTokenBalance,
                            fAssetPool.lpTokenData.decimals,
                            POOL_BALANCES_DECIMALS,
                            true,
                          )
                        ) : (
                          <AnimatedDots />
                        )}
                      </NewLabel>
                    </FlexDiv>
                    <FlexDiv
                      justifyContent="space-between"
                      padding={isMobile ? '7px 11px' : '10px 15px'}
                    >
                      <NewLabel
                        size={isMobile ? '10px' : '14px'}
                        height={isMobile ? '18px' : '24px'}
                        weight="500"
                        color="#344054"
                        self="center"
                      >
                        Est. Value
                      </NewLabel>
                      <NewLabel
                        weight="500"
                        size={isMobile ? '10px' : '14px'}
                        height={isMobile ? '18px' : '24px'}
                        color="black"
                        self="center"
                      >
                        $
                        {!connected ? (
                          0
                        ) : lpTokenBalance ? (
                          formatNumber(
                            fromWei(
                              lpTokenBalance,
                              fAssetPool.lpTokenData.decimals,
                              POOL_BALANCES_DECIMALS,
                              true,
                            ) * usdPrice,
                            POOL_BALANCES_DECIMALS,
                          )
                        ) : (
                          <AnimatedDots />
                        )}
                      </NewLabel>
                    </FlexDiv>
                  </MyBalance>
                  <HalfContent
                    marginBottom={isMobile ? '24px' : '0px'}
                    partHeight={activeDepo ? partHeightDepo : partHeightWith}
                    borderRadius={isMobile ? '9px' : '12px'}
                  >
                    <DepositSection isShow={activeDepo}>
                      <DepositBase
                        selectToken={selectTokenDepo}
                        setSelectToken={setSelectTokenDepo}
                        deposit={depositStart}
                        setDeposit={setDepositStart}
                        finalStep={depositFinalStep}
                        balance={balanceDepo}
                        pickedToken={pickedTokenDepo}
                        inputAmount={inputAmountDepo}
                        setInputAmount={setInputAmountDepo}
                        token={token}
                        supTokenList={supTokenList}
                        switchMethod={switchDepoMethod}
                        tokenSymbol={id}
                      />
                      <DepositSelectToken
                        selectToken={selectTokenDepo}
                        setSelectToken={setSelectTokenDepo}
                        setPickedToken={setPickedTokenDepo}
                        setBalance={setBalanceDepo}
                        supTokenList={supTokenList}
                        supTokenNoBalanceList={supTokenNoBalanceList}
                        balanceList={balanceList}
                        defaultToken={defaultToken}
                        soonToSupList={soonToSupList}
                        setPartHeight={setPartHeightDepo}
                      />
                      <DepositStart
                        pickedToken={pickedTokenDepo}
                        deposit={depositStart}
                        setDeposit={setDepositStart}
                        finalStep={depositFinalStep}
                        setFinalStep={setDepositFinalStep}
                        inputAmount={inputAmountDepo}
                        token={token}
                        balanceList={balanceList}
                        useIFARM={useIFARM}
                        tokenSymbol={id}
                        setQuoteValue={setQuoteValueDepo}
                        fAssetPool={fAssetPool}
                        multipleAssets={multipleAssets}
                      />
                      <DepositResult
                        pickedToken={pickedTokenDepo}
                        finalStep={depositFinalStep}
                        setFinalStep={setDepositFinalStep}
                        setSelectToken={setSelectTokenDepo}
                        setDeposit={setDepositStart}
                        inputAmount={inputAmountDepo}
                        token={token}
                        tokenSymbol={id}
                        quoteValue={quoteValueDepo}
                        setQuoteValue={setQuoteValueDepo}
                      />
                    </DepositSection>
                    <WithdrawSection isShow={!activeDepo}>
                      <WithdrawBase
                        selectToken={selectTokenWith}
                        setSelectToken={setSelectTokenWith}
                        withdrawStart={withdrawStart}
                        setWithdrawStart={setWithdrawStart}
                        finalStep={withdrawFinalStep}
                        pickedToken={pickedTokenWith}
                        unstakeBalance={unstakeBalance}
                        setUnstakeBalance={setUnstakeBalance}
                        tokenSymbol={id}
                        fAssetPool={fAssetPool}
                        lpTokenBalance={lpTokenBalance}
                        token={token}
                        supTokenList={supTokenList}
                        switchMethod={switchDepoMethod}
                      />
                      <WithdrawSelectToken
                        selectToken={selectTokenWith}
                        setSelectToken={setSelectTokenWith}
                        setPickedToken={setPickedTokenWith}
                        supTokenList={supTokenList}
                        supTokenNoBalanceList={supTokenNoBalanceList}
                        balanceList={balanceList}
                        defaultToken={defaultToken}
                        soonToSupList={soonToSupList}
                        setPartHeight={setPartHeightWith}
                      />
                      <WithdrawStart
                        withdrawStart={withdrawStart}
                        setWithdrawStart={setWithdrawStart}
                        pickedToken={pickedTokenWith}
                        finalStep={withdrawFinalStep}
                        setFinalStep={setWithdrawFinalStep}
                        token={token}
                        unstakeBalance={unstakeBalance}
                        balanceList={balanceList}
                        tokenSymbol={id}
                        fAssetPool={fAssetPool}
                        multipleAssets={multipleAssets}
                        useIFARM={useIFARM}
                        setQuoteValue={setQuoteValueWith}
                      />
                      <WithdrawResult
                        pickedToken={pickedTokenWith}
                        finalStep={withdrawFinalStep}
                        setFinalStep={setWithdrawFinalStep}
                        setWithdraw={setWithdrawStart}
                        unstakeBalance={unstakeBalance}
                        token={token}
                        tokenSymbol={id}
                        quoteValue={quoteValueWith}
                      />
                    </WithdrawSection>
                  </HalfContent>
                  {isMobile ? (
                    loadData ? (
                      <PriceShareData
                        token={token}
                        vaultPool={vaultPool}
                        tokenSymbol={id}
                        setLoadData={setLoadData}
                      />
                    ) : (
                      <HalfInfo padding="25px 18px" marginBottom="23px">
                        <FarmDetailChart
                          token={token}
                          vaultPool={vaultPool}
                          lastTVL={Number(vaultValue)}
                          lastAPY={Number(totalApy)}
                        />
                      </HalfInfo>
                    )
                  ) : (
                    <></>
                  )}
                </FirstPartSection>
              ) : (
                <RestInternal>
                  {isMobile && (
                    <MyBalance marginBottom={isMobile ? '24px' : '0'}>
                      <NewLabel
                        size={isMobile ? '12px' : '14px'}
                        weight={isMobile ? '600' : '700'}
                        height={isMobile ? '18px' : '24px'}
                        color="#344054"
                        padding="10px 15px"
                        borderBottom="1px solid #EBEBEB"
                        display="flex"
                        justifyContent="space-between"
                      >
                        APY Breakdown
                        <APRValueShow>
                          <img src={DOT} alt="" />
                          {displayAPY(totalApy, DECIMAL_PRECISION, 10)}
                          &nbsp;APR
                        </APRValueShow>
                      </NewLabel>
                      <NewLabel padding={isMobile ? '0' : '10px 15px'}>
                        <div dangerouslySetInnerHTML={{ __html: rewardTxt }} />
                      </NewLabel>
                    </MyBalance>
                  )}
                  <MyBalance marginBottom={isMobile ? '24px' : '20px'}>
                    <NewLabel
                      size={isMobile ? '12px' : '14px'}
                      weight={isMobile ? '600' : '700'}
                      height={isMobile ? '18px' : '24px'}
                      color={isMobile ? 'black' : '#344054'}
                      padding={isMobile ? '7px 11px' : '10px 15px'}
                      borderBottom="1px solid #EBEBEB"
                    >
                      Overview
                    </NewLabel>
                    <FlexDiv
                      justifyContent="space-between"
                      padding={isMobile ? '7px 11px' : '10px 15px'}
                    >
                      <NewLabel
                        size={isMobile ? '10px' : '14px'}
                        weight="500"
                        height={isMobile ? '18px' : '24px'}
                        color="#344054"
                      >
                        APY
                      </NewLabel>
                      <NewLabel
                        size={isMobile ? '10px' : '14px'}
                        height={isMobile ? '18px' : '24px'}
                        weight="500"
                        color={isMobile ? '#15202B' : '#000'}
                      >
                        {showAPY()}
                      </NewLabel>
                    </FlexDiv>
                    <FlexDiv
                      justifyContent="space-between"
                      padding={isMobile ? '7px 11px' : '10px 15px'}
                    >
                      <NewLabel
                        size={isMobile ? '10px' : '14px'}
                        height={isMobile ? '18px' : '24px'}
                        weight="500"
                        color="#344054"
                      >
                        Daily APR
                      </NewLabel>
                      <NewLabel
                        weight="500"
                        size={isMobile ? '10px' : '14px'}
                        height={isMobile ? '18px' : '24px'}
                        color={isMobile ? '#15202B' : '#000'}
                      >
                        {showApyDaily()}
                      </NewLabel>
                    </FlexDiv>
                    <FlexDiv
                      justifyContent="space-between"
                      padding={isMobile ? '7px 11px' : '10px 15px'}
                    >
                      <NewLabel
                        size={isMobile ? '10px' : '14px'}
                        height={isMobile ? '18px' : '24px'}
                        weight="500"
                        color="#344054"
                      >
                        TVL
                      </NewLabel>
                      <NewLabel
                        weight="500"
                        size={isMobile ? '10px' : '14px'}
                        height={isMobile ? '18px' : '24px'}
                        color={isMobile ? '#15202B' : '#000'}
                      >
                        {showTVL()}
                      </NewLabel>
                    </FlexDiv>
                  </MyBalance>
                  {!isMobile && loadData && (
                    <MyBalance marginBottom={isMobile ? '24px' : '20px'}>
                      <NewLabel
                        size={isMobile ? '12px' : '14px'}
                        weight="700"
                        height={isMobile ? '18px' : '24px'}
                        color="#344054"
                        padding={isMobile ? '9px 13px' : '10px 15px'}
                        borderBottom="1px solid #EBEBEB"
                      >
                        APY Breakdown
                      </NewLabel>
                      <NewLabel padding={isMobile ? '9px 13px' : '0px 15px 10px'}>
                        <div dangerouslySetInnerHTML={{ __html: rewardTxt }} />
                      </NewLabel>
                    </MyBalance>
                  )}
                  <LastHarvestInfo>
                    <NewLabel
                      size={isMobile ? '12px' : '14px'}
                      weight={isMobile ? '600' : '700'}
                      height={isMobile ? '18px' : '24px'}
                      color={isMobile ? '#000' : '#344054'}
                      padding={isMobile ? '7px 11px' : '10px 15px'}
                      borderBottom="1px solid #EBEBEB"
                    >
                      Fees
                    </NewLabel>
                    <FlexDiv
                      justifyContent="space-between"
                      padding={isMobile ? '7px 11px' : '10px 15px'}
                    >
                      <NewLabel
                        size={isMobile ? '10px' : '14px'}
                        weight="500"
                        height={isMobile ? '18px' : '24px'}
                        color="#344054"
                      >
                        Deposit Fee
                      </NewLabel>
                      <NewLabel
                        size={isMobile ? '10px' : '14px'}
                        weight="500"
                        height={isMobile ? '18px' : '24px'}
                        color={isMobile ? '#15202B' : '#000'}
                      >
                        0%
                      </NewLabel>
                    </FlexDiv>
                    <FlexDiv
                      justifyContent="space-between"
                      padding={isMobile ? '7px 11px' : '10px 15px'}
                    >
                      <NewLabel
                        size={isMobile ? '10px' : '14px'}
                        weight="500"
                        height={isMobile ? '18px' : '24px'}
                        color="#344054"
                      >
                        Withdrawal Fee
                      </NewLabel>
                      <NewLabel
                        size={isMobile ? '10px' : '14px'}
                        weight="500"
                        height={isMobile ? '18px' : '24px'}
                        color={isMobile ? '#15202B' : '#000'}
                      >
                        0%
                      </NewLabel>
                    </FlexDiv>
                    <FlexDiv
                      justifyContent="space-between"
                      padding={isMobile ? '7px 11px' : '10px 15px'}
                    >
                      <NewLabel
                        size={isMobile ? '8px' : '13px'}
                        weight="300"
                        height="normal"
                        color="#15202b"
                      >
                        The APY shown already considers the performance fee taken only from
                        generated yield and not deposits.
                      </NewLabel>
                      <NewLabel display="flex" self="center">
                        <InfoIcon
                          className="info"
                          width={isMobile ? 10 : 16}
                          src={Info}
                          alt=""
                          data-tip
                          data-for="tooltip-last-harvest"
                          filterColor={filterColor}
                        />
                        <ReactTooltip
                          id="tooltip-last-harvest"
                          backgroundColor="black"
                          borderColor="black"
                          textColor="white"
                          place={isMobile ? 'left' : 'top'}
                        >
                          <NewLabel
                            weight="500"
                            size={isMobile ? '10px' : '13px'}
                            height={isMobile ? '12px' : '16px'}
                          >
                            <FlexDiv gap="15px" justifyContent="space-between">
                              <div>Harvest Treasury</div>
                              <div>{harvestTreasury}%</div>
                            </FlexDiv>
                            <FlexDiv gap="15px" justifyContent="space-between" marginTop="12px">
                              <div>Profit Sharing</div>
                              <div>{profitShare}%</div>
                            </FlexDiv>
                          </NewLabel>
                        </ReactTooltip>
                      </NewLabel>
                    </FlexDiv>
                  </LastHarvestInfo>
                  {isMobile && (
                    <>
                      {loadData && (
                        <HalfInfo padding="25px 18px" marginBottom="23px">
                          <FarmDetailChart
                            token={token}
                            vaultPool={vaultPool}
                            lastTVL={Number(vaultValue)}
                            lastAPY={Number(totalApy)}
                          />
                        </HalfInfo>
                      )}
                      <HalfInfo marginBottom="24px">
                        <NewLabel
                          weight={700}
                          size="12px"
                          height="18px"
                          padding="7px 11px"
                          color="#000"
                        >
                          Source of Yield
                        </NewLabel>
                        <DescInfo>{ReactHtmlParser(vaultPool.stakeAndDepositHelpMessage)}</DescInfo>
                      </HalfInfo>
                    </>
                  )}
                  <MyBalance>
                    <FlexDiv
                      justifyContent="space-between"
                      padding={isMobile ? '7px 11px' : '10px 15px'}
                    >
                      <NewLabel
                        size={isMobile ? '12px' : '14px'}
                        height={isMobile ? '18px' : '24px'}
                        weight="600"
                        color={isMobile ? '#000' : '#344054'}
                      >
                        Last Harvest
                      </NewLabel>
                      {isMobile ? (
                        <NewLabel size="10px" height="18px" weight="500" color="#15202B">
                          {lastHarvest !== '' ? `${lastHarvest} ago` : '-'}
                        </NewLabel>
                      ) : (
                        <NewLabel size="14px" height="24px" weight="500" color="#000">
                          {lastHarvest !== '' ? `${lastHarvest} ago` : '-'}
                        </NewLabel>
                      )}
                    </FlexDiv>
                  </MyBalance>
                </RestInternal>
              )}
            </RestContent>
          </InternalSection>
        </BigDiv>
      </Inner>
    </DetailView>
  )
}

export default BeginnersFarm
