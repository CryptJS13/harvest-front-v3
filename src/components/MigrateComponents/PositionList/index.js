import React from 'react'
import { VaultBox, Content, InfoText, BadgeIcon, Token, ApyDownIcon, BadgeToken } from './style'
import ETHEREUM from '../../../assets/images/logos/badge/ethereum.svg'
import { formatNumber } from '../../../utilities/formats'

const PositionList = ({
  matchVault,
  currencySym,
  networkName,
  setShowPositionModal,
  setPositionVaultAddress,
  setHighestPosition,
  setIsFromModal,
  stopPropagation,
  darkMode,
  setId,
  setToken,
  groupOfVaults,
  currencyRate,
}) => {
  const vaultAddress = matchVault.token.vaultAddress
  const vaultName = matchVault.token.tokenNames
  const id = matchVault.token.id || matchVault.token.pool.id

  return (
    <VaultBox
      $borderbottom={darkMode ? '1px solid #1F242F' : '1px solid #ECECEC'}
      onClick={() => {
        setShowPositionModal(false)
        setHighestPosition(matchVault)
        setId(id.toString())
        setPositionVaultAddress(vaultAddress)
        setIsFromModal(true)
        setToken(groupOfVaults[id.toString()])
      }}
      $hoverbgcolor={darkMode ? '#1F242F' : '#e9f0f7'}
    >
      <Content $alignitems="start">
        <InfoText $fontsize="10px" $fontweight="500" $fontcolor="#5fCf76">
          {matchVault.balance >= 0.01
            ? `${currencySym}${formatNumber(matchVault.balance * currencyRate)}`
            : `<${currencySym}0.01`}
        </InfoText>
        <BadgeToken>
          <BadgeIcon>
            <img src={matchVault.chain ? matchVault.chain : ETHEREUM} alt="" />
          </BadgeIcon>
          <Token
            $fontcolor={darkMode ? '#ffffff' : '#414141'}
            href={`${window.location.origin}/${networkName}/${vaultAddress}`}
            onClick={stopPropagation}
          >
            {`${vaultName.join(', ')} (${matchVault.platform})`}
          </Token>
        </BadgeToken>
      </Content>
      <ApyDownIcon>
        <Content $alignitems="end">
          <InfoText $fontsize="10px" $fontweight="700" $fontcolor="#5fCf76">
            {`${matchVault.apy}% Live APY`}
          </InfoText>
          <InfoText $fontsize="10px" $fontweight="500" $fontcolor="#6988ff">
            {`$${formatNumber(matchVault.apy / 100)}/yr per $1 allocated`}
          </InfoText>
        </Content>
      </ApyDownIcon>
    </VaultBox>
  )
}

export default PositionList
