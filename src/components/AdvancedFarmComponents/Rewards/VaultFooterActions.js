import { get } from 'lodash'
import React from 'react'
import { useSetChain } from '@web3-onboard/react'
import { Tooltip } from 'react-tooltip'
import { ACTIONS } from '../../../constants'
import { useActions } from '../../../providers/Actions'
import { usePools } from '../../../providers/Pools'
import { useThemeContext } from '../../../providers/useThemeContext'
import { useVaults } from '../../../providers/Vault'
import { useWallet } from '../../../providers/Wallet'
import { fromWei } from '../../../services/viem'
import {
  hasAmountGreaterThanZero,
  hasRequirementsForInteraction,
  isSpecialApp,
} from '../../../utilities/formats'
import AnimatedDots from '../../AnimatedDots'
import Button from '../../Button'
import Counter from '../../Counter'
import CounterUsdPrice from '../../CounterUsdPrice'
import {
  Div,
  SelectedVault,
  SelectedVaultContainer,
  Monospace,
  BottomPart,
  SelectedVaultLabel,
} from './style'

const { tokens } = require('../../../data')

const VaultFooterActions = ({
  vaultPool,
  totalTokensEarned,
  token,
  rewardTokenSymbols,
  rewardTokenPrices,
  isLoadingData,
  rewardsEarned,
  ratesPerDay,
  tokenSymbol,
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
  const { borderColor, fontColor, fontColor2, fontColor5 } = useThemeContext()

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
      {rewardTokenSymbols &&
        rewardTokenSymbols.map((symbol, symbolIdx) => {
          return (
            <SelectedVault key={`${symbol}-rewards-earned`}>
              <Div $fontcolor2={fontColor2}>
                <img
                  src={`/icons/${
                    symbol.toLowerCase() === 'mifarm' ? 'ifarm' : symbol.toLowerCase()
                  }.svg`}
                  alt=""
                />
                {symbol.toLowerCase() === 'mifarm' ? 'iFARM' : symbol}
              </Div>
              <Monospace $fontcolor5={fontColor5}>
                {!connected ? (
                  '0.00'
                ) : !isLoadingData && get(userStats, `[${get(vaultPool, 'id')}].rewardsEarned`) ? (
                  <>
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
                    <CounterUsdPrice
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
                      rewardTokenUsdPrice={rewardTokenPrices[symbolIdx]}
                    />
                  </>
                ) : userStats.length === 0 ? (
                  <AnimatedDots />
                ) : (
                  '0.00'
                )}
              </Monospace>
            </SelectedVault>
          )
        })}
      <Tooltip
        id={`claim-tooltip-${tokenSymbol}`}
        backgroundColor="black"
        borderColor="black"
        textColor="white"
        getContent={() =>
          token.hodlVaultId ? (
            <>
              <b>iFARM</b> and <b>fSUSHI</b> amount is claimed upon withdrawal only.
            </>
          ) : (
            <>
              Claims all non-compounded reward tokens.
              <br />
              All pending rewards are automatically claimed when withdrawing the full value of a
              position.
            </>
          )
        }
      />
      <BottomPart>
        <SelectedVaultLabel $fontweight="400" $lineheight="20px" $fontcolor={fontColor}>
          Claim all rewards into your wallet.
        </SelectedVaultLabel>
        <Button
          $fontcolor="advanced-reward"
          // $width="100%"
          $size="md"
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
            !hasRequirementsForInteraction(loaded, pendingAction, vaultsData, loadingBalances) ||
            !hasAmountGreaterThanZero(totalTokensEarned)
          }
        >
          {pendingAction === ACTIONS.CLAIM ? 'Processing...' : 'Claim All'}
        </Button>
      </BottomPart>
    </SelectedVaultContainer>
  )
}

export default VaultFooterActions
