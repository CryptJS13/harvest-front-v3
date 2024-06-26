import React, { useState, useMemo, useCallback } from 'react'
import ReactPaginate from 'react-paginate'
import { useMediaQuery } from 'react-responsive'
import { IoArrowBackSharp, IoArrowForwardSharp } from 'react-icons/io5'
import ConnectDisableIcon from '../../../assets/images/logos/sidebar/connect-disable.svg'
import { useThemeContext } from '../../../providers/useThemeContext'
import { usePools } from '../../../providers/Pools'
import { useWallet } from '../../../providers/Wallet'
import ActionRow from '../ActionRow'
import AnimatedDots from '../../AnimatedDots'
import {
  TransactionDetails,
  HistoryPagination,
  TableContent,
  Header,
  Column,
  Col,
  EmptyPanel,
  EmptyInfo,
  ConnectButtonStyle,
  ThemeMode,
} from './style'

const HistoryData = ({ historyData, isDashboard, noData }) => {
  const itemsPerPage = isDashboard === 'true' ? 10 : 5
  const isMobile = useMediaQuery({ query: '(max-width: 992px)' })

  const {
    borderColor,
    backColor,
    bgColorFarm,
    fontColor,
    fontColor1,
    fontColor2,
    hoverColorButton,
    inputBorderColor,
  } = useThemeContext()

  const { disableWallet } = usePools()
  const { connected, connectAction } = useWallet()
  const [itemOffset, setItemOffset] = useState(0)
  const [showTotalBalance, setShowTotalBalance] = useState(true)

  const switchEarnings = () => setShowTotalBalance(prev => !prev)

  const { currentItems, pageCount } = useMemo(() => {
    const endOffset = itemOffset + itemsPerPage
    const currentItems1 = historyData?.slice(itemOffset, endOffset)
    const pageCount1 = Math.ceil(historyData?.length / itemsPerPage)

    return { currentItems: currentItems1, pageCount: pageCount1 }
  }, [historyData, itemOffset, itemsPerPage])

  const handlePageClick = useCallback(
    event => {
      const newOffset = (event.selected * itemsPerPage) % historyData.length
      setItemOffset(newOffset)
    },
    [historyData, itemsPerPage],
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
      hasData={(connected && historyData?.length > 0) || isDashboard === 'true' ? 'unset' : '80vh'}
    >
      <TableContent borderColor={borderColor}>
        <Header borderColor={borderColor} backColor={backColor}>
          <Column width={isMobile ? '22%' : '20%'} color={fontColor}>
            <Col>Event</Col>
          </Column>
          <Column width={isMobile ? '20%' : '20%'} color={fontColor}>
            <Col>Date</Col>
          </Column>
          <Column
            display="flex"
            justifyContent="space-between"
            width={isMobile ? '57%' : '30%'}
            color={fontColor}
          >
            <Col>{showTotalBalance ? 'Total Balance' : 'Net change'}</Col>
            {isMobile && (
              <ThemeMode mode={showTotalBalance ? 'balance' : 'netChange'}>
                <div id="theme-switch">
                  <div className="switch-track">
                    <div className="switch-thumb" />
                  </div>

                  <input
                    type="checkbox"
                    checked={showTotalBalance}
                    onChange={switchEarnings}
                    aria-label="Switch between balance and netChange earnings"
                  />
                </div>
              </ThemeMode>
            )}
          </Column>
          <Column
            width={isMobile ? '0%' : '30%'}
            color={fontColor}
            display={isMobile ? 'none' : 'flex'}
          >
            <Col>Net change</Col>
          </Column>
        </Header>
        {connected && historyData?.length > 0 ? (
          <>
            {currentItems
              .map((el, i) => {
                const info = currentItems[i]
                return <ActionRow key={i} info={info} showTotalBalance={showTotalBalance} />
              })
              .slice(0, 10)}
            <HistoryPagination
              bgColor={bgColorFarm}
              fontColor={fontColor}
              fontColor1={fontColor1}
              fontColor2={fontColor2}
              borderColor={inputBorderColor}
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
          </>
        ) : (
          <EmptyPanel borderColor={borderColor}>
            {connected ? (
              !noData ? (
                <EmptyInfo weight={500} size={14} height={20} color={fontColor} gap="2px">
                  <div>
                    Loading all events data for the connected wallet
                    <br />
                    It might take up to 30s <AnimatedDots />
                  </div>
                </EmptyInfo>
              ) : (
                <EmptyInfo weight={500} size={14} height={20} color={fontColor}>
                  No interaction history found for this wallet.
                </EmptyInfo>
              )
            ) : (
              <>
                <EmptyInfo weight={500} size={14} height={20} color={fontColor}>
                  Connect wallet to see your positions.
                </EmptyInfo>
                <ConnectButtonStyle
                  color="connectwallet"
                  onClick={() => {
                    connectAction()
                  }}
                  minWidth="190px"
                  inputBorderColor={inputBorderColor}
                  fontColor2={fontColor2}
                  backColor={backColor}
                  bordercolor={fontColor}
                  disabled={disableWallet}
                  hoverColorButton={hoverColorButton}
                >
                  <img src={ConnectDisableIcon} className="connect-wallet" alt="" />
                  Connect Wallet
                </ConnectButtonStyle>
              </>
            )}
          </EmptyPanel>
        )}
      </TableContent>
    </TransactionDetails>
  )
}

export default HistoryData
