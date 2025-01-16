import styled from 'styled-components'

const TransactionDetails = styled.div`
  width: 100%;
  border-radius: 15px;
  transition: 0.25s;
  margin-top: 20px;

  @media screen and (max-width: 992px) {
    height: ${props => props.hasData};
    margin-top: 24px;
  }
`

const TableContent = styled.div`
  @media screen and (max-width: 992px) {
    // overflow-x: scroll;
    /* border: 1px solid ${props => props.borderColor}; */
    ${props =>
      props.count === 0
        ? `
        border-radius: unset;
        border: none;
    `
        : ``}
  }
`

const ContentBox = styled.div`
  div.latest-yield-row:last-child {
    border-bottom-right-radius: 5px;
    border-bottom-left-radius: 5px;
  }

  @media screen and (max-width: 992px) {
    border: unset;
  }
`

const EmptyPanel = styled.div`
  height: ${props => props.height};
  position: relative;

  @media screen and (max-width: 992px) {
    padding: 0px;
    border: none;
    min-height: 100px;
  }
`

const FakeBoxWrapper = styled.div`
  height: 100%;
  overflow: hidden;
  filter: blur(4px);
`

const SkeletonItem = styled.div`
  padding: 22px 25px;
  display: grid;
  gap: 6px;

  .skeleton {
    display: flex;
    height: 10px;
  }
`

const EmptyInfo = styled.div`
  ${props =>
    props.weight
      ? `
    font-weight: ${props.weight};
  `
      : ''}
  ${props =>
    props.size
      ? `
    font-size: ${props.size}px;
  `
      : ''}
  ${props =>
    props.lineHeight
      ? `
    line-height: ${props.lineHeight}px;
  `
      : ''}
  ${props =>
    props.height
      ? `
    height: ${props.height};
  `
      : ''}
  ${props =>
    props.color
      ? `
    color: ${props.color};
  `
      : ''}
  ${props =>
    props.marginTop
      ? `
    margin-top: ${props.marginTop};
  `
      : ''}
  
  ${props =>
    props.gap
      ? `
    gap: ${props.gap};
  `
      : 'gap: 23px;'}

  display: flex;
  justify-content: center;
  text-align: center;
  align-items: center;
  position: absolute;
  width: 100%;
  z-index: 1;

  @media screen and (max-width: 992px) {
    display: flex;
    justify-content: center;
    flex-flow: column;
    font-size: 10px;
    line-height: 18px;
    padding-top: 35px;
  }
`

export {
  TransactionDetails,
  TableContent,
  ContentBox,
  EmptyPanel,
  FakeBoxWrapper,
  EmptyInfo,
  SkeletonItem,
}
