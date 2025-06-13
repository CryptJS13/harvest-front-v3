import BigNumber from 'bignumber.js'
import { get, isEmpty, size as arraySize } from 'lodash'
import { displayAPY } from './formats'
import { FARM_TOKEN_SYMBOL, UNIV3_POOL_ID_REGEX } from '../constants'

const getRewardSymbol = vaultPool => {
  switch (true) {
    case vaultPool && vaultPool.rewardTokenSymbols.length > 1:
      return vaultPool.rewardTokenSymbols
        .filter((_, symbolIdx) => Number(get(vaultPool, `rewardAPY[${symbolIdx}]`, 0)) !== 0)
        .join(', ')
    case vaultPool && vaultPool.rewardTokenSymbols.length === 1:
      return vaultPool.rewardTokenSymbols[0]
    default:
      return 'FARM'
  }
}

export const getAdvancedRewardText = (token, vaultPool, tradingApy, rewardApy) => {
  const components = []

  const isUniv3Vault = !!(vaultPool && new RegExp(UNIV3_POOL_ID_REGEX).test(vaultPool.id))

  const isHodlVault = !!token.hodlVaultId

  if (vaultPool && (isUniv3Vault || vaultPool.rewardTokenSymbols.length > 1)) {
    const rewardSymbols = !isUniv3Vault
      ? token.apyTokenSymbols
      : token.apyTokenSymbols.filter(symbol => symbol !== 'UNI')

    if (rewardSymbols && rewardSymbols.length) {
      rewardSymbols.forEach((symbol, i) => {
        if (get(token, `estimatedApyBreakdown[${i}]`)) {
          components.push(`
          <div class="detail-box">
            <div class="detail-box-main">
              <div class="detail-icon">
                ${token.apyIconUrls.map(
                  (item, index) =>
                    `<img src='${item
                      .slice(1, item.length)
                      .toLowerCase()}' key=${index} width=24 height=24 alt="" style='margin-left: ${
                      index !== 0 ? 0 : ''
                    }' />`,
                )}
              </div>
              <div class="detail-desc-auto">
                Auto harvested&nbsp;
                <span class="detail-token">
                ${
                  rewardSymbols.length > 1 && token.estimatedApyBreakdown.length === 1
                    ? rewardSymbols.join(' ')
                    : symbol
                }</span>
              </div>
            </div>
            <div class="detail-apy">
              ${
                new BigNumber(token.estimatedApyBreakdown[i]).gt(0)
                  ? `${displayAPY(token.estimatedApyBreakdown[i])}`
                  : `...`
              }
            </div>
          </div>`)
        }
      })
    }

    if (Number(rewardApy) > 0) {
      vaultPool.rewardTokenSymbols.forEach((symbol, symbolIdx) => {
        if (
          !!symbolIdx &&
          new BigNumber(get(vaultPool, `rewardAPY[${symbolIdx}]`, 0)).isGreaterThan(0)
        ) {
          components.push(`
          <div class='detail-box'>
            <div class="detail-box-main">
              <div class='detail-icon'>
                <img src='/icons/${symbol.toLowerCase()}.svg' width=24 height=24 alt="" />
              </div>
              <div class="detail-desc">
                ${symbol} rewards
              </div>
            </div>
            <div class="detail-apy">
              ${displayAPY(get(vaultPool, `rewardAPY[${symbolIdx}]`, 0))}
            </div>
          </div>`)

          if (Object.keys(get(vaultPool, 'vestingDescriptionOverride', [])).includes(symbol)) {
            components.push(vaultPool.vestingDescriptionOverride[symbol])
          }
        }
      })
    }

    if (isUniv3Vault && BigNumber(tradingApy).gt(0)) {
      components.push(`
      <div class='detail-box'>
        <div class="detail-box-main">
          <div class='detail-icon'>
            ${
              token.apyIconUrls
                ? token.apyIconUrls.map(
                    (url, i) =>
                      `<img style='${i !== 0 ? 'margin-left: -15px;' : ''}'
                  key=${url} width=24 height=24 src='${url.slice(1, url.length)}' />`,
                  )
                : null
            }
            ${
              !token.inactive && !isHodlVault && vaultPool.rewardTokenSymbols.length >= 2
                ? vaultPool.rewardTokenSymbols.map((symbol, symbolIdx) =>
                    symbolIdx !== 0 && symbolIdx < vaultPool.rewardTokens.length
                      ? `<img style='${symbolIdx !== 0 ? 'margin-left: -15px;' : ''}'
                  key=${symbol} width=24 height=24 style='margin-right: 10px;'
                  src='/icons/${symbol.toLowerCase()}.svg'
                />`
                      : null,
                  )
                : ''
            }
          </div>
          <div class="detail-token-no-width">Liquidity Provision</div>
        </div>
        <div class="detail-apy">
          ${new BigNumber(tradingApy).gt(0) ? `${displayAPY(tradingApy)}` : `0.00%`}
        </div>
      </div>`)
      // components.push(`
    } else if (Number(tradingApy) > 0) {
      components.push(`
      <div class="detail-box">
        <div class="detail-box-main">
          <div class="detail-icon">
            <img src='/icons/swapfee.svg' width=24 height=24 alt="" />
          </div>
          <div class="detail-desc-no-width">Liquidity Provision</div>
        </div>
        <div class="detail-apy">
          ${displayAPY(tradingApy)}
        </div>
      </div>`)
    }

    const tooltipText = `<div>${components
      .filter(c => !isEmpty(c))
      .map(c => `${c}`)
      .join('')}</div>`

    return tooltipText
  }
  if (vaultPool && vaultPool.id === 'fweth-farm') {
    components.push(`<b>${displayAPY(rewardApy)}:</b> <b>FARM</b> rewards`)
    if (Object.keys(get(vaultPool, 'vestingDescriptionOverride', [])).includes(FARM_TOKEN_SYMBOL)) {
      components.push(vaultPool.vestingDescriptionOverride[FARM_TOKEN_SYMBOL])
    }
    components.push(
      `<b>${displayAPY(token.estimatedApy)}</b>: Auto harvested <b>${token.apyTokenSymbols.join(
        ' ',
      )}</b>`,
    )

    const tooltipText = `<div>${components
      .filter(c => !isEmpty(c))
      .map(c => `${c}`)
      .join('<br />')}</div>`

    return tooltipText
  }

  if (!token.hideTokenApy) {
    if (Number(tradingApy) > 0) {
      components.push(`<div class="detail-box">
        <div class="detail-box-main">
          <div class="detail-icon"><img src='/icons/swapfee.svg' width=24 height=24 alt="" /></div>
          <div class="detail-desc-no-width">Liquidity Provision</div>
        </div>
        <div class="detail-apy">${displayAPY(tradingApy)}</div> 
      </div>`)
    }

    if (arraySize(token.apyTokenSymbols)) {
      if (token.apyOverride) {
        components.push(`<b>${token.apyOverride}</b>`)
      } else if (Number(token.estimatedApy) > 0) {
        let apyString = ''
        for (let i = 0; i < token.estimatedApyBreakdown.length; i += 1) {
          let icons, desc, symbols, apy
          if (token.estimatedApyBreakdown.length === 1) {
            icons = `${token.apyIconUrls.map(
              (url, j) => `<img key='${j}' width=24 height=24 src='${url.slice(1, url.length)}' />`,
            )}</div>`
            desc =
              token.apyDescriptionOverride && token.apyDescriptionOverride.length
                ? `<div class="detail-desc-auto">${token.apyDescriptionOverride[0]}&nbsp;`
                : `<div class="detail-desc-auto">Auto harvested&nbsp;`
            symbols = `<span class="detail-token">${token.apyTokenSymbols.join(
              ',  ',
            )}</span></div></div>`
            apy = `<div class="detail-apy">${displayAPY(token.estimatedApy)}</div></div>`
          } else {
            icons = `<img key='${i}' width=24 height=24 src='${token.apyIconUrls[i].slice(
              1,
              token.apyIconUrls[i].length,
            )}' /></div>`
            desc =
              token.apyDescriptionOverride && token.apyDescriptionOverride.length
                ? `<div class="detail-desc-auto">${token.apyDescriptionOverride[i]}&nbsp;`
                : `<div class="detail-desc-auto">Auto harvested&nbsp;`
            symbols = `<span class="detail-token">${token.apyTokenSymbols[i]}</span></div></div>`
            if (token.apyTokenSymbols[i] === 'SHIFT') {
              apy = `<div class="detail-apy">x1</div></div>`
            } else {
              apy = `<div class="detail-apy">${displayAPY(
                token.estimatedApyBreakdown[i],
              )}</div></div>`
            }
          }
          apyString = `
          <div class="detail-box">
            <div class="detail-box-main">
              <div class="detail-icon">`
          apyString += icons
          apyString += desc
          apyString += symbols
          apyString += apy
          components.push(apyString)
        }
      }
    }
  }

  if (!token.hideFarmApy && Number(rewardApy) > 0) {
    let apyString = `<div class="detail-box">
    <div class="detail-box-main">
      <div class="detail-icon"><img src='/icons/${getRewardSymbol(
        vaultPool,
      ).toLowerCase()}.svg' width=24 height=24 alt='' /></div>`
    apyString += `<div class="detail-desc">${getRewardSymbol(
      vaultPool,
    )} rewards</div></div><div class="detail-apy">${displayAPY(rewardApy)}</div>`

    components.push(apyString)
  }

  const tooltipText = `<div align="left">${components.join('')}</div>`

  return tooltipText
}
