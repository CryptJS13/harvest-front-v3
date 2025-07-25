import React, { Fragment, useEffect, useState } from 'react'
import { Dropdown, Offcanvas } from 'react-bootstrap'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { SlArrowDown } from 'react-icons/sl'
import { IoCloseCircleOutline } from 'react-icons/io5'
import ConnectSuccessIcon from '../../assets/images/logos/sidebar/connect-success.svg'
import connectAvatar from '../../assets/images/logos/sidebar/ellipse.svg'
import Docs from '../../assets/images/logos/sidebar/file-search.svg'
import Home from '../../assets/images/logos/sidebar/bar-chart-square.svg'
import Diamond from '../../assets/images/logos/sidebar/diamond.svg'
import Activity from '../../assets/images/logos/sidebar/layout.svg'
import Settings from '../../assets/images/logos/sidebar/settings.svg'
import Support from '../../assets/images/logos/sidebar/discord-side.svg'
import Analytics from '../../assets/images/logos/sidebar/pie-chart.svg'
import BlackLeader from '../../assets/images/logos/sidebar/leader_icon_black.svg'
import BlackMigrate from '../../assets/images/logos/sidebar/Migrate_black.svg'
import Advanced from '../../assets/images/logos/sidebar/advanced.svg'
import logoNew from '../../assets/images/logos/sidebar/ifarm.svg'
import logoNewDark from '../../assets/images/logos/sidebar/ifarm_dark.svg'
import Toggle from '../../assets/images/logos/sidebar/dots-grid.svg'
import { ROUTES } from '../../constants'
import { CHAIN_IDS } from '../../data/constants'
import { usePools } from '../../providers/Pools'
import { useThemeContext } from '../../providers/useThemeContext'
import { useWallet } from '../../providers/Wallet'
import { getChainIcon } from '../../utilities/parsers'
import { formatAddress, isSpecialApp } from '../../utilities/formats'
import Social from '../Social'
import CopyIcon from '../../assets/images/logos/sidebar/copy.svg'
import WhiteCopyIcon from '../../assets/images/logos/sidebar/white-copy.svg'
import OnOff from '../../assets/images/logos/sidebar/power-02black.svg'
import {
  Address,
  ConnectAvatar,
  ConnectButtonStyle,
  Container,
  FlexDiv,
  Layout,
  LinkWrap,
  LinkContainer,
  LinksContainer,
  MobileFollow,
  MiddleActionsContainer,
  MobileActionsContainer,
  MobileWalletButton,
  MobileLinkContainer,
  MobileView,
  OffcanvasDiv,
  SideIcons,
  UserDropDown,
  UserDropDownItem,
  UserDropDownMenu,
  BottomPart,
  Logo,
  Desktop,
  NewTag,
  LinkMobile,
  MobileMenuContainer,
  Mobile,
  LinkName,
  MobileMoreTop,
  CategoryRow,
  MobileMoreHeader,
} from './style'

const sideLinksTop = [
  {
    path: ROUTES.PORTFOLIO,
    name: 'Portfolio',
    imgPath: Home,
  },
  {
    category: true,
    name: 'Products',
  },
  {
    path: ROUTES.AUTOPILOT,
    name: 'Autopilot',
    imgPath: Diamond,
    new: true,
  },
  {
    path: ROUTES.ADVANCED,
    name: 'All Vaults',
    imgPath: Advanced,
  },
  {
    category: true,
    name: 'User',
  },
  {
    path: ROUTES.ACTIVITY,
    name: 'Activity',
    imgPath: Activity,
    // enabled: false,
  },
  {
    path: ROUTES.SETTINGS,
    name: 'Settings',
    imgPath: Settings,
  },
]

const sideLinksBottom = [
  {
    category: true,
    name: 'Tools',
  },
  {
    path: ROUTES.MIGRATE,
    name: 'Migrate',
    imgPath: BlackMigrate,
    external: false,
  },
  {
    path: ROUTES.ANALYTIC,
    name: 'Analytics',
    imgPath: Analytics,
    external: false,
  },
  {
    path: ROUTES.LEADERBOARD,
    name: 'Leaderboard',
    imgPath: BlackLeader,
    external: false,
  },
  {
    category: true,
    name: 'Support',
  },
  {
    path: ROUTES.DOC,
    name: 'Docs',
    imgPath: Docs,
    external: false,
    newTab: true,
  },
  {
    path: ROUTES.LiveSupport,
    name: 'Open Ticket',
    imgPath: Support,
    external: true,
    newTab: true,
  },
]

