import BigNumber from 'bignumber.js'
import React, { useEffect, useState } from 'react'
import { useSetChain } from '@web3-onboard/react'
import { round } from 'lodash'
import { useMediaQuery } from 'react-responsive'
import { toast } from 'react-toastify'
import { Tooltip } from 'react-tooltip'
import { PiQuestion } from 'react-icons/pi'
import { BsArrowDown, BsArrowUp } from 'react-icons/bs'
import DropDownIcon from '../../../../assets/images/logos/advancedfarm/drop-down.svg'
import InfoIcon from '../../../../assets/images/logos/beginners/info-circle.svg'
import ThumbUpIcon from '../../../../assets/images/logos/thumb-up.svg'
import CloseIcon from '../../../../assets/images/logos/beginners/close.svg'
import { useThemeContext } from '../../../../providers/useThemeContext'
import { useWallet } from '../../../../providers/Wallet'
import { useRate } from '../../../../providers/Rate'
import { fromWei, toWei, checkNativeToken } from '../../../../services/viem'
import { isSpecialApp, showTokenBalance } from '../../../../utilities/formats'
import Button from '../../../Button'
import AnimatedDots from '../../../AnimatedDots'
import {
  BalanceInfo,
  BaseWidoDiv,
  DepoTitle,
  TokenInput,
  TokenAmount,
  TokenUSDAmount,
  TokenInfo,
  TokenSelect,
  NewLabel,
  AmountSection,
  InsufficientSection,
  HasErrorSection,
  FlexDiv,
  CloseBtn,
  DepositTokenSection,
  SwitchTabTag,
  ThumbUp,
} from './style'
import { usePortals } from '../../../../providers/Portals'
import { getChainName } from '../../../../utilities/parsers'

