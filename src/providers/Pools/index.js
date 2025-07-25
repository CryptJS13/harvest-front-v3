import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import axios from 'axios'
import isEqual from 'fast-deep-equal/react'
import { filter, get, map, sumBy } from 'lodash'
import { forEach } from 'promised-loops'
import { useInterval } from 'react-interval-hook'
import { toast } from 'react-toastify'
import useEffectWithPrevious from 'use-effect-with-previous'
import { POLL_POOL_DATA_INTERVAL_MS, POOLS_API_ENDPOINT, SPECIAL_VAULTS } from '../../constants'
import { CHAIN_IDS } from '../../data/constants'
import {
  getViem,
  // ledgerWeb3,
  newContractInstance,
  safeProvider,
} from '../../services/viem'
import poolContractData from '../../services/viem/contracts/pool/contract.json'
import tokenContract from '../../services/viem/contracts/token/contract.json'
import tokenMethods from '../../services/viem/contracts/token/methods'
import {
  // isLedgerLive,
  isSafeApp,
  isSpecialApp,
  truncateNumberString,
} from '../../utilities/formats'
import { useContracts } from '../Contracts'
import { useWallet } from '../Wallet'
import { getLpTokenData, getUserStats, pollUpdatedUserStats } from './utils'

const { pools: defaultPools } = require('../../data')

const PoolsContext = createContext()
const usePools = () => useContext(PoolsContext)

const farm = '0xa0246c9032bc3a600820415ae600c6388619a14d'
const ifarm = '0x1571ed0bed4d987fe2b498ddbae7dfa19519f651'

const getReader = (selectedChain, contracts) => {
  switch (String(selectedChain)) {
    case CHAIN_IDS.ARBITRUM_ONE:
      return contracts.readerArbitrum
    case CHAIN_IDS.BASE:
      return contracts.readerBase
    case CHAIN_IDS.POLYGON_MAINNET:
      return contracts.readerMatic
    case CHAIN_IDS.ZKSYNC:
      return contracts.readerZksync
    default:
      return contracts.readerEth
  }
}

