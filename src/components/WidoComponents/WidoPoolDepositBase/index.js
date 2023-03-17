import React, { useState, useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import BigNumber from 'bignumber.js'
import ReactTooltip from 'react-tooltip'
import { get, isEmpty } from 'lodash'
import CoinGecko from 'coingecko-api'
import { useThemeContext } from '../../../providers/useThemeContext'
import Button from '../../Button'
import { useWallet } from '../../../providers/Wallet'
import { useVaults } from '../../../providers/Vault'
import { fromWei } from '../../../services/web3'
import AnimatedDots from '../../AnimatedDots'
import {
  FARM_TOKEN_SYMBOL,
  WIDO_BALANCES_DECIMALS,
  IFARM_TOKEN_SYMBOL,
  fromWEI,
} from '../../../constants'
import { formatNumberWido } from '../../../utils'
import {
  BaseWido,
  SelectToken,
  TokenAmount,
  TokenSelect,
  TokenInfo,
  BalanceInfo,
  PoweredByWido,
  TokenName,
  StakeInfo,
  TokenUSD,
  DepoTitle,
  Line,
  HelpImg,
  ThemeMode,
  SwitchMode,
  FarmInfo,
} from './style'
import WidoIcon from '../../../assets/images/logos/wido/wido.svg'
import DropDownIcon from '../../../assets/images/logos/wido/drop-down.svg'
import ChevronRightIcon from '../../../assets/images/logos/wido/chevron-right.svg'
import IFARMIcon from '../../../assets/images/logos/wido/ifarm.svg'
import FARMIcon from '../../../assets/images/logos/wido/farm.svg'
import HelpIcon from '../../../assets/images/logos/wido/help.svg'

const { tokens } = require('../../../data')

const CoinGeckoClient = new CoinGecko()

const getPrice = async () => {
  try {
    const data = await CoinGeckoClient.simple.price({
      ids: ['ifarm'],
      vs_currencies: ['usd'],
    })

    const result = data.success ? data.data.ifarm.usd : 1
    return result
  } catch (e) {
    return 0
  }
}

const WidoPoolDepositBase = ({
  selectTokenWido,
  setSelectTokenWido,
  startSlippage,
  depositWido,
  setDepositWido,
  finalStep,
  setFinalStep,
  balance,
  setBalance,
  usdValue,
  setUsdValue,
  pickedToken,
  setPickedToken,
  inputAmount,
  setInputAmount,
  token,
  fAssetPool,
  balanceList,
  totalStaked,
  lpTokenBalance,
  symbol,
  setSymbol,
  legacyStaking,
  setLegacyStaking,
}) => {
  const { account, connect, balances } = useWallet()
  const { vaultsData } = useVaults()
  const [farmInfo, setFarmInfo] = useState(null)
  const [price, setPrice] = useState(0)

  const FARMBalance = get(balances, FARM_TOKEN_SYMBOL, 0)

  const {
    backColor,
    borderColor,
    widoTagActiveFontColor,
    widoInputPanelBorderColor,
    widoInputBoxShadow,
    toggleActiveBackColor,
    toggleInactiveBackColor,
  } = useThemeContext()

  const [totalValue, setTotalValue] = useState(0)
  const [underlyingValue, setUnderlyingValue] = useState(0)

  useEffect(() => {
    const getPriceValue = async () => {
      const value = await getPrice()
      setPrice(value)
    }

    getPriceValue()
  }, [])

  useEffect(() => {
    const total =
      Number(
        fromWei(
          totalStaked,
          fAssetPool && fAssetPool.lpTokenData && fAssetPool.lpTokenData.decimals,
          WIDO_BALANCES_DECIMALS,
          true,
        ),
      ) +
      Number(
        fromWei(
          lpTokenBalance,
          fAssetPool && fAssetPool.lpTokenData && fAssetPool.lpTokenData.decimals,
          WIDO_BALANCES_DECIMALS,
          true,
        ),
      )
    setTotalValue(total)
  }, [totalStaked, lpTokenBalance, fAssetPool])

  const firstUnderlyingBalance = useRef(true)
  useEffect(() => {
    const hasZeroValue = underlyingValue === 0
    if (account && hasZeroValue && (firstUnderlyingBalance.current || !isEmpty(vaultsData))) {
      const getUnderlyingBalance = async () => {
        firstUnderlyingBalance.current = false
        const val = Number(
          fromWei(
            get(vaultsData, `${IFARM_TOKEN_SYMBOL}.underlyingBalanceWithInvestmentForHolder`, 0),
            tokens[IFARM_TOKEN_SYMBOL].decimals,
            WIDO_BALANCES_DECIMALS,
            true,
          ),
        )
        setUnderlyingValue(val)
      }

      getUnderlyingBalance()
    }
  }, [account, vaultsData, underlyingValue]) // eslint-disable-line react-hooks/exhaustive-deps

  const onClickDeposit = async () => {
    if (!legacyStaking && pickedToken.symbol === 'Select Token') {
      toast.error('Please select token to deposit!')
      return
    }
    if (new BigNumber(inputAmount).isGreaterThan(balance)) {
      toast.error('Please input sufficient balance!')
      return
    }
    if (new BigNumber(inputAmount).isEqualTo(0)) {
      toast.error('Please input balance to deposit!')
      return
    }
    // setStartSlippage(true)
    if (!legacyStaking) {
      setDepositWido(true)
    } else {
      setFinalStep(true)
    }
  }

  useEffect(() => {
    if (account) {
      if (legacyStaking) {
        const farmToken = balanceList.filter(bal => bal.symbol === FARM_TOKEN_SYMBOL)
        if (farmToken.length > 0) {
          setFarmInfo(farmToken[0])
          setBalance(fromWEI(farmToken[0].balance, farmToken[0].decimals))
          setPickedToken(farmToken[0])
        }
      }
    }
  }, [legacyStaking, balanceList, vaultsData]) // eslint-disable-line react-hooks/exhaustive-deps

  const onInputBalance = e => {
    setInputAmount(e.currentTarget.value)
    setUsdValue(
      formatNumberWido(
        e.currentTarget.value * (legacyStaking ? farmInfo.usdPrice : pickedToken.usdPrice || 1),
        WIDO_BALANCES_DECIMALS,
      ),
    )
  }

  const switchLegacyStaking = () => {
    setLegacyStaking(!legacyStaking)
    setSymbol(legacyStaking ? 'iFARM' : FARM_TOKEN_SYMBOL)
    setPickedToken({ symbol: 'Select Token' })
    setInputAmount(0)
    setUsdValue(0)
    setBalance(0)
  }

  return (
    <BaseWido show={!depositWido && !selectTokenWido && !startSlippage && !finalStep}>
      <DepoTitle fontColor={widoTagActiveFontColor}>I want to deposit</DepoTitle>
      <SelectToken
        backColor={backColor}
        borderColor={widoInputPanelBorderColor}
        shadow={widoInputBoxShadow}
      >
        <TokenInfo>
          <div>
            <TokenAmount
              type="number"
              value={inputAmount}
              borderColor={borderColor}
              backColor={backColor}
              fontColor={widoTagActiveFontColor}
              onChange={onInputBalance}
            />
            <TokenUSD>${usdValue}</TokenUSD>
          </div>

          {!legacyStaking ? (
            <TokenSelect
              type="button"
              onClick={async () => {
                setSelectTokenWido(true)
                if (!account) {
                  await connect()
                }
              }}
              fontColor={widoTagActiveFontColor}
              borderColor={borderColor}
            >
              {pickedToken.logoURI ? (
                <img className="logo" src={pickedToken.logoURI} width={24} height={24} alt="" />
              ) : (
                <></>
              )}
              <span>{pickedToken.symbol}</span>
              <img src={DropDownIcon} alt="" />
            </TokenSelect>
          ) : (
            <FarmInfo>
              <img src={FARMIcon} height="29" width="29" alt="" />
              <span>FARM</span>
            </FarmInfo>
          )}
        </TokenInfo>
      </SelectToken>
      <BalanceInfo
        fontColor={widoTagActiveFontColor}
        onClick={() => {
          if (account) {
            const balanceAmount = !legacyStaking
              ? balance
              : FARMBalance && fromWEI(FARMBalance, tokens[IFARM_TOKEN_SYMBOL].decimals)
            setInputAmount(balanceAmount)

            setUsdValue(
              formatNumberWido(
                balanceAmount * (legacyStaking ? farmInfo.usdPrice : pickedToken.usdPrice || 1),
                WIDO_BALANCES_DECIMALS,
              ),
            )
          }
        }}
      >
        Balance:
        <span>
          {!legacyStaking
            ? balance
            : FARMBalance && `${fromWEI(FARMBalance, tokens[IFARM_TOKEN_SYMBOL].decimals)} FARM`}
        </span>
      </BalanceInfo>
      <SwitchMode fontColor={widoTagActiveFontColor}>
        <ThemeMode
          mode={legacyStaking ? 'true' : 'false'}
          activeBackColor={toggleActiveBackColor}
          inactiveBackColor={toggleInactiveBackColor}
          borderColor={borderColor}
        >
          <div id="theme-switch">
            <div className="switch-track">
              <div className="switch-thumb" />
            </div>

            <input
              type="checkbox"
              checked={legacyStaking}
              onChange={switchLegacyStaking}
              aria-label="Switch between dark and light mode"
            />
          </div>
        </ThemeMode>
        Legacy Staking
      </SwitchMode>
      <Button
        color="wido-deposit"
        width="100%"
        size="md"
        onClick={() => {
          onClickDeposit()
        }}
      >
        Deposit
        <img src={ChevronRightIcon} alt="" />
      </Button>

      {!legacyStaking ? (
        <PoweredByWido>
          <div>Powered By</div>
          <img src={WidoIcon} alt="" />
          <span>wido</span>
        </PoweredByWido>
      ) : (
        <></>
      )}

      <Line height="1px" backColor="#EAECF0" />

      <div>
        <TokenName>
          <img src={legacyStaking ? FARMIcon : IFARMIcon} width={20} height={20} alt="" />
          {symbol}
        </TokenName>
        <StakeInfo>
          {legacyStaking ? 'Unstaked' : 'Balance'}
          <span>
            {!legacyStaking ? (
              !account ? (
                ''
              ) : (
                formatNumberWido(
                  fromWei(
                    get(balances, IFARM_TOKEN_SYMBOL, 0),
                    tokens[IFARM_TOKEN_SYMBOL].decimals,
                    WIDO_BALANCES_DECIMALS,
                  ),
                  WIDO_BALANCES_DECIMALS,
                )
              )
            ) : !account ? (
              ''
            ) : lpTokenBalance ? (
              fromWei(
                lpTokenBalance,
                tokens[IFARM_TOKEN_SYMBOL].decimals,
                WIDO_BALANCES_DECIMALS,
                true,
              )
            ) : (
              <AnimatedDots />
            )}
          </span>
        </StakeInfo>
        {!legacyStaking && (
          <ReactTooltip
            id="help-underlyingbalance"
            backgroundColor="#fffce6"
            borderColor="black"
            border
            textColor="black"
            effect="solid"
            delayHide={50}
            clickable
          >
            Your iFARM earnings denominated in underlying FARM
          </ReactTooltip>
        )}
        <StakeInfo>
          {legacyStaking ? (
            'Staked'
          ) : (
            <div>
              Underlying Balance
              <HelpImg data-tip data-for="help-underlyingbalance" src={HelpIcon} alt="" />
            </div>
          )}
          <span>
            {legacyStaking ? (
              !account ? (
                ''
              ) : totalStaked ? (
                fromWei(
                  totalStaked,
                  tokens[FARM_TOKEN_SYMBOL].decimals,
                  WIDO_BALANCES_DECIMALS,
                  true,
                )
              ) : (
                <AnimatedDots />
              )
            ) : !account ? (
              ''
            ) : isEmpty(vaultsData) ? (
              <AnimatedDots />
            ) : (
              underlyingValue
            )}
          </span>
        </StakeInfo>
      </div>

      <Line height="1px" backColor="#EAECF0" />

      <div>
        <StakeInfo>
          Current Price
          <span>
            {legacyStaking ? (
              !account ? (
                ''
              ) : token.data.lpTokenData ? (
                `$${token.data.lpTokenData.price}`
              ) : (
                <AnimatedDots />
              )
            ) : !account ? (
              ''
            ) : price ? (
              `$${price}`
            ) : (
              <AnimatedDots />
            )}
          </span>
        </StakeInfo>
        {legacyStaking && (
          <ReactTooltip
            id="help-img"
            backgroundColor="#fffce6"
            borderColor="black"
            border
            textColor="black"
            effect="solid"
            delayHide={50}
            clickable
          >
            Total value of your Unstaked & Staked FARM
          </ReactTooltip>
        )}
        <StakeInfo>
          <div>
            Total Value
            {legacyStaking && <HelpImg data-tip data-for="help-img" src={HelpIcon} alt="" />}
          </div>
          <span>
            {legacyStaking ? (
              !account ? (
                ''
              ) : totalValue ? (
                `$${formatNumberWido(
                  totalValue * token.data.lpTokenData.price,
                  WIDO_BALANCES_DECIMALS,
                )}`
              ) : (
                <AnimatedDots />
              )
            ) : !account ? (
              ''
            ) : get(balances, IFARM_TOKEN_SYMBOL, 0) && token.data.lpTokenData ? (
              `$${formatNumberWido(
                fromWei(
                  get(balances, IFARM_TOKEN_SYMBOL, 0),
                  tokens[IFARM_TOKEN_SYMBOL].decimals,
                  WIDO_BALANCES_DECIMALS,
                ) * price,
                WIDO_BALANCES_DECIMALS,
              )}`
            ) : (
              <AnimatedDots />
            )}
          </span>
        </StakeInfo>
      </div>
    </BaseWido>
  )
}
export default WidoPoolDepositBase
