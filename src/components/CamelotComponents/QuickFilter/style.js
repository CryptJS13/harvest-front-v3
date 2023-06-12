import styled from 'styled-components'
import { Dropdown, Offcanvas } from 'react-bootstrap'
import HoverBack from '../../../assets/images/logos/camelot/hover_filter.svg'

const QuickFilterContainer = styled.div`
  display: flex;
  ${props =>
    props.justifyContent
      ? `
    justify-content: ${props.justifyContent};
  `
      : ''}
  ${props =>
    props.sub
      ? `
  `
      : `padding: 15px 0 0;`}
  
  &:first-child {
    padding: 0;
  }

  ${props =>
    props.position
      ? `
    position: ${props.position};
  `
      : ''}

  ${props =>
    props.width
      ? `
    width: ${props.width};
  `
      : ''}

  @media screen and (max-width: 1479px) {
    // display: block;
  }

  @media screen and (max-width: 950px) {
    background: white;
    padding: 30px;
    overflow: hidden;
    flex-direction: column;
    grid-gap: 20px;
  }

  @media screen and (max-width: 860px) {
    margin-bottom: 20px;
  }
`

const InputsContainer = styled.div`
  width: 100%;
  min-width: 25%;

  @media screen and (max-width: 950px) {
    width: 100%;
  }
`

const UserDropDown = styled(Dropdown.Toggle)`
  background: ${props => props.backcolor} !important;
  border: 1px solid ${props => props.bordercolor} !important;
  color: ${props => props.fontcolor} !important;
  border-radius: 10px;
  align-items: center;
  padding: 12px 15px !important;
  width: 100%;
  display: flex;
  text-align: left;
  position: relative;

  &:after {
    display: none !important;
  }

  &:hover {
    background: white;
    color: black;
    font-weight: 500;
  }

  &:active {
    background: green;
    color: black;
  }

  img {
    filter: ${props => props.filtercolor};
  }

  .chain-name {
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    margin-left: 5px;
  }

  img.narrow {
    position: absolute;
    right: 15px;
    top: 12px;
  }
`

const UserDropDownMenu = styled(Dropdown.Menu)`
  background: white;
  border: 1px solid #e9e9e9;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.05);
  border-radius: 0 0 12px 12px;
  padding: 0;
  min-width: 8rem;
  width: 100% !important;
`

const UserDropDownItem = styled(Dropdown.Item)`
  padding: 12px 15px !important;
  text-align: left;
  display: flex !important;
  background: white;
  color: #888e8f;
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  align-items: center;

  &:hover {
    background: #f6f6f6 !important;
    color: black;
    font-weight: 500;
  }

  img {
    margin-right: 5px;
  }
`

const DivWidth = styled.div`
  ${props =>
    props.width
      ? `
    width: ${props.width};
  `
      : 'width: auto;'}
  ${props =>
    props.marginRight
      ? `
    margin-right: ${props.marginRight};
  `
      : ''}
  ${props =>
    props.justifyContent
      ? `
    justify-content: ${props.justifyContent};
  `
      : ''}
  ${props =>
    props.display
      ? `
    display: ${props.display};
  `
      : ''}
  ${props =>
    props.padding
      ? `
    padding: ${props.padding};
  `
      : ''}
  ${props =>
    props.position
      ? `
    position: ${props.position};
  `
      : ''}
  ${props =>
    props.top
      ? `
    top: ${props.top}px;
  `
      : ''}
  ${props =>
    props.left
      ? `
    left: ${props.left}px;
  `
      : ''}
  ${props =>
    props.right
      ? `
    right: ${props.right}px;
  `
      : ''}
  ${props =>
    props.boxShadow
      ? `
    box-shadow: ${props.boxShadow};
  `
      : ''}
  ${props =>
    props.borderRadius
      ? `
    border-radius: ${props.borderRadius}px;
  `
      : ''}

  &.searchbar {
    width: 23%;
    position: absolute;
    border: none;
    top: ${props => (props.status === '1' ? `185px` : `100px`)};
    left: 20px;
  }

  &.chain {
    background: none;
  }
  transition: 0.25s;

  @media screen and (max-width: 1480px) {
    &.searchbar {
      position: absolute;
      top: ${props => (props.status === '1' ? `173px` : `83px`)};
    }

    position: unset;
  }

  @media screen and (max-width: 1280px) {
    &.searchbar {
      top: ${props => (props.status === '1' ? `158px` : `68px`)};
    }

    position: unset;
  }
`