const PoolsProvider = _ref => {
  const { children } = _ref
  const { account, selChain, chainId, viem, balances: walletBalances, logout } = useWallet()
  const { contracts } = useContracts()
  const [pools, setPools] = useState(defaultPools)
  const [totalPools, setTotalPools] = useState(defaultPools)
  const [userStats, setUserStats] = useState([])
  const [vaultLoading, setVaultLoading] = useState(true)
  const [loadingUserPoolStats, setLoadingUserPoolStats] = useState(false)
  const [disableWallet, setDisableWallet] = useState(true)
  const loadedUserPoolsViemProvider = useRef(false)
  const loadedInitialStakedAndUnstakedBalances = useRef(false)
  const loadedPools = useMemo(
    () =>
      filter(pools, pool =>
        isSpecialApp ? pool.chain === chainId : selChain.includes(pool.chain),
      ),
    [selChain, pools, chainId],
  )
  const [finishPool, setFinishPool] = useState(false) // set true when getPoolsData success
  const formatPoolsData = useCallback(
    async apiData => {
      let curChain = chainId,
        selectedAccount = account,
        formattedPools
      try {
        // if (isLedgerLive()) {
        //   const selectedChain = await ledgerWeb3.eth.net.getId()
        //   curChain = selectedChain.toString()
        // }
        if (isSafeApp()) {
          const safeAppProvider = await safeProvider()
          const selectedChain = await safeAppProvider.getNetwork()
          curChain = selectedChain.chainId.toString()
          const accountAdrs = await safeAppProvider.getSigner().getAddress()
          selectedAccount = accountAdrs.toLowerCase()
        }
      } catch (e) {
        console.log(e)
      }
      formattedPools = await Promise.all(
        defaultPools.map(async pool => {
          let viemClient = await getViem(pool.chain, selectedAccount, viem),
            viemClientLocal = await getViem(pool.chain, true, viem),
            rewardAPY = ['0'],
            rewardAPR = ['0'],
            autoStakeContractInstance = null,
            autoStakeContractLocalInstance = null,
            lpTokenData,
            rewardPerToken = ['0'],
            totalSupply = '0',
            finishTime = '0',
            totalValueLocked = '0',
            tradingApy = '0',
            boostedRewardAPY = '0',
            lpTokenInstance = null,
            lpTokenLocalInstance = null,
            amountToStakeForBoost = null,
            dataFetched = null
          if (isSafeApp()) {
            viemClient = await getViem(pool.chain, selectedAccount)
            viemClientLocal = await getViem(pool.chain, selectedAccount)
          }
          if (
            (Object.values(SPECIAL_VAULTS).includes(pool.id) &&
              curChain !== CHAIN_IDS.ETH_MAINNET) ||
            pool.chain !== curChain
          ) {
            viemClient = await getViem(pool.chain, false)
          }

          const contractInstance = await newContractInstance(
            null,
            pool.contractAddress,
            poolContractData.abi,
            viemClient,
          )
          const contractLocalInstance = await newContractInstance(
            null,
            pool.contractAddress,
            poolContractData.abi,
            viemClientLocal,
          )
          const apiPool =
            apiData && apiData.find(fetchedPool => fetchedPool && fetchedPool.id === pool.id)

          if (apiPool) {
            rewardAPY = map(apiPool.rewardAPY, apy => truncateNumberString(apy))
            rewardAPR = map(apiPool.rewardAPR, apr => truncateNumberString(apr))
            tradingApy = truncateNumberString(apiPool.tradingApy)
            lpTokenData = apiPool.lpTokenData
            rewardPerToken = apiPool.rewardPerToken
            totalSupply = apiPool.totalSupply
            finishTime = apiPool.finishTime
            totalValueLocked = apiPool.totalValueLocked
            boostedRewardAPY = apiPool.boostedRewardAPY
            amountToStakeForBoost = apiPool.amountToStakeForBoost
            lpTokenInstance = await newContractInstance(
              null,
              apiPool.lpTokenData.address,
              tokenContract.abi,
              viemClient,
            )
            lpTokenLocalInstance = await newContractInstance(
              null,
              apiPool.lpTokenData.address,
              tokenContract.abi,
              viemClientLocal,
            )
            dataFetched = true
          } else if (!pool.breadPage && !pool.fake) {
            lpTokenData = await getLpTokenData(contractInstance, viemClient)
            lpTokenInstance = await newContractInstance(
              null,
              lpTokenData.address,
              tokenContract.abi,
              viemClient,
            )
            lpTokenLocalInstance = await newContractInstance(
              null,
              lpTokenData.address,
              tokenContract.abi,
              viemClientLocal,
            )
            dataFetched = false
          }

          if (pool.autoStakePoolAddress) {
            autoStakeContractInstance = await newContractInstance(
              null,
              pool.autoStakePoolAddress,
              poolContractData.abi,
              viemClient,
            )
            autoStakeContractLocalInstance = await newContractInstance(
              null,
              pool.autoStakePoolAddress,
              poolContractData.abi,
              viemClientLocal,
            )
          }

          return {
            ...pool,
            rewardAPY,
            amountToStakeForBoost,
            totalRewardAPY: sumBy(rewardAPY, apy => Number(apy)),
            rewardAPR,
            tradingApy,
            contractInstance,
            contractLocalInstance,
            autoStakeContractInstance,
            autoStakeContractLocalInstance,
            lpTokenData: {
              ...lpTokenData,
              instance: lpTokenInstance,
              localInstance: lpTokenLocalInstance,
            },
            rewardPerToken,
            totalSupply,
            finishTime,
            totalValueLocked,
            loaded: true,
            boostedRewardAPY,
            dataFetched,
          }
        }),
      )
      formattedPools = formattedPools.filter(pool => pool !== null)
      loadedUserPoolsViemProvider.current = true

      return formattedPools
    },
    [account, chainId, viem],
  )
  const getPoolsData = useCallback(async () => {
    let newPools = []

    try {
      const apiResponse = await axios.get(POOLS_API_ENDPOINT)
      const apiData = get(apiResponse, 'data')
      newPools = await formatPoolsData([
        ...apiData.eth,
        ...apiData.matic,
        ...apiData.arbitrum,
        ...apiData.base,
        ...apiData.zksync,
      ])
      setDisableWallet(false)
    } catch (err) {
      console.error(err)

      if (!toast.isActive('pool-api-error')) {
        toast.error(
          'FARM APYs are temporarily unavailable. Also, please check your internet connection',
          {
            toastId: 'pool-api-error',
          },
        )
      }

      newPools = await formatPoolsData()
    }

    setPools(newPools)
    setTotalPools(newPools)
    setFinishPool(true)
  }, [formatPoolsData])

  useEffect(() => {
    if (logout) {
      setUserStats([])
    }
  }, [logout])

  useEffectWithPrevious(
    _ref2 => {
      const [prevAccount, prevChainId] = _ref2

      if (
        (account !== prevAccount || prevChainId !== chainId) &&
        account &&
        // !loadedUserPoolsViemProvider.current &&
        finishPool &&
        !isSpecialApp
      ) {
        const setCurrentPoolsWithUserProvider = async () => {
          const poolsWithUpdatedProvider = await formatPoolsData(pools)
          setPools(poolsWithUpdatedProvider)
        }

        setCurrentPoolsWithUserProvider()
      } else if (
        account !== prevAccount &&
        account &&
        !loadedUserPoolsViemProvider.current &&
        finishPool &&
        isSpecialApp
      ) {
        const udpatePoolsData = async () => {
          await getPoolsData()
        }
        udpatePoolsData()
      }
    },
    [account, chainId, pools],
  )
  useEffectWithPrevious(
    _ref3 => {
      const [prevChainId, prevAccount] = _ref3
      const hasSwitchedChain = chainId !== prevChainId
      const hasSwitchedAccount = account !== prevAccount && account
      if (
        (hasSwitchedChain ||
          hasSwitchedAccount ||
          !loadedInitialStakedAndUnstakedBalances.current) &&
        loadedUserPoolsViemProvider.current &&
        account
      ) {
        const loadInitialStakedAndUnstakedBalances = async () => {
          loadedInitialStakedAndUnstakedBalances.current = true
          const stats = {}
          const chains = isSpecialApp ? [chainId] : selChain

          const cl = chains.length
          for (let i = 0; i < cl; i += 1) {
            const ch = chains[i]
            const readerType = getReader(ch, contracts)
            const poolAddresses = []
            const vaultAddresses = []
            const chLoadedPools = []
            loadedPools.forEach(pool => {
              if (pool.chain === ch) {
                poolAddresses.push(pool.contractAddress)
                chLoadedPools.push(pool)
              }

              if (!Object.values(SPECIAL_VAULTS).includes(pool.id) && pool.chain === ch) {
                if (pool.lpTokenData.address.toLowerCase() === farm.toLowerCase()) {
                  vaultAddresses.push(ifarm)
                } else {
                  vaultAddresses.push(pool.lpTokenData.address)
                }
              }
            })

            for (const vaultId of Object.keys(contracts.iporVaults)) {
              if (contracts.iporVaults[vaultId].chain === ch) {
                vaultAddresses.push(contracts.iporVaults[vaultId].address)
                poolAddresses.push('0x0000000000000000000000000000000000000000') //For IPOR vaults, we don't have a pool address
                chLoadedPools.push({
                  id: vaultId,
                  lpTokenData: {
                    address: contracts.iporVaults[vaultId].address,
                  },
                })
              }
            }

            const readerInstance = readerType.instance
            const readerMethods = readerType.methods
            const balances = await readerMethods.getAllInformation(
              account,
              vaultAddresses,
              poolAddresses,
              readerInstance,
            )
            await forEach(chLoadedPools, async (pool, index) => {
              let lpTokenBalance
              const isSpecialVault = pool.id == 'profit-sharing-farm'

              if (isSpecialVault) {
                pool.id = 'IFARM'

                const instance = await newContractInstance(
                  pool.id,
                  null,
                  null,
                  await getViem(ch, false),
                )

                lpTokenBalance = !walletBalances[pool.id]
                  ? await tokenMethods.getBalance(account, instance)
                  : walletBalances[pool.id]
              } else {
                const lpTokenBalanceIdx = vaultAddresses.findIndex(
                  address => address === pool.lpTokenData.address,
                )
                lpTokenBalance = balances[0][lpTokenBalanceIdx]
              }

              stats[pool.id] = {
                lpTokenBalance,
                totalStaked: balances[1][index],
              }
            })
          }

          setUserStats(currStats => ({ ...currStats, ...stats }))
        }

        loadInitialStakedAndUnstakedBalances()
      }
    },
    [chainId, account, loadedPools, contracts, walletBalances],
  )
  useInterval(() => getPoolsData(), POLL_POOL_DATA_INTERVAL_MS, {
    immediate: true,
  })

  const fetchUserPoolStats = useCallback(
    async function (selectedPools, selectedAccount, currentStats) {
      if (currentStats === void 0) {
        currentStats = []
      }

      const stats = {}

      if (loadedUserPoolsViemProvider.current) {
        setLoadingUserPoolStats(true)
        const poolsByChain = {}
        selectedPools.forEach(pool => {
          if (!pool) return

          if (typeof pool === 'string') {
            pool = {
              id: pool,
              lpTokenData: {
                address: contracts.iporVaults[pool]?.address,
              },
              contractAddress: '0x0000000000000000000000000000000000000000', //For IPOR vaults, we don't have a pool address
              chain: contracts.iporVaults[pool]?.chain,
            }
          }
          const chainId = pool.chain
          if (!poolsByChain[chainId]) {
            poolsByChain[chainId] = []
          }
          poolsByChain[chainId].push(pool)
        })

        for (const chainId in poolsByChain) {
          const chainPools = poolsByChain[chainId]

          await Promise.all(
            chainPools.map(async pool => {
              await processSinglePool(pool, selectedAccount, stats)
            }),
          )
        }

        setUserStats(currStats => ({ ...currStats, ...stats }))
        setLoadingUserPoolStats(false)
      }

      return stats

      async function processSinglePool(pool, selectedAccount, stats) {
        if (!pool) return

        const viemClient = await getViem(pool.chain, false)
        const contractInstance = await newContractInstance(
          null,
          pool.contractAddress,
          poolContractData.abi,
          viemClient,
        )
        const autoStakeContractInstance = await newContractInstance(
          null,
          pool.autoStakePoolAddress,
          poolContractData.abi,
          viemClient,
        )
        const tokenInstance = await newContractInstance(
          null,
          pool.lpTokenData.address,
          poolContractData.abi,
          viemClient,
        )

        const fetchedStats = await getUserStats(
          contractInstance,
          tokenInstance,
          pool.contractAddress,
          pool.autoStakePoolAddress,
          selectedAccount,
          autoStakeContractInstance,
        )

        if (!isEqual(fetchedStats, currentStats[pool.id])) {
          stats[pool.id] = fetchedStats
        } else {
          await pollUpdatedUserStats(
            getUserStats(
              contractInstance,
              tokenInstance,
              pool.contractAddress,
              pool.autoStakePoolAddress,
              selectedAccount,
              autoStakeContractInstance,
            ),
            currentStats,
            () => {
              console.error(`Something went wrong during the fetching of ${pool.id} user stats`)
            },
            updatedStats => {
              stats[pool.id] = updatedStats
            },
          )
        }
      }
    },
    [contracts, getReader],
  )
  return React.createElement(
    PoolsContext.Provider,
    {
      value: {
        pools: loadedPools,
        allPools: pools,
        fetchUserPoolStats,
        userStats,
        loadedUserPoolsViemProvider: loadedUserPoolsViemProvider.current,
        loadingUserPoolStats,
        vaultLoading,
        setVaultLoading,
        disableWallet,
        totalPools,
      },
    },
    children,
  )
}

export { PoolsProvider, usePools }