const sideLinksMobile = [
  {
    path: ROUTES.PORTFOLIO,
    name: 'Portfolio',
    imgPath: Home,
    linkName: 'Portfolio',
  },
  {
    path: ROUTES.AUTOPILOT,
    name: 'Autopilot',
    imgPath: Diamond,
    linkName: 'Autopilot',
  },
  {
    path: ROUTES.ADVANCED,
    name: 'All Vaults',
    imgPath: Advanced,
    isFarms: true,
    linkName: 'All Vaults',
  },
]

const sideLinksMobileBottom = [
  {
    category: true,
    name: 'User',
  },
  {
    path: ROUTES.ACTIVITY,
    name: 'Activity',
    imgPath: Activity,
  },
  {
    path: ROUTES.SETTINGS,
    name: 'Settings',
    imgPath: Settings,
  },
  {
    category: true,
    name: 'Tools',
  },
  {
    path: ROUTES.MIGRATE,
    name: 'Migrate',
    imgPath: BlackMigrate,
    external: false,
  },
  {
    path: ROUTES.ANALYTIC,
    name: 'Analytics',
    imgPath: Analytics,
  },
  {
    path: ROUTES.LEADERBOARD,
    name: 'Leaderboard',
    imgPath: BlackLeader,
    external: false,
  },
  {
    category: true,
    name: 'Support',
  },
  {
    path: ROUTES.DOC,
    name: 'Docs',
    imgPath: Docs,
    newTab: true,
  },
  {
    path: ROUTES.LiveSupport,
    name: 'Open Ticket',
    imgPath: Support,
    external: true,
    newTab: true,
  },
]

const SideLink = ({ item, isDropdownLink, fontColor1, darkMode, hoverColorSide }) => {
  const { pathname } = useLocation()
  const pageName =
    pathname === '/'
      ? 'all vaults'
      : pathname === ROUTES.PORTFOLIO
        ? 'portfolio'
        : pathname === ROUTES.TUTORIAL
          ? 'tutorial'
          : pathname === ROUTES.MIGRATE
            ? 'migrate'
            : pathname
  return (
    <LinkWrap
      $fontcolor1={fontColor1}
      $active={pageName.includes(item.name.toLowerCase().trim())}
      $isdropdownlink={isDropdownLink}
      $darkmode={darkMode}
      $enabled={item.enabled === false ? 'false' : 'true'}
      $hovercolorside={hoverColorSide}
    >
      <div className="item">
        <SideIcons
          width="25px"
          height="25px"
          className="sideIcon"
          src={item.imgPath}
          alt="Harvest"
        />
      </div>
      <div className="item-name">{item.name}</div>
      {item.new ? <NewTag>New</NewTag> : <></>}
    </LinkWrap>
  )
}

const MobileMenu = ({ item, isDropdownLink, fontColor, filterColor, darkMode, isWallet }) => {
  const { pathname } = useLocation()
  const pageName =
    pathname === '/' ? 'all vaults' : pathname === ROUTES.PORTFOLIO ? 'portfolio' : pathname
  const active = !isWallet && pageName.includes(item.name.toLowerCase())
  const farmsFilter = active
    ? 'invert(75%) sepia(89%) saturate(343%) hue-rotate(52deg) brightness(89%) contrast(86%)'
    : filterColor
  return (
    <LinkMobile
      $fontcolor={fontColor}
      $active={!isWallet && pageName.includes(item.name.toLowerCase())}
      $isdropdownlink={isDropdownLink}
      $enabled={item.enabled === false ? 'false' : 'true'}
      $farmsfilter={farmsFilter}
    >
      <SideIcons className="sideIcon" src={item.imgPath} alt="Harvest" width="25px" height="25px" />
      <LinkName color={active ? '#6ED459' : darkMode ? '#fff' : '#7A7A7A'} $margintop="2px">
        {item.linkName}
      </LinkName>
      {item.new ? <NewTag>New</NewTag> : <></>}
    </LinkMobile>
  )
}

