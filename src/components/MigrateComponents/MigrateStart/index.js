import React, { useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import { BsArrowDown } from 'react-icons/bs'
import Modal from 'react-bootstrap/Modal'
import { useSetChain } from '@web3-onboard/react'
import { IoIosArrowUp } from 'react-icons/io'
import { CiSettings } from 'react-icons/ci'
import { useNavigate } from 'react-router-dom'
import { Spinner } from 'react-bootstrap'
import { useWallet } from '../../../providers/Wallet'
import { toWei, fromWei, getViem, checkNativeToken } from '../../../services/viem'
import { isSpecialApp, showTokenBalance } from '../../../utilities/formats'
import { FTokenInfo, IconCard, ImgBtn } from '../PositionModal/style'
import { usePortals } from '../../../providers/Portals'
import CloseIcon from '../../../assets/images/logos/beginners/close.svg'
import ClockIcon from '../../../assets/images/logos/sidebar/Migrate_white.svg'
import { useThemeContext } from '../../../providers/useThemeContext'
import AnimatedDots from '../../AnimatedDots'
import { usePools } from '../../../providers/Pools'
import StakeIcon from '../../../assets/images/ui/last.svg'
import StakeCross from '../../../assets/images/ui/purple-cross.svg'
import { Buttons } from '../../../pages/Migrate/style'
import {
  AnimateDotDiv,
  FTokenWrong,
  ProgressText,
  SlippageBox,
  MiddleLine,
  SlippageRow,
  SlipValue,
  SlippageInput,
  SlippageBtn,
  NewLabel,
  StakeIconBox,
} from '../../AdvancedFarmComponents/Deposit/DepositStart/style'
import AlertIcon from '../../../assets/images/logos/beginners/alert-triangle.svg'
import AlertCloseIcon from '../../../assets/images/logos/beginners/alert-close.svg'
import ProgressOne from '../../../assets/images/logos/advancedfarm/progress-step1.png'
import ProgressTwo from '../../../assets/images/logos/advancedfarm/progress-step2.png'
import ProgressThree from '../../../assets/images/logos/advancedfarm/progress-step3.png'
import ProgressFour from '../../../assets/images/logos/advancedfarm/progress-step4.png'
import ProgressFive from '../../../assets/images/logos/advancedfarm/progress-step5.png'

const MigrateStart = ({
  find,
  pools,
  pickedToken,
  id,
  toId,
  token,
  currencySym,
  currencyRate,
  showMigrate,
  setShowMigrate,
  supportedVault,
  setSupportedVault,
  inputAmount,
  failureCount,
  setFailureCount,
  setConvertSuccess,
  isNaN,
  highestVaultAddress,
  networkName,
  balance,
  highestPosition,
  positionAddress,
}) => {
  // const [hasErrorOccurred, setHasErrorOccurred] = useState(0)
  const [fromInfoUsdAmount, setFromInfoUsdAmount] = useState('0')
  const [fromInfoAmount, setFromInfoAmount] = useState('0')
  const [minReceiveAmountString, setMinReceiveAmountString] = useState('0')
  const [minReceiveUsdAmount, setMinReceiveUsdAmount] = useState('0')
  const [receiveUsd, setReceiveUsd] = useState('')
  const [receiveAmount, setReceiveAmount] = useState('')
  const [progressStep, setProgressStep] = useState(0)
  const [depositFailed, setDepositFailed] = useState(false)
  const [slippageFailed, setSlippageFailed] = useState(false)
  const [slippageSetting, setSlippageSetting] = useState(false)
  const [buttonName, setButtonName] = useState('Approve Token')
  const [startSpinner, setStartSpinner] = useState(false)
  const [slippagePercentage, setSlippagePercentage] = useState(null)
  const [customSlippage, setCustomSlippage] = useState(null)
  const [slippageBtnLabel, setSlippageBtnLabel] = useState('Save')
  const [showNote, setShowNote] = useState(false)

  const { account, chainId, viem } = useWallet()
  const { getPortalsEstimate, getPortalsToken, getPortals, getPortalsApproval, portalsApprove } =
    usePortals()
  const { userStats, fetchUserPoolStats } = usePools()
  const navigate = useNavigate()

  const {
    isMobile,
    darkMode,
    inputFontColor,
    fontColor,
    fontColor2,
    fontColor3,
    borderColor,
    bgColorSlippage,
    backColor,
  } = useThemeContext()

  const SlippageValues = [null, 0.1, 0.5, 1, 5]

  const onInputSlippage = e => {
    let inputValue = e.target.value
    if (!isNaN(inputValue)) {
      inputValue = Math.max(0, Math.min(10, inputValue))
      setCustomSlippage(inputValue)
    }
  }

  const onSlippageSave = () => {
    if (!(customSlippage === null || customSlippage === 0)) {
      setSlippagePercentage(customSlippage)

      setSlippageBtnLabel('Saved')
      setTimeout(() => {
        setSlippageBtnLabel('Save')
      }, 2000)
    }
  }

  let tokenChain, amount, toToken, vaultPool

  const slippage = 0.5 // Default slippage Percent
  if (token) {
    tokenChain = token.chain || token.data.chain
    toToken = token.vaultAddress || token.tokenAddress
    vaultPool = find(pools, pool => pool.collateralAddress === token.vaultAddress)
  }

  if (pickedToken && inputAmount) {
    amount = toWei(inputAmount, pickedToken.vaultDecimals || pickedToken.decimals, 0)
  }

  const [
    {
      connectedChain, // the current chain the user's wallet is connected to
    },
  ] = useSetChain()

  const curChain = isSpecialApp
    ? chainId
    : connectedChain
      ? parseInt(connectedChain.id, 16).toString()
      : ''

  useEffect(() => {
    setFailureCount(0)
  }, [token, setFailureCount, supportedVault, pickedToken])

  useEffect(() => {
    if (pickedToken) {
      if (pickedToken.staked !== 0) {
        setShowNote(true)
      }
    }
  }, [pickedToken])

  useEffect(() => {
    const getQuoteResult = async () => {
      if (
        account &&
        pickedToken &&
        !new BigNumber(amount.toString()).isEqualTo(0) &&
        curChain === tokenChain &&
        failureCount < 5
      ) {
        setFromInfoAmount('-')
        setFromInfoUsdAmount('-')
        let portalsEstimate
        try {
          let fromInfoValue = '',
            fromInfoUsdValue = '',
            minReceiveAmount = '',
            minReceiveUsd = ''

          const fromToken = pickedToken.address
          const pickedTokenRawBalance = toWei(pickedToken.balance, pickedToken.decimals, 0)

          const overBalance = new BigNumber(amount.toString()).isGreaterThan(
            new BigNumber(pickedTokenRawBalance.toString()),
          )

          if (supportedVault) {
            let newInputAmount

            if (checkNativeToken(pickedToken)) {
              newInputAmount = new BigNumber(
                Math.floor(Number(balance) * 0.95 * 100000) / 100000,
              ).toString()
            } else {
              newInputAmount = new BigNumber(balance).toString()
            }

            const newAmount = toWei(newInputAmount, pickedToken.decimals, 0)

            portalsEstimate = await getPortalsEstimate({
              chainId,
              tokenIn: fromToken,
              inputAmount: newAmount,
              tokenOut: toToken,
              slippage,
              sender: overBalance ? null : account,
            })

            if (portalsEstimate) {
              if (portalsEstimate.res.message === 'outputToken not found') {
                setSupportedVault(false)
              } else {
                setSupportedVault(true)
              }
            }
          }

          if (portalsEstimate && portalsEstimate.succeed) {
            let fromTokenUsdPrice, toTokenUsdPrice, newInputAmount
            const fromTokenDetail = await getPortalsToken(chainId, fromToken)
            const toTokenDetail = await getPortalsToken(chainId, toToken)
            fromTokenUsdPrice = fromTokenDetail?.price
            toTokenUsdPrice = toTokenDetail?.price

            if (checkNativeToken(pickedToken)) {
              newInputAmount = new BigNumber(
                Math.floor(Number(balance) * 0.95 * 100000) / 100000,
              ).toString()
            } else {
              newInputAmount = new BigNumber(balance).toString()
            }

            const newAmount = toWei(newInputAmount, pickedToken.decimals, 0)

            const quoteResult = {
              fromTokenAmount: newAmount,
              fromTokenUsdPrice,
              minToTokenAmount: portalsEstimate.res.outputAmount,
              outputTokenDecimals: portalsEstimate.res.outputTokenDecimals,
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
            // setHasErrorOccurred(0)
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
              setMinReceiveAmountString('-')
              setMinReceiveUsdAmount('-')
              setFromInfoUsdAmount('-')
              if (
                portalsEstimate &&
                (portalsEstimate.res.message === 'outputToken not found' ||
                  portalsEstimate.res.message === 'Unexpected error')
              ) {
                // setHasErrorOccurred(2)
              } else {
                // setHasErrorOccurred(1)
              }
            }
          }
        } catch (e) {
          console.error('Error content: ', e)
        }
      } else {
        setMinReceiveAmountString('-')
        setMinReceiveUsdAmount('-')
        setFromInfoUsdAmount('-')
        setFromInfoAmount('-')
      }
    }

    getQuoteResult()
  }, [
    account,
    chainId,
    curChain,
    currencyRate,
    currencySym,
    token,
    tokenChain,
    failureCount,
    toToken,
    balance,
    pickedToken,
  ])

  const onDeposit = async () => {
    const mainViem = await getViem(chainId, account, viem)

    const portalData = await getPortals({
      chainId,
      sender: account,
      tokenIn: pickedToken.address,
      inputAmount: amount,
      tokenOut: toToken,
      slippage: slippagePercentage,
    })

    await mainViem.sendTransaction({
      account,
      to: portalData.tx.to,
      data: portalData.tx.data,
      value: portalData.tx.value ? BigInt(portalData.tx.value) : undefined,
    })

    const receiveString = portalData
      ? fromWei(
          portalData.context?.outputAmount,
          token.decimals || token.data.lpTokenData.decimals,
          token.decimals || token.data.lpTokenData.decimals,
        )
      : ''
    const receiveUsdString = portalData ? portalData.context?.outputAmountUsd : ''
    if (Number(receiveUsdString) === 0) {
      setReceiveUsd(`${currencySym}0`)
    } else if (Number(receiveUsdString) < 0.01) {
      setReceiveUsd(`<${currencySym}0.01`)
    } else {
      setReceiveUsd(
        `≈${currencySym}${(Number(receiveUsdString) * Number(currencyRate)).toFixed(2)}`,
      )
    }
    setReceiveAmount(receiveString)

    await fetchUserPoolStats([vaultPool], account, userStats)
  }

  const approveZap = async amnt => {
    const { approve } = await portalsApprove(chainId, account, pickedToken.address, amnt.toString())
    const mainViem = await getViem(chainId, account, viem)
    await mainViem.sendTransaction({
      account,
      to: approve.to,
      data: approve.data,
      value: approve.value ? BigInt(approve.value) : undefined,
    })
  }

  const startDeposit = async () => {
    if (progressStep === 0) {
      setStartSpinner(true)
      setProgressStep(1)
      setButtonName('Pending Approval in Wallet')
      try {
        let allowanceCheck
        if (pickedToken.address === '0x0000000000000000000000000000000000000000') {
          // native token
          allowanceCheck = amount
        } else {
          const approval = await getPortalsApproval(chainId, account, pickedToken.address)

          allowanceCheck = approval ? approval.allowance : 0
        }

        if (!new BigNumber(allowanceCheck.toString()).gte(new BigNumber(amount.toString()))) {
          await approveZap(amount) // Approve for Zap
        }
        setProgressStep(2)
        setButtonName('Confirm Transaction')
        setStartSpinner(false)
      } catch (err) {
        setStartSpinner(false)
        setDepositFailed(true)
        setProgressStep(0)
        setButtonName('Approve Token')
      }
    } else if (progressStep === 2) {
      let isSuccess = true
      try {
        setProgressStep(3)
        setButtonName('Pending Confirmation in Wallet')
        setStartSpinner(true)
        await onDeposit()
      } catch (err) {
        setDepositFailed(true)
        setStartSpinner(false)
        setProgressStep(0)
        setButtonName('Approve Token')
        isSuccess = false
        return
      }
      // End Approve and Deposit successfully
      if (isSuccess) {
        setStartSpinner(false)
        setDepositFailed(false)
        setProgressStep(4)
        setButtonName('Success! Open new farm.')
      }
    } else if (progressStep === 4) {
      setConvertSuccess(true)
      setShowMigrate(false)
      setProgressStep(0)
      setButtonName('Approve Token')
      navigate(`/${networkName}/${highestVaultAddress}`)
    }
  }

  const closeDeposit = async () => {
    setStartSpinner(false)
    setProgressStep(0)
    setDepositFailed(false)
    setShowMigrate(false)
    setButtonName('Approve Token')
    if (progressStep === 4) {
      setConvertSuccess(true)
    }
  }

  const crossNote = () => {
    setShowNote(false)
  }

  return (
    <Modal
      show={showMigrate}
      // onHide={onClose}
      dialogClassName="migrate-modal-notification"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header className="migrate-position-modal-header">
        <FTokenInfo>
          <div className="modal-header-part">
            <NewLabel $margin="auto 16px auto 0px" $display="flex" $items="center">
              <IconCard $bgcolor="#5dcf46" $display="flex" $items="center">
                {progressStep === 4 ? <BsArrowDown /> : <img src={ClockIcon} alt="clock" />}
              </IconCard>
            </NewLabel>
            <NewLabel $textalign="left" $marginright="12px">
              <NewLabel
                $fontcolor="#5dcf46"
                $size={isMobile ? '18px' : '18px'}
                $height={isMobile ? '28px' : '28px'}
                $weight="600"
                $marginbottom="4px"
              >
                Migrate Summary
              </NewLabel>
              <NewLabel
                $fontcolor={fontColor}
                $size={isMobile ? '14px' : '14px'}
                $height={isMobile ? '20px' : '20px'}
                $weight="400"
                $marginbottom="5px"
              >
                Position migration involves an fToken swap.
              </NewLabel>
            </NewLabel>
          </div>
          <NewLabel>
            <NewLabel
              $display="flex"
              $marginbottom={isMobile ? '18px' : '18px'}
              $width="fit-content"
              $cursortype="pointer"
              $weight="600"
              $size={isMobile ? '14px' : '14px'}
              $height={isMobile ? '20px ' : '20px'}
              $darkmode={darkMode}
              $fontcolor={inputFontColor}
              $textalign="center"
              onClick={() => {
                closeDeposit()
              }}
            >
              <ImgBtn src={CloseIcon} alt="" />
            </NewLabel>
          </NewLabel>
        </FTokenInfo>
      </Modal.Header>
      <Modal.Body className="migrate-start-modal-body">
        {showNote && highestPosition && (
          <NewLabel
            $display="flex"
            $justifycontent="space-between"
            $flexflow="column"
            $items="center"
            $padding="15px 24px 0px 24px"
          >
            <NewLabel
              $display="flex"
              $justifycontent="space-between"
              $padding="16px"
              $align="flex-start"
              $bgcolor="#FCFAFF"
              $border="1px solid #D6BBFB"
              $borderradius="12px"
            >
              <StakeIconBox src={StakeIcon} alt="stake Icon" $width="17px" $height="17px" />
              <NewLabel $marginright="12px" $marginleft="12px">
                <NewLabel $weight="600" $size="12px" $height="20px" $fontcolor="#6941C6">
                  Note: Staked fTokens Detected
                </NewLabel>
                <NewLabel $weight="400" $fontcolor="#6941C6" $height="20px" $size="10px">
                  To fully migrate your position, unstake fTokens of the{' '}
                  <a
                    href={`${window.location.origin}/${networkName}/${positionAddress}#rewards`}
                    style={{ fontWeight: '600', color: '#6941C6' }}
                    target="blank"
                  >
                    {highestPosition.token.tokenNames.join(', ')} Strategy
                  </a>{' '}
                  via the Rewards tab first. You can also proceed with partial migration with
                  unstaked fTokens of the selected strategy.
                </NewLabel>
              </NewLabel>
              <StakeIconBox
                src={StakeCross}
                alt="stake Icon"
                $width="10px"
                $height="10px"
                onClick={crossNote}
                cursor="pointer"
              />
            </NewLabel>
          </NewLabel>
        )}
        <NewLabel
          $display="flex"
          $justifycontent="space-between"
          $flexflow="column"
          $items="center"
        >
          <NewLabel
            $display="flex"
            $justifycontent="space-between"
            $margintop="15px"
            $padding="10px 24px"
            $fontcolor={darkMode ? '#ffffff' : '#344054'}
            $width="100%"
          >
            <NewLabel $size="14px" $weight="500" $height="24px">
              Migrating
            </NewLabel>
            <NewLabel $display="flex" $flexflow="column">
              <NewLabel $weight="600" $size="14px" $height="20px" $textalign="right">
                {fromInfoAmount === '-' ? (
                  <AnimatedDots />
                ) : fromInfoAmount !== '' ? (
                  fromInfoAmount
                ) : (
                  inputAmount
                )}
              </NewLabel>
              <NewLabel $display="flex" $flexflow="column" $weight="600" $textalign="right">
                <NewLabel $weight="400" $height="20px" $size="12px">
                  {id ? id : <AnimatedDots />}
                </NewLabel>
                <NewLabel $weight="400" $size="12px" $height="20px">
                  {fromInfoAmount === '-' ? (
                    <AnimatedDots />
                  ) : fromInfoUsdAmount !== '' ? (
                    <>{fromInfoUsdAmount}</>
                  ) : (
                    <AnimatedDots />
                  )}
                </NewLabel>
              </NewLabel>
            </NewLabel>
          </NewLabel>
        </NewLabel>
        <NewLabel
          $display="flex"
          $justifycontent="space-between"
          $flexflow="column"
          $items="center"
          $width="100%"
        >
          <NewLabel
            $display="flex"
            $justifycontent="space-between"
            $padding="10px 24px"
            $fontcolor={darkMode ? '#ffffff' : '#344054'}
            $width="100%"
          >
            <NewLabel $size="14px" $weight="500" $height="24px">
              Min.received
            </NewLabel>
            <NewLabel $display="flex" $flexflow="column">
              <NewLabel $weight="600" $size="14px" $height="20px" $textalign="right">
                {progressStep === 4 ? (
                  receiveAmount !== '' ? (
                    showTokenBalance(receiveAmount)
                  ) : (
                    <AnimateDotDiv>
                      <AnimatedDots />
                    </AnimateDotDiv>
                  )
                ) : minReceiveAmountString === '-' ? (
                  <AnimatedDots />
                ) : minReceiveAmountString !== '' && fromInfoAmount !== '-' ? (
                  showTokenBalance(minReceiveAmountString)
                ) : (
                  <AnimateDotDiv>
                    <AnimatedDots />
                  </AnimateDotDiv>
                )}
              </NewLabel>
              <NewLabel $display="flex" $flexflow="column" $weight="600" $textalign="right">
                <NewLabel $weight="400" $height="20px" $size="12px">
                  {toId ? toId : <AnimatedDots />}
                </NewLabel>
                <NewLabel $weight="400" $size="12px" $height="20px">
                  {progressStep === 4 ? (
                    receiveUsd !== '' ? (
                      `${receiveUsd}`
                    ) : (
                      <>{`≈${currencySym}0`}</>
                    )
                  ) : minReceiveUsdAmount === 'NaN' || minReceiveUsdAmount === '-' ? (
                    <AnimatedDots />
                  ) : minReceiveUsdAmount !== '' && fromInfoAmount !== '-' ? (
                    `${minReceiveUsdAmount}`
                  ) : (
                    <AnimatedDots />
                  )}
                </NewLabel>
              </NewLabel>
            </NewLabel>
          </NewLabel>
          <FTokenWrong $isshow={depositFailed ? 'true' : 'false'}>
            <NewLabel $marginright="12px" $display="flex">
              <div>
                <img src={AlertIcon} alt="" />
              </div>
              <NewLabel $marginleft="12px">
                <NewLabel
                  $fontcolor="#B54708"
                  $size={isMobile ? '14px' : '14px'}
                  $height={isMobile ? '20px' : '20px'}
                  $weight="600"
                  $marginbottom="4px"
                >
                  Whoops, something went wrong.
                </NewLabel>
                <NewLabel
                  $fontcolor="#B54708"
                  $size={isMobile ? '14px' : '14px'}
                  $height={isMobile ? '20px' : '20px'}
                  $weight="400"
                  $marginbottom="5px"
                >
                  Please try to repeat the transaction in your wallet.
                </NewLabel>
              </NewLabel>
            </NewLabel>
            <NewLabel>
              <ImgBtn
                src={AlertCloseIcon}
                alt=""
                onClick={() => {
                  setDepositFailed(false)
                }}
              />
            </NewLabel>
          </FTokenWrong>
          <FTokenWrong $isshow={slippageFailed ? 'true' : 'false'}>
            <NewLabel $marginright="12px" $display="flex">
              <div>
                <img src={AlertIcon} alt="" />
              </div>
              <NewLabel $marginleft="12px">
                <NewLabel
                  $fontcolor="#B54708"
                  $size={isMobile ? '14px' : '14px'}
                  $height={isMobile ? '20px' : '20px'}
                  $weight="600"
                  $marginbottom="4px"
                >
                  Whoops, slippage set too low
                </NewLabel>
                <NewLabel
                  $fontcolor="#B54708"
                  $size={isMobile ? '14px' : '14px'}
                  $height={isMobile ? '20px' : '20px'}
                  $weight="400"
                  $marginbottom="5px"
                >
                  Slippage for this conversion is set too low. Expected slippage is &gt;[number%].
                  If you wish to proceed, set it manually via the gear button below.
                </NewLabel>
              </NewLabel>
            </NewLabel>
            <NewLabel>
              <ImgBtn
                src={AlertCloseIcon}
                alt=""
                onClick={() => {
                  setSlippageFailed(false)
                }}
              />
            </NewLabel>
          </FTokenWrong>
          <NewLabel>
            <img
              className="progressbar-img"
              src={
                progressStep === 0
                  ? ProgressOne
                  : progressStep === 1
                    ? ProgressTwo
                    : progressStep === 2
                      ? ProgressThree
                      : progressStep === 3
                        ? ProgressFour
                        : ProgressFive
              }
              alt="progress bar"
            />
          </NewLabel>
          <NewLabel
            $fontcolor={fontColor2}
            $weight="400"
            $size="14px"
            $height="20px"
            $display="flex"
            $width="100%"
          >
            <ProgressText $width="50%" $padding="0px 0px 0px 30px">
              Approve
              <br />
              Token
            </ProgressText>
            <ProgressText $width="unset" $padding="0px 0px 0px 7px">
              Confirm
              <br />
              Transaction
            </ProgressText>
            <ProgressText $width="50%" $padding="0px 10px 0px 0px">
              Transaction
              <br />
              Successful
            </ProgressText>
          </NewLabel>
          <NewLabel
            $size={isMobile ? '16px' : '16px'}
            $height={isMobile ? '24px' : '24px'}
            $weight={600}
            $fontcolor="#1F2937"
            $padding={slippageSetting ? '25px 24px 10px' : '25px 24px 24px'}
            $display="flex"
            $width="100%"
          >
            <SlippageBox onClick={() => setSlippageSetting(!slippageSetting)} $display="none">
              {slippageSetting ? (
                <IoIosArrowUp color="#6F78AA" fontSize={20} />
              ) : (
                <CiSettings color="#6F78AA" fontSize={20} />
              )}
            </SlippageBox>
            <Buttons
              onClick={() => {
                startDeposit()
              }}
            >
              {buttonName}&nbsp;&nbsp;
              {!startSpinner ? (
                <></>
              ) : (
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
              )}
            </Buttons>
          </NewLabel>
          <NewLabel
            $size={isMobile ? '12px' : '12px'}
            $height={isMobile ? '24px' : '24px'}
            $fontcolor={fontColor3}
            $padding="10px 24px"
            $display={slippageSetting ? 'flex' : 'none'}
            $flexflow="column"
            $width="100%"
          >
            <NewLabel $display="flex" $justifycontent="space-between">
              <NewLabel $height="24px" $size="12px" $weight="400">
                Slippage Settings
              </NewLabel>
              <MiddleLine $width={isMobile ? '65%' : '75%'} />
            </NewLabel>
            <NewLabel $padding="10px 0px" $size="12px" $height="24px">
              Current slippage:{' '}
              <span className="auto-slippage">
                {slippagePercentage === null ? 'Auto (0 - 2.5%)' : `${slippagePercentage}%`}
              </span>
            </NewLabel>
            <SlippageRow $bordercolor={borderColor}>
              {SlippageValues.map((percentage, index) => (
                <SlipValue
                  key={index}
                  onClick={() => {
                    setSlippagePercentage(percentage)
                    setCustomSlippage(null)
                  }}
                  $fontcolor={slippagePercentage === percentage ? '#fff' : fontColor2}
                  $bgcolor={slippagePercentage === percentage ? bgColorSlippage : ''}
                  $bordercolor={borderColor}
                  $islastchild={index === SlippageValues.length - 1}
                  $isfirstchild={index === 0}
                >
                  {percentage === null ? 'Auto' : `${percentage}%`}
                </SlipValue>
              ))}
            </SlippageRow>
            <NewLabel
              $display="flex"
              $justifycontent="space-between"
              $padding="15px 0px 5px"
              $gap="10px"
            >
              <NewLabel
                $fontcolor={fontColor2}
                $weight="600"
                $margin="auto"
                $size="12px"
                $height="24px"
              >
                or
              </NewLabel>
              <SlippageInput
                $fontcolor2={fontColor2}
                $backcolor={backColor}
                $bordercolor={
                  customSlippage === null || customSlippage === 0 ? borderColor : '#5dcf46'
                }
                $size="12px"
              >
                <input
                  type="number"
                  value={customSlippage === null ? '' : customSlippage}
                  onChange={onInputSlippage}
                  placeholder="Custom"
                />
                <div className="percentage">%</div>
              </SlippageInput>
              <SlippageBtn
                onClick={onSlippageSave}
                $fontcolor={
                  !darkMode
                    ? '#fff'
                    : customSlippage === null || customSlippage === 0
                      ? '#0C111D'
                      : '#fff'
                }
                $bgcolor={customSlippage === null || customSlippage === 0 ? '#ced3e6' : '#5dcf46'}
                cursor={customSlippage === null || customSlippage === 0 ? 'not-allowed' : 'pointer'}
                $hovercolor={
                  customSlippage === null || customSlippage === 0 ? '#ced3e6' : '#2ccda4'
                }
                $activecolor={
                  customSlippage === null || customSlippage === 0 ? '#ced3e6' : '#4fdfbb'
                }
              >
                {slippageBtnLabel}
              </SlippageBtn>
            </NewLabel>
          </NewLabel>
        </NewLabel>
      </Modal.Body>
    </Modal>
  )
}

export default MigrateStart
