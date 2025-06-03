import { get } from 'lodash'
import React from 'react'
import { useSetChain } from '@web3-onboard/react'
import { ACTIONS, SPECIAL_VAULTS } from '../../../constants'
import { useActions } from '../../../providers/Actions'
import { usePools } from '../../../providers/Pools'
import { useThemeContext } from '../../../providers/useThemeContext'
import { useVaults } from '../../../providers/Vault'
import { useWallet } from '../../../providers/Wallet'
import {
  hasAmountGreaterThanZero,
  hasRequirementsForInteraction,
  isSpecialApp,
} from '../../../utilities/formats'
import Button from '../../Button'
import {
  SelectedVault,
  SelectedVaultContainer,
  Monospace,
  Div,
  SelectedVaultLabel,
  BottomPart,
} from './style'
import { fromWei } from '../../../services/web3'
import AnimatedDots from '../../AnimatedDots'
import Counter from '../../Counter'

const { tokens } = require('../../../data')

const PoolFooterActions = ({
  vaultPool,
  token,
  totalTokensEarned,
  rewardTokenSymbols,
  isLoadingData,
  rewardsEarned,
  ratesPerDay,
  loadingBalances,
  setLoadingDots,
  setPendingAction,
  pendingAction,
  loaded,
  poolRewardSymbol,
}) => {
  const { fetchUserPoolStats, userStats } = usePools()
  const { account, getWalletBalances, connected, chainId } = useWallet()
  const { vaultsData } = useVaults()
  const { handleClaim } = useActions()
  const { borderColor } = useThemeContext()

  const [
    {
      connectedChain, // the current chain the user's wallet is connected to
    },
    setChain, // function to call to initiate user to switch chains in their wallet
  ] = useSetChain()

  const tokenChain = token.chain || token.data.chain
  const curChain = isSpecialApp
    ? chainId
    : connectedChain
      ? parseInt(connectedChain.id, 16).toString()
      : ''

  return (
    <SelectedVaultContainer
      $maxwidth="100%"
      $margin="0px"
      $padding="0px"
      $borderwidth="0px"
      $bordercolor={borderColor}
    >
      {vaultPool.id !== SPECIAL_VAULTS.NEW_PROFIT_SHARING_POOL_ID &&
        rewardTokenSymbols.map((symbol, symbolIdx) => {
          return (
            <div key={symbolIdx}>
              <SelectedVault key={`${symbol}-rewards-earned`}>
                <Div>
                  <img src={`/icons/${symbol.toLowerCase()}.svg`} alt="" />
                  {symbol}
                </Div>
                <Monospace>
                  {!connected ? (
                    '0.00'
                  ) : !isLoadingData &&
                    get(userStats, `[${get(vaultPool, 'id')}].rewardsEarned`) ? (
                    <Counter
                      pool={vaultPool}
                      totalTokensEarned={
                        rewardTokenSymbols.length > 1
                          ? fromWei(
                              get(rewardsEarned, symbol, 0),
                              get(tokens[symbol], 'decimals', 18),
                              get(tokens[symbol], 'decimals', 18),
                            )
                          : totalTokensEarned
                      }
                      totalStaked={get(userStats, `[${vaultPool.id}]['totalStaked']`, 0)}
                      ratePerDay={get(ratesPerDay, symbolIdx, ratesPerDay[0])}
                      rewardPerToken={get(
                        vaultPool,
                        `rewardPerToken[${symbolIdx}]`,
                        vaultPool.rewardPerToken[0],
                      )}
                      rewardTokenAddress={get(
                        vaultPool,
                        `rewardTokens[${symbolIdx}]`,
                        vaultPool.rewardTokens[0],
                      )}
                    />
                  ) : userStats.length === 0 ? (
                    <AnimatedDots />
                  ) : (
                    '0.00'
                  )}
                </Monospace>
              </SelectedVault>
              <BottomPart>
                <SelectedVaultLabel $fontweight="400" $lineheight="20px" $fontcolor="#475467">
                  Claim all rewards into your wallet.
                </SelectedVaultLabel>
                <Button
                  // $width="100%"
                  $size="md"
                  $fontcolor="advanced-reward"
                  onClick={async () => {
                    if (curChain !== tokenChain) {
                      const chainHex = `0x${Number(tokenChain).toString(16)}`
                      if (!isSpecialApp) await setChain({ chainId: chainHex })
                    } else {
                      handleClaim(account, vaultPool, setPendingAction, async () => {
                        await getWalletBalances([poolRewardSymbol])
                        setLoadingDots(false, true)
                        await fetchUserPoolStats([vaultPool], account, userStats)
                        setLoadingDots(false, false)
                      })
                    }
                  }}
                  disabled={
                    !hasRequirementsForInteraction(
                      loaded,
                      pendingAction,
                      vaultsData,
                      loadingBalances,
                    ) || !hasAmountGreaterThanZero(totalTokensEarned)
                  }
                >
                  {pendingAction === ACTIONS.CLAIM ? 'Processing...' : 'Claim All'}
                </Button>
              </BottomPart>
            </div>
          )
        })}
    </SelectedVaultContainer>
  )
}

export default PoolFooterActions