const Sidebar = ({ width }) => {
  const {
    darkMode,
    bgColorNew,
    fontColor,
    fontColor1,
    fontColor2,
    filterColorNew,
    filterColor,
    filterColor2,
    filterColorBottom,
    fontColor5,
    fontColor7,
    inputBorderColor,
    toggleColor,
    borderColorBox,
    hoverColor,
    btnHoverColor,
    hoverColorSide,
    toggleBackColor,
    sidebarFontColor,
  } = useThemeContext()

  const { account, connectAction, disconnectAction, chainId, connected, setSelChain } = useWallet()

  const { disableWallet } = usePools()

  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('darkMode', '')
    } else {
      document.documentElement.removeAttribute('darkMode', '')
    }
  }, [darkMode])

  const navigate = useNavigate()

  // Show sidebar for mobile
  const [mobileShow, setMobileShow] = useState(false)
  const [, setCopyAddress] = useState('Copy Address')

  const handleMobileClose = () => setMobileShow(false)
  const handleMobileShow = () => setMobileShow(true)
  const handleMobileWalletClose = () => setMobileShow(false)
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(account).then(() => {
      setCopyAddress('Copied Address')

      setTimeout(() => {
        setCopyAddress('Copy Address')
      }, 1500)
    })
  }

  const beforeAccount = localStorage.getItem('address')

  useEffect(() => {
    if (beforeAccount === null && account !== null) {
      localStorage.setItem('address', account)
    }

    if (beforeAccount !== null && account !== null && beforeAccount !== account) {
      localStorage.setItem('address', account)
      window.location.reload()
    }
  }, [account, beforeAccount])

  const directAction = path => {
    if (path === ROUTES.PORTFOLIO || path === ROUTES.ANALYTIC) {
      setSelChain([
        CHAIN_IDS.ETH_MAINNET,
        CHAIN_IDS.POLYGON_MAINNET,
        CHAIN_IDS.ARBITRUM_ONE,
        CHAIN_IDS.BASE,
        CHAIN_IDS.ZKSYNC,
      ])
    }
    navigate(path)
  }

  return (
    <Container
      $width={width}
      $backcolor={bgColorNew}
      $bordercolor={borderColorBox}
      $fontcolor={fontColor}
    >
      <Desktop>
        <Layout>
          <MiddleActionsContainer>
            <LinksContainer $fontcolor={fontColor2}>
              <Logo
                className="logo"
                onClick={() => {
                  navigate('/')
                }}
              >
                <img src={darkMode ? logoNewDark : logoNew} width={36} height={36} alt="Harvest" />
              </Logo>

              {(() => {
                if (!connected) {
                  return (
                    <ConnectButtonStyle
                      onClick={() => {
                        connectAction()
                      }}
                      $inputbordercolor={inputBorderColor}
                      $bordercolor={fontColor}
                      $disabled={disableWallet}
                      $hovercolor={btnHoverColor}
                    >
                      Connect
                    </ConnectButtonStyle>
                  )
                }

                if (!chainId) {
                  return (
                    <button onClick={disconnectAction} type="button">
                      Wrong network
                    </button>
                  )
                }
                return (
                  <Dropdown>
                    <UserDropDown
                      id="dropdown-basic"
                      $backcolor={toggleBackColor}
                      $fontcolor2={fontColor2}
                      $hovercolor={hoverColor}
                    >
                      <FlexDiv>
                        <ConnectAvatar $avatar="true">
                          <img src={connectAvatar} alt="" />
                        </ConnectAvatar>
                        <div className="detail-info">
                          <img
                            alt="chain icon"
                            src={getChainIcon(chainId)}
                            className="chain-icon"
                          />
                          <Address>{formatAddress(account)}</Address>
                        </div>
                      </FlexDiv>
                      <div>
                        <SlArrowDown fontSize={13} />
                      </div>
                    </UserDropDown>
                    {!isSpecialApp ? (
                      <UserDropDownMenu $backcolor={bgColorNew} $bordercolor={borderColorBox}>
                        <UserDropDownItem
                          onClick={() => {
                            disconnectAction()
                          }}
                          $fontcolor={fontColor}
                          $filtercolor={filterColor2}
                          $filtercolornew={filterColorNew}
                        >
                          <img src={OnOff} width="18px" height="18px" alt="" />
                          <div>Disconnect</div>
                        </UserDropDownItem>
                      </UserDropDownMenu>
                    ) : (
                      <></>
                    )}
                  </Dropdown>
                )
              })()}

              {sideLinksTop.map(item => {
                if (item.category === true) {
                  return (
                    <CategoryRow key={item.name} $fontcolor={fontColor7}>
                      {item.name}
                    </CategoryRow>
                  )
                }
                const url = item.path
                const shouldOpenNewTab = item.newTab || item.enabled === false

                return (
                  <Link to={url} key={item.name} style={{ textDecoration: 'none' }}>
                    <LinkContainer
                      href={url}
                      target={shouldOpenNewTab ? '_blank' : '_self'}
                      rel="noopener noreferrer"
                      $activecolor={item.activeColor}
                      onClick={e => {
                        if (shouldOpenNewTab || e.ctrlKey || e.button === 1) {
                          e.preventDefault()
                          const newTab = window.open(url, '_blank', 'noopener noreferrer')
                          if (newTab) newTab.opener = null
                        } else {
                          directAction(url)
                        }
                      }}
                    >
                      <SideLink
                        item={item}
                        isDropdownLink={item.path === '#'}
                        fontColor1={fontColor1}
                        darkMode={darkMode}
                        hoverColorSide={hoverColorSide}
                      />
                    </LinkContainer>
                  </Link>
                )
              })}
            </LinksContainer>
          </MiddleActionsContainer>
        </Layout>

        <BottomPart>
          <LinksContainer>
            {sideLinksBottom.map(item => {
              if (item.category === true) {
                return (
                  <CategoryRow key={item.name} $fontcolor={fontColor7}>
                    {item.name}
                  </CategoryRow>
                )
              }
              const url = item.path
              const shouldOpenNewTab = item.newTab || item.enabled === false

              return (
                <Fragment key={item.name}>
                  <LinkContainer
                    href={url}
                    target={shouldOpenNewTab ? '_blank' : '_self'}
                    rel="noopener noreferrer"
                    onClick={e => {
                      if (shouldOpenNewTab || e.ctrlKey || e.button === 1) {
                        e.preventDefault()
                        const newTab = window.open(url, '_blank', 'noopener noreferrer')
                        if (newTab) newTab.opener = null
                      } else {
                        directAction(url)
                      }
                    }}
                  >
                    <SideLink
                      item={item}
                      isDropdownLink={item.path === '#'}
                      fontColor1={fontColor1}
                      activeFontColor={fontColor1}
                      darkMode={darkMode}
                      hoverColorSide={hoverColorSide}
                    />
                  </LinkContainer>
                </Fragment>
              )
            })}
          </LinksContainer>
        </BottomPart>
      </Desktop>
      <Mobile>
        <MobileView $bordercolor={borderColorBox}>
          {/* Full Menu */}
          <OffcanvasDiv
            show={mobileShow}
            onHide={handleMobileClose}
            placement="bottom"
            $fontcolor={fontColor}
            $filtercolor={filterColor}
          >
            <Offcanvas.Body>
              <MobileActionsContainer
                className="full-menu-container"
                $bgcolor={bgColorNew}
                $bordercolor={borderColorBox}
              >
                <Logo
                  $fontcolor={fontColor5}
                  className="logo"
                  onClick={() => {
                    handleMobileClose()
                  }}
                >
                  <MobileMoreTop>
                    {connected ? (
                      <>
                        <MobileMoreHeader $backcolor={hoverColorSide}>
                          <img
                            className="chainStatus"
                            alt="Chain icon"
                            src={ConnectSuccessIcon}
                            style={{ width: 8, height: 8, marginRight: '10px' }}
                          />
                          <img
                            className="chainIcon"
                            alt="chain icon"
                            src={getChainIcon(chainId)}
                            style={{ width: 16, height: 16 }}
                          />
                          <Address $fontcolor={darkMode ? '#ffffff' : '#000000'}>
                            {formatAddress(account)}
                          </Address>
                        </MobileMoreHeader>
                        <MobileWalletButton
                          $fontcolor5={fontColor5}
                          $backcolor={bgColorNew}
                          $bordercolor={borderColorBox}
                          onClick={handleCopyAddress}
                          $marginleft="10px"
                        >
                          <img
                            className="chainIcon"
                            alt="chain icon"
                            src={darkMode ? WhiteCopyIcon : CopyIcon}
                            style={{ width: 18, height: 18 }}
                          />
                        </MobileWalletButton>
                        <MobileWalletButton
                          $fontcolor5={fontColor5}
                          $backcolor={bgColorNew}
                          $bordercolor={borderColorBox}
                          $filtercolor={filterColor2}
                          onClick={() => {
                            disconnectAction()
                            handleMobileWalletClose()
                          }}
                          $marginleft="15px"
                        >
                          <img
                            className="chainIcon disconnect"
                            alt="chain icon"
                            src={OnOff}
                            style={{ width: 18, height: 18 }}
                          />
                        </MobileWalletButton>
                      </>
                    ) : (
                      <ConnectButtonStyle
                        color="connectwallet"
                        onClick={() => {
                          connectAction()
                        }}
                        $inputbordercolor={inputBorderColor}
                        $bordercolor={fontColor}
                        $disabled={disableWallet}
                        $hovercolor={btnHoverColor}
                      >
                        Connect
                      </ConnectButtonStyle>
                    )}
                  </MobileMoreTop>
                </Logo>
                {sideLinksMobileBottom.map(item =>
                  item.category === true ? (
                    <CategoryRow key={item.name} $fontcolor={fontColor7}>
                      {item.name}
                    </CategoryRow>
                  ) : (
                    <Fragment key={item.name}>
                      <MobileLinkContainer
                        $activecolor={item.activeColor}
                        onClick={() => {
                          if (item.newTab) {
                            window.open(item.path, '_blank')
                          } else if (item.enabled !== false) {
                            directAction(item.path)
                            handleMobileClose()
                          }
                        }}
                      >
                        <SideLink
                          item={item}
                          isDropdownLink={item.path === '#'}
                          fontColor1={fontColor1}
                          activeFontColor={fontColor1}
                          darkMode={darkMode}
                          hoverColorSide={hoverColorSide}
                        />
                      </MobileLinkContainer>
                      {item.subItems ? (
                        <LinkContainer>
                          {item.subItems.map(subItem => (
                            <SideLink
                              key={subItem.name}
                              fontColor1={fontColor1}
                              activeFontColor={fontColor1}
                              darkMode={darkMode}
                              hoverColorSide={hoverColorSide}
                            />
                          ))}
                        </LinkContainer>
                      ) : null}
                    </Fragment>
                  ),
                )}
                <MobileFollow>
                  <Social />
                  <div>
                    <IoCloseCircleOutline
                      className="close"
                      fontSize={22}
                      onClick={() => {
                        handleMobileClose()
                      }}
                    />
                  </div>
                </MobileFollow>
              </MobileActionsContainer>
            </Offcanvas.Body>
          </OffcanvasDiv>

          {/* Bottom Menu */}
          {sideLinksMobile.map(item => (
            <Fragment key={item.name}>
              <MobileMenuContainer
                onClick={() => {
                  if (item.newTab) {
                    window.open(item.path, '_blank')
                  } else {
                    directAction(item.path)
                  }
                  handleMobileClose()
                }}
              >
                <MobileMenu
                  item={item}
                  isDropdownLink={item.path === '#'}
                  fontColor={sidebarFontColor}
                  filterColor={filterColorBottom}
                  activeFontColor={fontColor1}
                  darkMode={darkMode}
                  isWallet={false}
                  isMobile
                />
              </MobileMenuContainer>
            </Fragment>
          ))}

          <MobileMenuContainer>
            <LinkMobile className="more" type="button" onClick={handleMobileShow}>
              <SideIcons
                width="25px"
                height="25px"
                $togglecolor={toggleColor}
                $filterColor={filterColorBottom}
                src={Toggle}
                alt=""
              />
              <LinkName $margintop="2px" $fontcolor={darkMode ? '#fff' : '#7A7A7A'}>
                More
              </LinkName>
            </LinkMobile>
          </MobileMenuContainer>
        </MobileView>
      </Mobile>
    </Container>
  )
}

export default Sidebar
