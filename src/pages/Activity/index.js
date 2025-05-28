import React, { useRef, useEffect, useMemo, useState } from 'react'
import useEffectWithPrevious from 'use-effect-with-previous'
import { find, isEmpty, isEqual } from 'lodash'
import { useMediaQuery } from 'react-responsive'
import 'react-loading-skeleton/dist/skeleton.css'
import EarningsHistory from '../../components/EarningsHistory/HistoryData'
import RewardsHistory from '../../components/RewardsHistory/RewardsData'
import { FARM_TOKEN_SYMBOL, IFARM_TOKEN_SYMBOL, SPECIAL_VAULTS, historyTags } from '../../constants'
import { addresses } from '../../data'
import { usePools } from '../../providers/Pools'
import { useStats } from '../../providers/Stats'
import { useThemeContext } from '../../providers/useThemeContext'
import { useVaults } from '../../providers/Vault'
import { useWallet } from '../../providers/Wallet'
import {
  checkIPORUserBalance,
  getAllRewardEntities,
  getUserBalanceVaults,
  initBalanceAndDetailData,
} from '../../utilities/apiCalls'
import {
  mergeArrays,
  totalHistoryDataKey,
  totalNetProfitKey,
  vaultProfitDataKey,
} from '../../utilities/parsers'
import { Container, Inner, HeaderWrap, HeaderTitle, NewLabel, SwitchTabTag } from './style'