const DepositBase = ({
  setSelectToken,
  deposit,
  setDeposit,
  balance,
  pickedToken,
  defaultToken,
  inputAmount,
  pricePerFullShare,
  setInputAmount,
  token,
  switchMethod,
  tokenSymbol,
  setFromInfoAmount,
  setFromInfoUsdAmount,
  fromInfoUsdAmount,
  convertYearlyYieldUSD,
  minReceiveAmountString,
  setMinReceiveAmountString,
  minReceiveUsdAmount,
  setMinReceiveUsdAmount,
  setConvertYearlyYieldUSD,
  setConvertMonthlyYieldUSD,
  setConvertDailyYieldUSD,
  hasErrorOccurred,
  setHasErrorOccurred,
  failureCount,
  setFailureCount,
  supportedVault,
  setSupportedVault,
}) => {
  const {
    darkMode,
    bgColorNew,
    fontColor,
    fontColor1,
    fontColor2,
    fontColor3,
    fontColor4,
    activeColor,
    activeColorNew,
    borderColorBox,
    bgColorMessage,
    btnColor,
    btnHoverColor,
    btnActiveColor,
  } = useThemeContext()

  const { connected, connectAction, account, chainId, setChainId } = useWallet()
  const { getPortalsEstimate, getPortalsTokensBatch } = usePortals()

  const [
    {
      connectedChain, // the current chain the user's wallet is connected to
    },
    setChain, // function to call to initiate user to switch chains in their wallet
  ] = useSetChain()

  const slippage = 0.5 // Default slippage Percent
  const tokenChain = token.chain || token.data.chain
  const tokenSym = token.isIPORVault ? tokenSymbol : `f${tokenSymbol}`
  const curChain = isSpecialApp
    ? chainId
    : connectedChain
      ? parseInt(connectedChain.id, 16).toString()
      : ''

  const { rates } = useRate()
  const [currencySym, setCurrencySym] = useState('$')
  const [currencyRate, setCurrencyRate] = useState(1)
  const [depositName, setDepositName] = useState('Preview & Convert')
  const [showWarning, setShowWarning] = useState(false)
  // const [showDepositIcon, setShowDepositIcon] = useState(true)
  const amount = toWei(inputAmount, pickedToken.decimals, 0)

  useEffect(() => {
    if (rates.rateData) {
      setCurrencySym(rates.currency.icon)
      setCurrencyRate(rates.rateData[rates.currency.symbol])
    }
  }, [rates])

  useEffect(() => {
    if (account) {
      if (curChain !== '' && curChain !== tokenChain) {
        const chainName = getChainName(tokenChain)
        setDepositName(`Change Network to ${chainName}`)
        // setShowDepositIcon(false)
      } else {
        setDepositName('Preview & Convert')
      }
    } else {
      setDepositName('Connect Wallet to Get Started')
    }
  }, [account, curChain, tokenChain])

  useEffect(() => {
    const getQuoteResult = async () => {
      if (
        account &&
        pickedToken.symbol !== 'Select Token' &&
        !new BigNumber(amount.toString()).isEqualTo(0) &&
        curChain === tokenChain &&
        failureCount < 5
      ) {
        setFromInfoAmount('')
        setFromInfoUsdAmount('')
        let portalsEstimate
        try {
          let fromInfoValue = '',
            fromInfoUsdValue = '',
            minReceiveAmount = '',
            minReceiveUsd = '',
            outputAmountDefault = ''

          const fromToken = pickedToken.address
          const toToken = token.vaultAddress || token.tokenAddress
          const pickedTokenRawBalance = toWei(pickedToken.balance, pickedToken.decimals, 0)

          const overBalance = new BigNumber(amount.toString()).isGreaterThan(
            new BigNumber(pickedTokenRawBalance.toString()),
          )

          const pickedDefaultToken =
            pickedToken.address.toLowerCase() === defaultToken.address.toLowerCase()

          if (pickedDefaultToken) {
            const outputAmountDefaultDecimals = new BigNumber(inputAmount.toString())
              .dividedBy(new BigNumber(pricePerFullShare))
              .toString()
            outputAmountDefault = toWei(outputAmountDefaultDecimals, pickedToken.decimals, 0)
          } else if (supportedVault) {
            portalsEstimate = await getPortalsEstimate({
              chainId,
              tokenIn: fromToken,
              inputAmount: amount,
              tokenOut: toToken,
              slippage,
              sender: overBalance ? null : account,
            })

            if (portalsEstimate.res.message === 'outputToken not found') {
              setSupportedVault(false)
            } else {
              setSupportedVault(true)
            }
          }

          if (pickedDefaultToken || portalsEstimate.succeed) {
            let fromTokenUsdPrice, toTokenUsdPrice
            if (pickedDefaultToken) {
              fromTokenUsdPrice = pickedToken.usdPrice
              toTokenUsdPrice = Number(pickedToken.usdPrice) * Number(pricePerFullShare)
            } else {
              const tokenDetails = await getPortalsTokensBatch(chainId, [fromToken, toToken])
              const fromTokenDetail = tokenDetails.find(
                token => token.address.toLowerCase() === fromToken.toLowerCase(),
              )
              const toTokenDetail = tokenDetails.find(
                token => token.address.toLowerCase() === toToken.toLowerCase(),
              )
              fromTokenUsdPrice = fromTokenDetail?.price
              toTokenUsdPrice = toTokenDetail?.price
            }

            const quoteResult = {
              fromTokenAmount: amount,
              fromTokenUsdPrice,
              minToTokenAmount: pickedDefaultToken
                ? outputAmountDefault
                : portalsEstimate.res.outputAmount,
              outputTokenDecimals: pickedDefaultToken
                ? pickedToken.decimals
                : portalsEstimate.res.outputTokenDecimals,
            }

            if (pickedToken) {
              fromInfoValue = new BigNumber(
                fromWei(
                  quoteResult.fromTokenAmount,
                  pickedToken.decimals,
                  pickedToken.decimals,
                  false,
                ),
              ).toString()

              fromInfoUsdValue =
                quoteResult.fromTokenAmount === null
                  ? '0'
                  : fromWei(
                      quoteResult.fromTokenAmount,
                      pickedToken.decimals,
                      pickedToken.decimals,
                      true,
                    ) * quoteResult.fromTokenUsdPrice

              minReceiveAmount = new BigNumber(
                fromWei(
                  quoteResult.minToTokenAmount,
                  quoteResult.outputTokenDecimals || token.data.lpTokenData.decimals,
                  quoteResult.outputTokenDecimals || token.data.lpTokenData.decimals,
                  false,
                ),
              ).toString()

              minReceiveUsd = parseFloat(minReceiveAmount) * toTokenUsdPrice
            }
            setMinReceiveAmountString(minReceiveAmount)
            setFromInfoAmount(fromInfoValue)
            setHasErrorOccurred(0)
            setFailureCount(0)
            if (Number(fromInfoUsdValue) < 0.01) {
              setFromInfoUsdAmount(`<${currencySym}0.01`)
            } else {
              setFromInfoUsdAmount(
                `≈${currencySym}${(Number(fromInfoUsdValue) * Number(currencyRate)).toFixed(2)}`,
              )
            }
            if (Number(minReceiveUsd) < 0.01) {
              setMinReceiveUsdAmount(`<${currencySym}0.01`)
            } else {
              setMinReceiveUsdAmount(
                `≈${currencySym}${(Number(minReceiveUsd) * Number(currencyRate)).toFixed(2)}`,
              )
            }
          } else {
            setFailureCount(prevCount => prevCount + 1)

            if (failureCount === 4) {
              setConvertYearlyYieldUSD('-')
              setConvertMonthlyYieldUSD('-')
              setConvertDailyYieldUSD('-')
              setMinReceiveAmountString('-')
              setMinReceiveUsdAmount('-')
              setFromInfoUsdAmount('-')
              if (
                portalsEstimate.res.message === 'outputToken not found' ||
                portalsEstimate.res.message === 'Unexpected error'
              ) {
                setHasErrorOccurred(2)
              } else {
                setHasErrorOccurred(1)
              }
            }
          }
        } catch (e) {
          console.error('Error content: ', e)
        }
      }
    }

    getQuoteResult()
  }, [
    inputAmount,
    account,
    chainId,
    curChain,
    currencyRate,
    currencySym,
    defaultToken,
    token,
    tokenChain,
  ])

  const onClickDeposit = async () => {
    if (!connected) {
      connectAction()
      return
    }
    if (curChain !== tokenChain) {
      const chainHex = `0x${Number(tokenChain).toString(16)}`
      if (!isSpecialApp) {
        await setChain({ chainId: chainHex })
        setChainId(tokenChain)
      }
    } else {
      if (pickedToken.symbol === 'Select Token') {
        toast.error('Please choose your Output Token.')
        return
      }
      if (
        new BigNumber(inputAmount).isGreaterThan(
          checkNativeToken(pickedToken)
            ? new BigNumber(balance).times(0.95)
            : new BigNumber(balance),
        )
      ) {
        setShowWarning(true)
        return
      }
      if (new BigNumber(inputAmount).isEqualTo(0)) {
        toast.error('Cannot deposit 0!')
        return
      }
      setDeposit(true)
      setShowWarning(false)
    }
  }

  useEffect(() => {
    if (!deposit && pickedToken.usdPrice) {
      if (checkNativeToken(pickedToken)) {
        setInputAmount(
          new BigNumber(Math.floor(Number(balance) * 0.95 * 100000) / 100000).toString(),
        )
      } else {
        setInputAmount(new BigNumber(balance).toString())
      }
    }
  }, [balance, setInputAmount, pickedToken, deposit])

  const onInputBalance = e => {
    const inputValue = e.currentTarget.value.replace(/,/g, '.').replace(/[^0-9.]/g, '')
    setInputAmount(inputValue)
  }

  const mainTags = [
    { name: 'Convert', img: BsArrowDown },
    { name: 'Revert', img: BsArrowUp },
  ]

  const isMobile = useMediaQuery({ query: '(max-width: 992px)' })

  return (
    <>
      <BaseWidoDiv>
        <NewLabel
          $bgcolor={darkMode ? '#373D51' : '#fff'}
          $size={isMobile ? '16px' : '16px'}
          $height={isMobile ? '24px' : '24px'}
          $weight="600"
          $fontcolor={fontColor1}
          $display="flex"
          $justifycontent="center"
          $padding={isMobile ? '4px 0px' : '4px 0px'}
          $marginbottom="13px"
          $border={`1.3px solid ${borderColorBox}`}
          $borderradius="8px"
        >
          {mainTags.map((tag, i) => (
            <SwitchTabTag
              key={i}
              onClick={() => {
                if (i === 1) {
                  switchMethod()
                }
              }}
              $fontcolor={i === 0 ? fontColor4 : fontColor3}
              $bordercolor={i === 0 ? activeColor : ''}
              $backcolor={i === 0 ? activeColorNew : ''}
              $boxshadow={
                i === 0
                  ? '0px 1px 2px 0px rgba(16, 24, 40, 0.06), 0px 1px 3px 0px rgba(16, 24, 40, 0.10)'
                  : ''
              }
            >
              <tag.img />
              <p>{tag.name}</p>
            </SwitchTabTag>
          ))}
        </NewLabel>
        <DepoTitle $fontcolor={fontColor}>
          {'Convert your crypto into interest-bearing fTokens.'}
        </DepoTitle>
        <TokenInfo>
          <AmountSection>
            <NewLabel
              $size={isMobile ? '14px' : '14px'}
              $height={isMobile ? '20px' : '20px'}
              $weight="500"
              $fontcolor={fontColor2}
              $marginbottom="6px"
            >
              Amount to convert
            </NewLabel>
            <TokenInput>
              <TokenAmount
                type="number"
                value={inputAmount}
                onChange={onInputBalance}
                $bgcolor={bgColorNew}
                $fontcolor2={fontColor2}
                $bordercolor={borderColorBox}
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="0"
              />
              <input type="hidden" value={Number(inputAmount)} />
              <TokenUSDAmount $fontcolor3={fontColor3}>
                {inputAmount === '0' ||
                inputAmount === '' ||
                pickedToken.symbol === 'Select Token' ? (
                  `${currencySym}0`
                ) : fromInfoUsdAmount === '' ? (
                  <TokenInfo>
                    <AnimatedDots />
                  </TokenInfo>
                ) : fromInfoUsdAmount === '-' ? (
                  '-'
                ) : (
                  `${fromInfoUsdAmount}`
                )}
              </TokenUSDAmount>
            </TokenInput>
          </AmountSection>
          <DepositTokenSection>
            <NewLabel
              $size={isMobile ? '14px' : '14px'}
              $height={isMobile ? '20px' : '20px'}
              $weight="500"
              $fontcolor={fontColor2}
              $marginbottom="6px"
            >
              Input Token
            </NewLabel>
            <TokenSelect
              type="button"
              onClick={async () => {
                setSelectToken(true)
              }}
            >
              {pickedToken.logoURI ? (
                <img className="logo" src={pickedToken.logoURI} width={21} height={21} alt="" />
              ) : (
                <></>
              )}
              <span>{pickedToken.symbol}</span>
              <img className="dropdown-icon" src={DropDownIcon} alt="" />
            </TokenSelect>
          </DepositTokenSection>
        </TokenInfo>
        <BalanceInfo
          $fontcolor={fontColor}
          onClick={() => {
            if (account && pickedToken.symbol !== 'Select Token') {
              if (checkNativeToken(pickedToken)) {
                setInputAmount(new BigNumber((Number(balance) * 0.95).toFixed(5)).toString())
              } else {
                setInputAmount(new BigNumber(balance).toString())
              }
            }
          }}
        >
          {isMobile && (pickedToken.symbol === 'Select Token' ? '' : `${pickedToken.symbol} `)}
          Balance Available:
          <span>{showTokenBalance(balance)}</span>
        </BalanceInfo>
        <InsufficientSection
          $isshow={showWarning ? 'true' : 'false'}
          $activecolor={activeColor}
          $bgcolormessage={bgColorMessage}
        >
          <NewLabel $display="flex" $widthdiv="80%" $items="center">
            <img className="info-icon" src={InfoIcon} alt="" />
            <NewLabel
              $size={isMobile ? '14px' : '14px'}
              $height={isMobile ? '20px' : '20px'}
              $weight="600"
              $fontcolor={fontColor2}
            >
              Insufficient {pickedToken.symbol} balance in your wallet
            </NewLabel>
          </NewLabel>
          <div>
            <CloseBtn
              src={CloseIcon}
              alt=""
              onClick={() => {
                setShowWarning(false)
              }}
            />
          </div>
        </InsufficientSection>
        <HasErrorSection
          $isshow={hasErrorOccurred === 1 ? 'true' : 'false'}
          $activecolor={activeColor}
        >
          <NewLabel $display="flex" $flexflow="column" $widthdiv="100%">
            <FlexDiv>
              <img className="info-icon" src={InfoIcon} alt="" />
              <NewLabel
                $size={isMobile ? '14px' : '14px'}
                $height={isMobile ? '20px' : '20px'}
                $weight="600"
                $fontcolor={fontColor2}
              >
                Oops, we are having small issues with getting quotes. Please try again in 2 minutes.
              </NewLabel>
            </FlexDiv>
          </NewLabel>
          <div>
            <CloseBtn
              src={CloseIcon}
              alt=""
              onClick={() => {
                setHasErrorOccurred(0)
              }}
            />
          </div>
        </HasErrorSection>
      </BaseWidoDiv>
      <BaseWidoDiv $bordercolor={borderColorBox}>
        <NewLabel
          $size={isMobile ? '14px' : '14px'}
          $height={isMobile ? '24px' : '24px'}
          $fontcolor="#344054"
        >
          <NewLabel
            $display="flex"
            $justifycontent="space-between"
            $padding={isMobile ? '10px 0' : '10px 0'}
          >
            <NewLabel
              $size={isMobile ? '12px' : '14px'}
              $height={isMobile ? '24px' : '24px'}
              $fontcolor={fontColor3}
              $weight="500"
            >
              Est. Yearly Yield
              <PiQuestion className="question" data-tip data-for="monthly-yield" />
              <Tooltip
                id="monthly-yield"
                backgroundColor={darkMode ? 'white' : '#101828'}
                borderColor={darkMode ? 'white' : 'black'}
                textColor={darkMode ? 'black' : 'white'}
                place="right"
              >
                <NewLabel
                  $size={isMobile ? '12px' : '12px'}
                  $height={isMobile ? '18px' : '18px'}
                  $weight="500"
                >
                  {
                    'Calculated using live APY and current values of underlying and reward tokens. Subject to market fluctuations; performance may vary.'
                  }
                </NewLabel>
              </Tooltip>
            </NewLabel>
            <NewLabel
              $size={isMobile ? '12px' : '14px'}
              $height={isMobile ? '24px' : '24px'}
              $fontcolor={fontColor4}
              $weight="600"
              $textalign="right"
            >
              {account &&
              pickedToken.symbol !== 'Select Token' &&
              !new BigNumber(amount).isEqualTo(0) ? (
                minReceiveAmountString !== '' ? (
                  convertYearlyYieldUSD === '0' ? (
                    `${currencySym}0.00`
                  ) : convertYearlyYieldUSD === '-' ? (
                    '-'
                  ) : convertYearlyYieldUSD === 'NaN' ? (
                    '-'
                  ) : Number(convertYearlyYieldUSD) < 0.01 ? (
                    `<${currencySym}0.01`
                  ) : (
                    `${currencySym}${round(convertYearlyYieldUSD * Number(currencyRate), 2)}`
                  )
                ) : (
                  <TokenInfo>
                    <AnimatedDots />
                  </TokenInfo>
                )
              ) : (
                '-'
              )}
            </NewLabel>
          </NewLabel>
          <NewLabel
            $display="flex"
            $justifycontent="space-between"
            $padding={isMobile ? '10px 0' : '10px 0'}
          >
            <NewLabel
              $size={isMobile ? '12px' : '14px'}
              $height={isMobile ? '24px' : '24px'}
              $fontcolor={fontColor3}
              $weight="500"
            >
              {'Est. Received'}
              <PiQuestion className="question" data-tip data-for="min-received" />
              <Tooltip
                id="min-received"
                backgroundColor={darkMode ? 'white' : '#101828'}
                borderColor={darkMode ? 'white' : 'black'}
                textColor={darkMode ? 'black' : 'white'}
                place="right"
              >
                <NewLabel
                  $size={isMobile ? '10px' : '10px'}
                  $height={isMobile ? '14px' : '14px'}
                  $weight="500"
                >
                  The estimated number of fTokens you will receive in your wallet. The default
                  slippage is set as &apos;Auto&apos;.
                </NewLabel>
              </Tooltip>
            </NewLabel>
            <NewLabel
              $size={isMobile ? '12px' : '14px'}
              $height={isMobile ? '24px' : '24px'}
              $fontcolor={fontColor4}
              $weight="600"
              $textalign="right"
              $display="flex"
              $items="flex-end"
              $flexflow="column"
            >
              <>
                <div data-tip data-for="est-fToken-receive">
                  {account &&
                  pickedToken.symbol !== 'Select Token' &&
                  !new BigNumber(amount).isEqualTo(0) ? (
                    minReceiveAmountString !== '' ? (
                      showTokenBalance(minReceiveAmountString)
                    ) : (
                      <TokenInfo>
                        <AnimatedDots />
                      </TokenInfo>
                    )
                  ) : (
                    '-'
                  )}
                </div>
                <Tooltip
                  id="est-fToken-receive"
                  backgroundColor={darkMode ? 'white' : '#101828'}
                  borderColor={darkMode ? 'white' : 'black'}
                  textColor={darkMode ? 'black' : 'white'}
                  place="top"
                  effect="solid"
                >
                  <NewLabel
                    $size={isMobile ? '12px' : '12px'}
                    $height={isMobile ? '18px' : '18px'}
                    $weight="500"
                  >
                    {minReceiveAmountString}
                  </NewLabel>
                </Tooltip>
              </>
              <NewLabel $display="flex" $flexflow="column" $weight="600" $align="right">
                <span className="token-symbol">{tokenSym}</span>
                <span className="token-symbol">
                  {account &&
                  pickedToken.symbol !== 'Select Token' &&
                  !new BigNumber(amount).isEqualTo(0) ? (
                    minReceiveUsdAmount !== '' ? (
                      `${minReceiveUsdAmount}`
                    ) : (
                      <AnimatedDots />
                    )
                  ) : (
                    '-'
                  )}
                </span>
              </NewLabel>
            </NewLabel>
          </NewLabel>
          <ThumbUp $padding={isMobile ? '15px' : '16px'}>
            <img src={ThumbUpIcon} alt="thumb-up" style={{ marginRight: '15px' }} />
            <NewLabel
              $size={isMobile ? '10px' : '12px'}
              $weight="600"
              $height="20px"
              $fontcolor="#027A48"
            >
              You can exit anytime in full at no cost.
            </NewLabel>
          </ThumbUp>
        </NewLabel>
        <NewLabel>
          <Button
            $fontcolor="wido-deposit"
            $width="100%"
            $btncolor={btnColor}
            $btnhovercolor={btnHoverColor}
            $btnactivecolor={btnActiveColor}
            onClick={() => {
              onClickDeposit()
            }}
          >
            {depositName}
            {/* {showDepositIcon && <img src={WalletIcon} alt="" />} */}
          </Button>
        </NewLabel>
      </BaseWidoDiv>
    </>
  )
}
export default DepositBase
