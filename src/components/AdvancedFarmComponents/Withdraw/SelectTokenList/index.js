import React, { useEffect, useState } from 'react'
import { fromWei } from '../../../../services/web3'
import { useThemeContext } from '../../../../providers/useThemeContext'
import { formatNumberWido } from '../../../../utilities/formats'
import { WIDO_EXTEND_DECIMALS, WIDO_BALANCES_DECIMALS } from '../../../../constants'
import {
  Container,
  Text,
  RightText,
  TextSpan,
  Vault,
  Content,
  EmptyContainer,
  Label,
} from './style'
import AnimatedDots from '../../../AnimatedDots'
import { useWallet } from '../../../../providers/Wallet'
import { usePortals } from '../../../../providers/Portals'

const SelectTokenList = ({
  balanceList,
  supTokenNoBalanceList,
  defaultToken,
  soonToSupList,
  setPickedToken,
  setSelectToken,
  filterWord,
  supportedVault,
  hasPortalsError,
}) => {
  const { fontColor, fontColor2, hoverColor, activeColorModal } = useThemeContext()
  const [showList, setShowList] = useState(false)
  const [curSupportedVault, setCurSupportedVault] = useState(supportedVault)
  const { chainId } = useWallet()
  const { getPortalsToken } = usePortals()

  const [supTokenList, setSupTokenList] = useState(supTokenNoBalanceList)
  const [clicksupTokenNoBalanceListId, setClickSupTokenNoBalanceListId] = useState(-1)
  const handleSupTokenNoBalanceListClick = id => {
    setClickSupTokenNoBalanceListId(id)
    setPickedToken(supTokenList[id])
    setSelectToken(false)
  }

  // Supported token with balance in my wallet
  const [balanceTokenList, setBalanceTokenList] = useState(balanceList)
  const [clickBalanceListId, setClickBalanceListId] = useState(-1)
  const handleBalanceListClick = id => {
    setClickBalanceListId(id)
    setPickedToken(balanceTokenList[id])
    setSelectToken(false)
  }

  // Default Token
  const handleDefaultToken = () => {
    setClickBalanceListId(-1)
    setClickSupTokenNoBalanceListId(-1)
    setPickedToken(defaultToken)
    setSelectToken(false)
  }
  const [defaultCurToken, setDefaultCurToken] = useState(defaultToken)

  useEffect(() => {
    const fetch = async () => {
      if (supTokenNoBalanceList && balanceList && filterWord !== undefined && filterWord !== '') {
        const ethereumAddressRegex = /^(0x)?[0-9a-fA-F]{40}$/
        if (ethereumAddressRegex.test(filterWord)) {
          let TokenDetail = {},
            defaultTokenInvolve = false,
            balanceListInvolve = false
          try {
            TokenDetail = (await getPortalsToken(chainId, filterWord)) || {}
          } catch (e) {
            TokenDetail = {}
          }
          if (Object.keys(TokenDetail).length !== 0) {
            TokenDetail = {
              ...TokenDetail,
              logoURI: TokenDetail.image,
              balance: 0,
              default: false,
              usdValue: 0,
              usdPrice: TokenDetail.price,
              chainId,
            }
          }
          if (Object.keys(TokenDetail).length !== 0) {
            setCurSupportedVault(true)
            if (!(Object.keys(defaultToken).length === 0 && defaultToken.constructor === Object)) {
              if (defaultToken.symbol.includes(TokenDetail.symbol.toLowerCase().trim())) {
                defaultTokenInvolve = true
                setDefaultCurToken(defaultToken)
              } else {
                setDefaultCurToken(null)
              }
            }
            if (balanceList.length !== 0) {
              const newList = balanceList.filter(el =>
                el.symbol.toLowerCase().includes(TokenDetail.symbol.toLowerCase().trim()),
              )
              if (newList.length > 0) {
                balanceListInvolve = true
              }
              setBalanceTokenList(newList)
            }
            if (defaultCurToken === null) {
              const newList = balanceList.filter(el =>
                el.symbol.toLowerCase().includes(TokenDetail.symbol.toLowerCase().trim()),
              )
              if (newList.length === 0) setSupTokenList([TokenDetail])
              else setSupTokenList([])
            } else {
              setSupTokenList([])
            }
            if (supTokenNoBalanceList.length !== 0 && !defaultTokenInvolve && !balanceListInvolve) {
              const newList = supTokenNoBalanceList.filter(el =>
                el.symbol.toLowerCase().includes(TokenDetail.symbol.toLowerCase().trim()),
              )
              if (newList.length > 0) {
                setSupTokenList(newList)
              } else {
                setSupTokenList([TokenDetail])
              }
            }
          } else {
            setSupTokenList([])
            if (!(Object.keys(defaultToken).length === 0 && defaultToken.constructor === Object)) {
              setDefaultCurToken(null)
            }
            setBalanceTokenList([])
          }
        } else {
          if (supTokenNoBalanceList.length !== 0) {
            const newList = supTokenNoBalanceList.filter(el =>
              el.symbol.toLowerCase().includes(filterWord.toLowerCase().trim()),
            )
            setSupTokenList(newList)
          }
          if (
            defaultToken &&
            !(Object.keys(defaultToken).length === 0 && defaultToken.constructor === Object)
          ) {
            if (defaultToken.symbol.includes(filterWord.toLowerCase().trim())) {
              setDefaultCurToken(defaultToken)
            } else {
              setDefaultCurToken(null)
            }
          }
          if (balanceList.length !== 0) {
            const newList = balanceList.filter(el =>
              el.symbol.toLowerCase().includes(filterWord.toLowerCase().trim()),
            )
            setBalanceTokenList(newList)
          }
        }
      }
      if (filterWord === '') {
        setSupTokenList(supTokenNoBalanceList)
        setBalanceTokenList(balanceList)
        setDefaultCurToken(defaultToken)
      }
    }
    fetch()
  }, [filterWord, supTokenNoBalanceList, balanceList]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const count =
      defaultToken &&
      !(Object.keys(defaultToken).length === 0 && defaultToken.constructor === Object)
        ? 1
        : 0 +
          (balanceList && balanceList.length) +
          (supTokenNoBalanceList && supTokenNoBalanceList.length) +
          (soonToSupList && soonToSupList.length)
    if (count > 0) {
      setShowList(true)
    }
  }, [defaultToken, balanceList, supTokenNoBalanceList, soonToSupList])

  return (
    <>
      {showList ? (
        <Content>
          {defaultCurToken &&
            !(
              Object.keys(defaultCurToken).length === 0 && defaultCurToken.constructor === Object
            ) && (
              <>
                <Label fontColor={fontColor} padding="15px 24px 0px">
                  Default token to revert to{' '}
                </Label>
                <Container
                  onClick={() => {
                    handleDefaultToken()
                  }}
                  hoverColor={hoverColor}
                  activeColor={activeColorModal}
                >
                  <img src={defaultCurToken.logoURI} width={26} height={26} alt="" />
                  <Vault>
                    <Text weight={600} color={fontColor2}>
                      {defaultCurToken.symbol}
                    </Text>
                    <RightText weight={600} color={fontColor2}>
                      <>{defaultCurToken.balance ? defaultCurToken.balance : '0.00'}</>
                      <TextSpan fontColor2={fontColor2}>
                        {defaultCurToken.usdValue ? `$${defaultCurToken.usdValue}` : '$0.00'}
                      </TextSpan>
                    </RightText>
                  </Vault>
                </Container>
              </>
            )}
          {!hasPortalsError && balanceTokenList.length > 0 && (
            <>
              <Label fontColor={fontColor} padding="15px 24px 0px">
                {curSupportedVault
                  ? 'Tokens in your wallet which you can revert fTokens into'
                  : 'Soon to be supported'}
              </Label>
              {balanceTokenList.map((data, i) => (
                <Container
                  key={i}
                  className={i === clickBalanceListId ? 'active' : ''}
                  onClick={() => {
                    if (curSupportedVault) handleBalanceListClick(i)
                  }}
                  cursor={curSupportedVault ? 'pointer' : 'not-allowed'}
                  hoverColor={hoverColor}
                  activeColor={activeColorModal}
                >
                  <img src={data.logoURI} width={26} height={26} alt="" />
                  <Vault>
                    <Text weight={600} color={fontColor2}>
                      {data.symbol}
                    </Text>
                    <RightText weight={600} color={fontColor2}>
                      <>
                        {data.balance
                          ? `${formatNumberWido(data.balance, WIDO_EXTEND_DECIMALS)}`
                          : '0.00'}
                      </>
                      <TextSpan fontColor2={fontColor2}>
                        {data.usdValue
                          ? `$${formatNumberWido(data.usdValue, WIDO_BALANCES_DECIMALS)}`
                          : '$0.00'}
                      </TextSpan>
                    </RightText>
                  </Vault>
                </Container>
              ))}
            </>
          )}
          {!hasPortalsError && supTokenList.length > 0 && (
            <>
              <Label
                fontColor={fontColor}
                padding="15px 24px 0px"
                showLabel={curSupportedVault ? 'block' : 'none'}
              >
                Other supported tokens, which you can revert to{' '}
              </Label>
              {supTokenList.map((data, i) => (
                <Container
                  key={i}
                  className={i === clicksupTokenNoBalanceListId ? 'active' : ''}
                  onClick={() => {
                    if (curSupportedVault) handleSupTokenNoBalanceListClick(i)
                  }}
                  cursor={curSupportedVault ? 'pointer' : 'not-allowed'}
                  hoverColor={hoverColor}
                  activeColor={activeColorModal}
                >
                  <img src={data.logoURI} width={26} height={26} alt="" />
                  <Vault>
                    <Text weight={600} color={fontColor2}>
                      {data.symbol}
                    </Text>
                    <RightText weight={600} color={fontColor2}>
                      <>{data.balance ? `${1 * fromWei(data.balance, data.decimals)}` : '0.00'}</>
                      <TextSpan fontColor2={fontColor2}>$0</TextSpan>
                    </RightText>
                  </Vault>
                </Container>
              ))}
            </>
          )}
          {!hasPortalsError && soonToSupList.length > 0 && (
            <>
              <Label fontColor={fontColor} padding="15px 24px 0px">
                Soon to be supported
              </Label>
              {soonToSupList.map((data, i) => (
                <Container key={i} hoverColor={hoverColor} activeColor={activeColorModal}>
                  <img src={data.logoURI} width={26} height={26} alt="" />
                  <Vault>
                    <Text weight={600} color={fontColor2}>
                      {data.symbol}
                    </Text>
                    <RightText weight={600} color={fontColor2}>
                      <>{data.balance ? `${1 * fromWei(data.balance, data.decimals)}` : '0.00'}</>
                      <TextSpan fontColor2={fontColor2}>$0</TextSpan>
                    </RightText>
                  </Vault>
                </Container>
              ))}
            </>
          )}
          {defaultCurToken === null &&
            supTokenList.length === 0 &&
            balanceTokenList.length === 0 &&
            Object.keys(soonToSupList).length === 0 &&
            filterWord !== '' && (
              <EmptyContainer fontColor={fontColor} cursor="not-allowed">
                Not Found
              </EmptyContainer>
            )}
        </Content>
      ) : (
        <EmptyContainer fontColor={fontColor}>
          Loading Token list
          <AnimatedDots />
        </EmptyContainer>
      )}
    </>
  )
}
export default SelectTokenList