const Activity = () => {
  const { connected, account, balances, getWalletBalances } = useWallet()
  const { userStats, totalPools } = usePools()
  const { profitShareAPY } = useStats()
  const { vaultsData } = useVaults()

  const {
    darkMode,
    bgColorNew,
    fontColor,
    fontColor1,
    fontColor3,
    fontColor4,
    activeColorNew,
    boxShadowColor2,
  } = useThemeContext()

  const isMobile = useMediaQuery({ query: '(max-width: 992px)' })

  const [onceRun, setOnceRun] = useState(false)
  const [safeFlag, setSafeFlag] = useState(true)
  const [noHarvestsData, setNoHarvestsData] = useState(false)
  const [noRewardsData, setNoRewardsData] = useState(false)
  const [activeHarvests, setActiveHarvests] = useState(true)
  const [, setTotalNetProfit] = useState(() => {
    return Number(localStorage.getItem(totalNetProfitKey) || '0')
  })
  const [, setVaultNetChangeList] = useState(() => {
    return JSON.parse(localStorage.getItem(vaultProfitDataKey) || '[]')
  })
  const [totalHistoryData, setTotalHistoryData] = useState(() => {
    return JSON.parse(localStorage.getItem(totalHistoryDataKey) || '[]')
  })

  const farmProfitSharingPool = totalPools.find(
    pool => pool.id === SPECIAL_VAULTS.NEW_PROFIT_SHARING_POOL_ID,
  )

  const poolVaults = useMemo(
    () => ({
      [FARM_TOKEN_SYMBOL]: {
        poolVault: true,
        profitShareAPY,
        data: farmProfitSharingPool,
        logoUrl: ['./icons/ifarm.svg'],
        tokenAddress: addresses.iFARM,
        rewardSymbol: 'iFarm',
        tokenNames: ['FARM'],
        platform: ['Harvest'],
        decimals: 18,
      },
    }),
    [farmProfitSharingPool, profitShareAPY],
  )

  const groupOfVaults = { ...vaultsData, ...poolVaults }

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
    const totalNetProfitValue = localStorage.getItem(totalNetProfitKey)

    if (
      Number(totalNetProfitValue) === 0 ||
      totalNetProfitValue === null ||
      Number(totalNetProfitValue) === -1
    ) {
      if (!isEmpty(userStats) && account && !onceRun) {
        setOnceRun(true)
        const getNetProfitValue = async () => {
          let totalNetProfitUSD = 0,
            combinedEnrichedData = [],
            cumulativeLifetimeYield = 0

          const { userBalanceVaults } = await getUserBalanceVaults(account)
          const stakedVaults = []
          const ul = userBalanceVaults.length
          for (let j = 0; j < ul; j += 1) {
            for (const key of Object.keys(groupOfVaults)) {
              const isSpecialVaultAll =
                groupOfVaults[key].liquidityPoolVault || groupOfVaults[key].poolVault
              const paramAddressAll = isSpecialVaultAll
                ? groupOfVaults[key].data.collateralAddress
                : groupOfVaults[key].vaultAddress || groupOfVaults[key].tokenAddress

              if (userBalanceVaults[j] === paramAddressAll.toLowerCase()) {
                stakedVaults.push(key)
              }

              const iporBalCheck = groupOfVaults[key].isIPORVault
                ? await checkIPORUserBalance(
                    account,
                    groupOfVaults[key]?.vaultAddress.toLowerCase(),
                    groupOfVaults[key]?.chain,
                  )
                : false

              if (iporBalCheck && !stakedVaults.includes(key)) {
                stakedVaults.push(key)
              }
            }
          }

          if (stakedVaults.length === 0) {
            setNoHarvestsData(true)
          }

          const vaultNetChanges = []
          const promises = stakedVaults.map(async stakedVault => {
            let symbol = '',
              fAssetPool = {},
              token = null

            if (stakedVault === IFARM_TOKEN_SYMBOL) {
              symbol = FARM_TOKEN_SYMBOL
            } else {
              symbol = stakedVault
            }

            fAssetPool =
              symbol === FARM_TOKEN_SYMBOL
                ? groupOfVaults[symbol].data
                : find(totalPools, pool => pool.id === symbol)

            if (symbol.includes('IPOR')) {
              token = groupOfVaults[symbol]
            } else {
              token = find(
                groupOfVaults,
                vault =>
                  vault.vaultAddress === fAssetPool?.collateralAddress ||
                  (vault.data && vault.data.collateralAddress === fAssetPool.collateralAddress),
              )
            }

            if (token) {
              const useIFARM = symbol === FARM_TOKEN_SYMBOL
              const isSpecialVault = token.liquidityPoolVault || token.poolVault
              const tokenName = token.poolVault ? 'FARM' : token.tokenNames.join(' - ')
              const tokenPlatform = token.platform.join(', ')
              const tokenChain = token.poolVault ? token.data.chain : token.chain
              const tokenSym = token.isIPORVault ? token.vaultSymbol : symbol
              if (isSpecialVault) {
                fAssetPool = token.data
              }

              const iporVFlag = token.isIPORVault ?? false
              const paramAddress = isSpecialVault
                ? token.data.collateralAddress
                : token.vaultAddress || token.tokenAddress
              const { sumNetChangeUsd, enrichedData, vaultHFlag } = await initBalanceAndDetailData(
                paramAddress,
                useIFARM ? token.data.chain : token.chain,
                account,
                token.decimals,
                iporVFlag,
                token.vaultDecimals,
              )

              setSafeFlag(vaultHFlag)

              vaultNetChanges.push({ id: symbol, sumNetChangeUsd })
              const enrichedDataWithSymbol = enrichedData.map(data => ({
                ...data,
                tokenSymbol: tokenSym,
                name: tokenName,
                platform: tokenPlatform,
                chain: tokenChain,
              }))
              combinedEnrichedData = combinedEnrichedData.concat(enrichedDataWithSymbol)
              totalNetProfitUSD += sumNetChangeUsd
            }
          })

          await Promise.all(promises)

          totalNetProfitUSD = totalNetProfitUSD === 0 ? -1 : totalNetProfitUSD
          setTotalNetProfit(totalNetProfitUSD)
          localStorage.setItem(totalNetProfitKey, totalNetProfitUSD.toString())

          setVaultNetChangeList(vaultNetChanges)
          localStorage.setItem(vaultProfitDataKey, JSON.stringify(vaultNetChanges))

          const { rewardsAPIData } = await getAllRewardEntities(account)

          if (rewardsAPIData.length !== 0) {
            combinedEnrichedData = mergeArrays(rewardsAPIData, combinedEnrichedData)
          } else {
            setNoRewardsData(true)
          }

          const combinedEnrichedArray = combinedEnrichedData
            .sort((a, b) => Number(a.timestamp) - Number(b.timestamp))
            .map(item => {
              if (item.event === 'Harvest') {
                cumulativeLifetimeYield += Number(item.netChangeUsd)
                return { ...item, lifetimeYield: cumulativeLifetimeYield.toString() }
              }
              if (item.event === 'Rewards') {
                cumulativeLifetimeYield += Number(item.rewardsUSD)
                return { ...item, lifetimeYield: cumulativeLifetimeYield.toString() }
              }
              return { ...item, lifetimeYield: cumulativeLifetimeYield.toString() }
            })

          const sortedCombinedEnrichedArray = combinedEnrichedArray.sort(
            (a, b) => Number(b.timestamp) - Number(a.timestamp),
          )
          setTotalHistoryData(sortedCombinedEnrichedArray)
          localStorage.setItem(totalHistoryDataKey, JSON.stringify(sortedCombinedEnrichedArray))
        }

        getNetProfitValue()
      } else {
        setTotalNetProfit(0)
        localStorage.setItem(totalNetProfitKey, '0')
        setVaultNetChangeList([])
        localStorage.setItem(vaultProfitDataKey, JSON.stringify([]))
        setTotalHistoryData([])
        localStorage.setItem(totalHistoryDataKey, JSON.stringify([]))
      }
    }
  }, [account, userStats, connected, safeFlag])

  return (
    <Container $bgcolor={bgColorNew} $fontcolor={fontColor}>
      <Inner>
        <HeaderWrap $padding="25px 15px 20px" $bordercolor="unset">
          <HeaderTitle $fontcolor={fontColor} $fontcolor1={fontColor1}>
            <div className="title">Full History</div>
            <div className="desc">
              History of all harvest, claimed rewards, and convert/revert events for connected
              wallet.
            </div>
          </HeaderTitle>
        </HeaderWrap>

        <NewLabel $width={isMobile ? '90%' : '40%'} $margin={isMobile ? 'auto' : 'unset'}>
          <NewLabel
            $backcolor={darkMode ? '#373737' : '#ebebeb'}
            $size={isMobile ? '16px' : '16px'}
            $height={isMobile ? '24px' : '24px'}
            $weight="600"
            $fontcolor={fontColor1}
            $display="flex"
            $justifycontent="center"
            $marginbottom="13px"
            $borderradius="8px"
            $transition="0.25s"
          >
            {historyTags.map((tag, i) => (
              <SwitchTabTag
                key={i}
                onClick={() => {
                  if ((i === 0 && !activeHarvests) || (i === 1 && activeHarvests))
                    setActiveHarvests(prev => !prev)
                }}
                $fontcolor={
                  (i === 0 && activeHarvests) || (i === 1 && !activeHarvests)
                    ? fontColor4
                    : fontColor3
                }
                $backcolor={
                  (i === 0 && activeHarvests) || (i === 1 && !activeHarvests) ? activeColorNew : ''
                }
                $boxshadow={
                  (i === 0 && activeHarvests) || (i === 1 && !activeHarvests) ? boxShadowColor2 : ''
                }
              >
                <p>{tag.name}</p>
              </SwitchTabTag>
            ))}
          </NewLabel>
        </NewLabel>

        {activeHarvests ? (
          <EarningsHistory historyData={totalHistoryData} isDashboard noData={noHarvestsData} />
        ) : (
          <RewardsHistory
            historyData={totalHistoryData}
            account={account}
            token={null}
            isDashboard
            noData={noRewardsData}
            setNoData={setNoRewardsData}
          />
        )}
      </Inner>
    </Container>
  )
}

export default Activity
