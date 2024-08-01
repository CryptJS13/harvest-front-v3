import { get } from 'lodash'
import React from 'react'
import { DECIMAL_PRECISION } from '../../../../constants'
import { useVaults } from '../../../../providers/Vault'
import { displayAPY } from '../../../../utilities/formats'
import { getTotalApy } from '../../../../utilities/parsers'
import AnimatedDots from '../../../AnimatedDots'
import { RewardsContainer } from '../style'
import ARBITRUM from '../../../../assets/images/chains/arbitrum.svg'

const VaultApy = ({ token, tokenSymbol, vaultPool, isSpecialVault, fontColor1, boostedToken }) => {
  const { loadingVaults, vaultsData } = useVaults()
  const tokenVault = get(vaultsData, token.hodlVaultId || tokenSymbol)

  const totalApy = isSpecialVault
    ? getTotalApy(null, token, true)
    : getTotalApy(vaultPool, tokenVault)

  if (token.excludeVaultStats) {
    return 'N/A'
  }

  return isSpecialVault ? (
    token.data && (token.data.dataFetched === false || totalApy !== null) ? (
      <RewardsContainer fontColor1={fontColor1}>
        {token.inactive ? 'Inactive' : <>{totalApy ? displayAPY(totalApy) : null}</>}
      </RewardsContainer>
    ) : (
      <b>
        <AnimatedDots />
      </b>
    )
  ) : totalApy !== null && !loadingVaults ? (
    <RewardsContainer fontColor1={boostedToken ? '#FF7D10' : fontColor1}>
      {token.inactive || token.testInactive || token.hideTotalApy || !token.dataFetched ? (
        token.inactive || token.testInactive ? (
          'Inactive'
        ) : null
      ) : boostedToken ? (
        <div className="boost-apy">
          <>{displayAPY(totalApy, DECIMAL_PRECISION, 10)}</>
          <div className="boost-img">
            <img src={ARBITRUM} alt="" /> 🔥
          </div>
        </div>
      ) : (
        <>{displayAPY(totalApy, DECIMAL_PRECISION, 10)}</>
      )}
    </RewardsContainer>
  ) : (
    <b>
      <AnimatedDots />
    </b>
  )
}

export default VaultApy