const ChainButton = styled.button`
  align-items: center;
  width: 50px;
  height: 50px;
  border-radius: 12px;
  margin-right: 21px;
  border: 1px solid ${props => props.borderColor};
  background: ${props => props.backColor};

  padding: 7px 15px;
  display: flex;
  justify-content: center;

  transition: 0.25s;

  &:hover {
    background: ${props => props.hoverColor} !important;
    border-radius: 12px;
  }

  &.active {
    background: ${props => props.backColor};

    border-radius: 12px;

    img {
      opacity: 1;
    }
  }

  img {
    opacity: 0.3;
    width: 25px;
    height: 25px;
  }

  @media screen and (max-width: 1480px) {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    &.active {
      border-radius: 10px;
    }
    img {
      width: 20px;
      height: 20px;
    }
  }

  @media screen and (max-width: 1280px) {
    width: 32px;
    height: 32px;
    border-radius: 7px;
    &.active {
      border-radius: 7px;
    }
    img {
      width: 15px;
      height: 15px;
    }
  }
`

const ChainATag = styled.a`
  align-items: center;
  position: relative;
  width: 50px;
  height: 50px;
  border: none;
  border-radius: 12px;
  margin-right: 21px;
  padding: 7px 15px;
  display: flex;
  justify-content: center;
  transition: 0.25s;

  border: 1px solid ${props => props.borderColor};
  background: ${props => props.backColor};

  img.link {
    filter: ${props => props.filterColor};
  }

  &:hover {
    background: ${props => props.hoverColor} !important;
    border-radius: 12px;
  }

  &.active {
    background: ${props => props.backColor};
    border-radius: 12px;

    img {
      opacity: 1;
    }
  }

  img.link {
    position: absolute;
    top: 3px;
    right: 3px;
  }
`

const ClearFilter = styled.div`
  background: ${props => props.backColor};
  color: ${props => props.fontColor};
  border: 1px solid ${props => props.borderColor};
  font-size: 16px;
  font-weight: 500;
  line-height: 21px;
  padding: 10px 21px 9px 21px;
  border-radius: 10px;
  cursor: pointer;
  height: 100%;
  display: flex;
  transition: 0.25s;

  align-items: center;

  &:hover {
    color: #ff9400;
  }

  @media screen and (max-width: 1480px) {
    padding: 10px 15px;
    font-size: 12px;
    line-height: 16px;
  }

  @media screen and (max-width: 1280px) {
    padding: 5px 10px;
    font-size: 8px;
    line-height: 14px;
  }
`

const Counter = styled.div`
  ${props =>
    props.count > 0
      ? `
  background: #FF7E00;
  color: white;
  `
      : `
  background: #FF9400;
  color: #1F2937;
  `}
  width: 20px;
  height: 20px;
  border-radius: 5px;
  display: flex;
  justify-content: center;
  align-items: center;

  @media screen and (max-width: 1480px) {
    width: 15px;
    height: 15px;
  }

  @media screen and (max-width: 1280px) {
    width: 12px;
    height: 12px;
    border-radius: 3px;
  }

  @media screen and (max-width: 992px) {
    color: white;
  }
`

const WebView = styled.div`
  display: block;

  @media screen and (max-width: 992px) {
    display: none;
  }
`

const MobileView = styled.div`
  display: none;

  @media screen and (max-width: 992px) {
    display: flex;
    flex-direction: column;
    position: relative;
  }
`

const FarmButtonPart = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
  width: 100%;

  .dropdown {
    width: 100%;
  }

  #dropdown-basic {
    display: flex;
  }

  .show {
    .narrow {
      display: none;
    }
  }
`

const Filtersinput = styled.input`
  background: #ffffff;
  border: 0px;
  outline: 0;
  border-radius: 5px;
  color: #888e8f;
  padding: 12px 20px 12px 32px;
  width: 80%;
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;

  &:active {
    border: 0px;
  }
`

const FarmFiltersPart = styled.div`
  display: flex;
  justify-content: space-between;

  .filter-part {
    width: 48%;

    button {
      background: ${props => props.backColor};
      color: ${props => props.fontColor};
      width: 100%;
      border: 1px solid ${props => props.borderColor};
      border-radius: 5px;
      padding: 11px 64px 13px 15px;
      font-size: 12px;
      line-height: 16px;
      font-weight: 400;
      text-align: left;
    }

    img {
      margin-right: 5px;
      filter: ${props => props.filterColor};
    }
  }

  .clear-filter {
    width: 48%;
  }
