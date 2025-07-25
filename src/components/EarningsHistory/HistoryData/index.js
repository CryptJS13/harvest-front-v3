import React, { useState, useMemo, useCallback } from 'react'
import ReactPaginate from 'react-paginate'
import { useMediaQuery } from 'react-responsive'
import { useNavigate } from 'react-router-dom'
import { IoArrowBackSharp, IoArrowForwardSharp } from 'react-icons/io5'
import SkeletonLoader from '../../DashboardComponents/SkeletonLoader'
import { useThemeContext } from '../../../providers/useThemeContext'
import { usePools } from '../../../providers/Pools'
import { useWallet } from '../../../providers/Wallet'
import ActionRow from '../ActionRow'
import AdvancedImg from '../../../assets/images/logos/sidebar/advanced.svg'
import { ROUTES } from '../../../constants'
import {
  TransactionDetails,
  HistoryPagination,
  TableContent,
  Header,
  Column,
  Col,
  ContentBox,
  EmptyPanel,
  EmptyInfo,
  ConnectButtonStyle,
  ThemeMode,
  ExploreButtonStyle,
} from './style'
import { handleToggle } from '../../../utilities/parsers'

const HistoryData = ({ historyData, isDashboard, noData }) => {
  const navigate = useNavigate()
  const isMobile = useMediaQuery({ query: '(max-width: 992px)' })
  const itemsPerPage = isMobile ? 5 : isDashboard ? 25 : 5
  const filteredHistoryData = historyData.filter(el => el.event !== 'Rewards')

  const {
    borderColorBox,
    bgColorNew,
    fontColor,
    fontColor1,
    fontColor2,
    btnHoverColor,
    btnColor,
    inputBorderColor,
  } = useThemeContext()

  const { disableWallet } = usePools()
  const { connected, connectAction } = useWallet()
  const [itemOffset, setItemOffset] = useState(0)
  const [showTotalBalance, setShowTotalBalance] = useState(true)

  const { currentItems, pageCount } = useMemo(() => {
    const endOffset = itemOffset + itemsPerPage
    const currentItems1 = filteredHistoryData?.slice(itemOffset, endOffset)
    const pageCount1 = Math.ceil(filteredHistoryData?.length / itemsPerPage)

    return { currentItems: currentItems1, pageCount: pageCount1 }
  }, [filteredHistoryData, itemOffset, itemsPerPage])

  const handlePageClick = useCallback(
    event => {
      const newOffset = (event.selected * itemsPerPage) % filteredHistoryData.length
      setItemOffset(newOffset)
    },
    [filteredHistoryData, itemsPerPage],
  )

  const CustomPreviousComponent = () => (
    <span>
      <IoArrowBackSharp /> {isMobile ? '' : 'Previous'}
    </span>
  )

  const CustomNextComponent = () => (
    <span>
      {isMobile ? '' : 'Next'} <IoArrowForwardSharp />
    </span>
  )

  return (
    <TransactionDetails
      $hasdata={
        (connected && filteredHistoryData?.length > 0) || isDashboard === true ? 'unset' : '80vh'
      }
    >
      <TableContent>
        <Header $bordercolor={borderColorBox} $backcolor={bgColorNew}>
          <Column $width={isMobile ? '25%' : '20%'} $fontcolor={fontColor}>
            <Col>Event</Col>
          </Column>
          <Column $width={isMobile ? '35%' : '20%'} $fontcolor={fontColor}>
            <Col>Date</Col>
          </Column>
          <Column
            $display="flex"
            $justifycontent="space-between"
            $width={isMobile ? '40%' : '30%'}
            $fontcolor={fontColor}
          >
            <Col>{showTotalBalance ? 'Total Balance' : 'Net change'}</Col>
            {isMobile && (
              <ThemeMode $mode={showTotalBalance ? 'balance' : 'netChange'}>
                <div id="theme-switch">
                  <div className="switch-track">
                    <div className="switch-thumb" />
                  </div>

                  <input
                    type="checkbox"
                    checked={showTotalBalance}
                    onChange={handleToggle(setShowTotalBalance)}
                    aria-label="Switch between balance and netChange earnings"
                  />
                </div>
              </ThemeMode>
            )}
          </Column>
          <Column
            $width={isMobile ? '0%' : '30%'}
            $fontcolor={fontColor}
            $display={isMobile ? 'none' : 'flex'}
          >
            <Col>Net change</Col>
          </Column>
        </Header>
        {connected && filteredHistoryData?.length > 0 ? (
          <div>
            <ContentBox>
              {currentItems
                .map((el, i) => {
                  const info = currentItems[i]
                  return <ActionRow key={i} info={info} showTotalBalance={showTotalBalance} />
                })
                .slice(0, isMobile ? 5 : isDashboard ? 25 : 5)}
            </ContentBox>
            <HistoryPagination
              $bgcolor={bgColorNew}
              $fontcolor={fontColor}
              $fontcolor1={fontColor1}
              $fontcolor2={fontColor2}
              $bordercolor={borderColorBox}
            >
              <ReactPaginate
                breakLabel="..."
                nextLabel={<CustomNextComponent />}
                onPageChange={handlePageClick}
                pageRangeDisplayed={isMobile ? 2 : 5}
                marginPagesDisplayed={isMobile ? 0 : 3}
                pageCount={pageCount}
                previousLabel={<CustomPreviousComponent />}
                renderOnZeroPageCount={null}
                containerClassName="paginate-container"
                className="paginate-wrapper"
                pageClassName="paginate-item"
                pageLinkClassName="paginate-item-link"
              />
            </HistoryPagination>
          </div>
        ) : connected ? (
          !noData ? (
            <SkeletonLoader isPosition="false" />
          ) : (
            <EmptyPanel $bordercolor={borderColorBox}>
              <EmptyInfo
                $weight={500}
                $size={14}
                $lineheight={20}
                $fontcolor={fontColor}
                $flexflow="column"
                $gap="0px"
              >
                <div>
                  {isDashboard
                    ? 'No activity found for this wallet.'
                    : 'No activity found for this wallet in this strategy.'}
                </div>
                <ExploreButtonStyle
                  onClick={() => {
                    navigate(ROUTES.ADVANCED)
                  }}
                  $inputbordercolor={inputBorderColor}
                  $bordercolor={fontColor}
                  $disabled={disableWallet}
                  $backcolor={btnColor}
                  $hovercolor={btnHoverColor}
                >
                  <img src={AdvancedImg} className="explore-farms" alt="" />
                  Explore Vaults
                </ExploreButtonStyle>
              </EmptyInfo>
            </EmptyPanel>
          )
        ) : (
          <EmptyPanel $bordercolor={borderColorBox}>
            <EmptyInfo $weight={500} $size={14} $lineheight={20} $fontcolor={fontColor}>
              Connect wallet to see full event history.
            </EmptyInfo>
            <ConnectButtonStyle
              onClick={() => {
                connectAction()
              }}
              $inputbordercolor={inputBorderColor}
              $bordercolor={fontColor}
              $disabled={disableWallet}
              $hovercolor={btnHoverColor}
              $backcolor={btnColor}
            >
              Connect
            </ConnectButtonStyle>
          </EmptyPanel>
        )}
      </TableContent>
    </TransactionDetails>
  )
}

export default HistoryData