`

const MobileListHeaderSearch = styled.div`
  position: absolute;
  width: 100%;
  bottom: -75px;
  padding: 0px 20px;

  .filter-sort {
    margin-top: 10px;
    background: #f5f5f5;
    border-radius: 5px;
    position: relative;
    color: #888e8f;

    input {
      background: #f5f5f5;
      width: 100%;
      border: 0px;
    }

    img {
      position: absolute;
      left: 10px;
      top: 12px;
    }
  }
`

const MobileClearFilter = styled(ClearFilter)`
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  width: 100%;
  border-radius: 5px;
  color: ${props => props.fontColor};
`

const FilterOffCanvas = styled(Offcanvas)`
  width: 300px !important;
  background: ${props => props.backcolor} !important;
`

const FilterOffCanvasHeader = styled(Offcanvas.Header)`
  padding: 19px 20px 19px 23px !important;
`

const FilterOffCanvasBody = styled(Offcanvas.Body)`
  padding: 19px 14px 19px 22px !important;

  &.filter-show {
    height: 100% !important;

    .show {
      .toggle {
        .narrow {
          display: none;
        }
      }
    }

    .asset-type {
      margin-bottom: 15px;
    }

    .toggle {
      display: flex;
      font-size: 12px;
      font-weight: 500;
      line-height: 16px;
      background: ${props => props.backcolor} !important;
      border: 1px solid ${props => props.bordercolor} !important;
      color: ${props => props.fontcolor} !important;
      border-radius: 5px;
      width: 100%;
      position: relative;
      padding: 13px 18px 15px 18px;

      img.narrow {
        position: absolute;
        right: 10px;
        top: 17px;
      }

      img {
        margin-right: 5px;
        filter: ${props => props.filtercolor};
      }

      &:after {
        display: none;
      }
    }

    .menu {
      font-size: 12px;
      font-weight: 500;
      line-height: 14px;
      width: 100%;
      background: ${props => props.backcolor};
      border: 1px solid ${props => props.bordercolor};

      .item {
        display: flex;
        padding: 13px 18px 15px 18px;
        color: ${props => props.fontcolor};
        img {
          margin-right: 6px;
          filter: ${props => props.filtercolor};
        }
      }

      .item.disabled {
        color: ${props => props.mobilefilterdisablecolor};
      }
    }
  }
`

const FarmFilter = styled.div`
  color: ${props => props.fontColor};
  font-weight: 700;
  font-size: 16px;
  line-height: 21px;

  img {
    margin-right: 15px;
  }
`

const BadgeText = styled.div`
  font-weight: 500;
  font-size: 5px;
  line-height: 7px;
  color: ${props => props.mobilefilterdisablecolor};
`

const CamelotButton = styled.button`
  background: url(${HoverBack});
  background-repeat: no-repeat;
  background-size: unset;
  color: white;

  padding: 11px 20px;
  border-radius: 0 7px 7px 0;
  border: none;

  img {
    margin-right: 10px;
  }

  &:hover {
    color: #ffab37;
    img {
      transition: 0.25s;
      filter: invert(57%) sepia(61%) saturate(2063%) hue-rotate(1deg) brightness(103%)
        contrast(105%);
    }
  }
  transition: 0.25s;
  &:active {
    color: white;
    img {
      filter: invert(57%) sepia(61%) saturate(2063%) hue-rotate(1deg) brightness(103%)
        contrast(105%);
    }
  }

  @media screen and (max-width: 1480px) {
    padding: 5px 10px;
    font-size: 12px;
    line-height: 16px;

    img {
      width: 18px;
      height: 18px;
    }
  }

  @media screen and (max-width: 1280px) {
    padding: 5px 10px;
    font-size: 8px;
    line-height: 14px;

    img {
      width: 10px;
      height: 10px;
    }
  }
`

export {
  QuickFilterContainer,
  InputsContainer,
  Counter,
  UserDropDown,
  UserDropDownItem,
  UserDropDownMenu,
  DivWidth,
  ChainButton,
  ClearFilter,
  WebView,
  MobileView,
  FarmButtonPart,
  Filtersinput,
  FarmFiltersPart,
  MobileClearFilter,
  MobileListHeaderSearch,
  FarmFilter,
  FilterOffCanvas,
  FilterOffCanvasHeader,
  FilterOffCanvasBody,
  ChainATag,
  BadgeText,
  CamelotButton,
}