import styled from 'styled-components'

const ThemeMode = styled.div`
  display: flex;
  align-items: center;

  #theme-switch {
    position: relative;
    width: fit-content;
    height: fit-content;
    touch-action: pan-x;
    user-select: none;

    input {
      cursor: pointer;
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      opacity: 0;
    }

    .switch-track {
      background: #7f9bff;
      height: 16px;
      width: 32px;
      border-radius: 30px;
      transition: all 0.2s ease 0s;
    }
    .switch-thumb {
      background-size: cover;
      background-repeat: no-repeat;
      background-color: white;
      height: 14px;
      left: 1px;
      position: absolute;
      top: 1px;
      width: 14px;
      border-radius: 50%;
      transition: all 0.25s ease 0s;
    }

    &:hover .switch-thumb {
      box-shadow: 0 0 2px 3px #ff9400;
    }
  }

  ${props =>
    props.$mode === 'subscribe'
      ? `
      #theme-switch {
        .switch-check {
          opacity: 1;
        }
        .switch-x {
          opacity: 0;
        }
        .switch-thumb {
          left: 17px;
        }
        .switch-track {
          background: #5DCF46;
        } 
      }
    `
      : `
      #theme-switch {
        .switch-thumb {
        }
      }
    `}

  @media screen and (max-width: 992px) {
    #theme-switch {
      .switch-track {
        width: 24px;
        height: 12px;
      }

      .switch-thumb {
        width: 10px;
        height: 10px;
        top: 1px;
      }
    }

    ${props =>
      props.$mode === 'subscribe'
        ? `
        #theme-switch {
          .switch-thumb {
            left: 12px;
          }
      `
        : `
        #theme-switch {
        .switch-thumb {
          left: 2px;
        }
      `}
  }
`

const PanelHeader = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-size: cover;
  background-position: center;
`

const PanelTitle = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`

const RowDiv = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
  padding-left: 20px;
  padding-right: 20px;
`

const ColumnDiv = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  padding-left: 20px;
  padding-right: 20px;
  gap: 20px;
`

const GeneralDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin: 25px 20px 25px 0px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-track {
    background: ${props => (props.$darkmode === 'true' ? '#202325' : '#f2f5ff')};
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => (props.$darkmode === 'true' ? '#586269' : '#c4cbe1')};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${props => (props.$darkmode === 'true' ? '#6e7e89' : '#99a2bd')};
  }
`

const PanelTags = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  height: 28px;
  border-radius: 4.72px;
  gap: 7.86px;
  margin-top: 25px;
  margin-left: 20px;
  margin-right: 20px;
  background: #4040428c;
`

const MainTag = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 33%;
  border-radius: 4.72px;
  gap: 6.29px;
  cursor: pointer;
  ${props =>
    props.$active === 'true'
      ? `
      color: #fff;
      background: ${props.$backcolor};
      font-weight: 700;
    `
      : `
      color: #fff;
      background: transparent;
      font-weight: 700;
    `}
`

const PanelBalance = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-bottom: 0.7px solid ${props => props.$bordercolor};
`

const PanelSubscribe = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px 25px;
`

const BasePanelBox = styled.div`
  width: 450px;
  height: 490px;
  margin-top: 25px;
  display: flex;
  flex-direction: column;
  /* key: ${props => props.key}; */
  border: 1px solid ${props => props.$bordercolor};
  ${props =>
    props.$borderradius
      ? `
    border-radius: ${props.$borderradius};
  `
      : ''}
  ${props =>
    props.$margintop
      ? `
    margin-top: ${props.$margintop};
  `
      : ''}

  ${props =>
    props.$marginbottom
      ? `
    margin-bottom: ${props.$marginbottom};
  `
      : ''}

  @media screen and (max-width: 1820px) {
    width: 420px;
  }

  @media screen and (max-width: 1710px) {
    width: 400px;
  }

  @media screen and (max-width: 1650px) {
    width: 380px;
  }

  @media screen and (max-width: 1600px) {
    width: 360px;
  }

  @media screen and (max-width: 1540px) {
    width: 340px;
  }

  @media screen and (max-width: 1420px) {
    width: 450px;
  }

  @media screen and (max-width: 1260px) {
    width: 420px;
  }

  @media screen and (max-width: 1190px) {
    width: 400px;
  }

  @media screen and (max-width: 1140px) {
    width: 380px;
  }

  @media screen and (max-width: 1100px) {
    width: 360px;
  }

  @media screen and (max-width: 1060px) {
    width: 450px;
    margin: 25px auto 0px auto;
  }
`

const ApyInfo = styled.div`
  display: flex;
  flex-direction: column;
  margin: 20px 0 20px 30px;
  justify-content: center;
`

const PilotInfoClose = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;

  svg.pilot-info {
    position: absolute;
    cursor: pointer;
    top: 0;
    right: 0;
    width: 16px;
    height: 16px;
    margin-top: 25px;
    margin-right: 20px;
  }
`

const NewLabel = styled.div`
  ${props =>
    props.$padding
      ? `
    padding: ${props.$padding};
  `
      : ''}
  ${props =>
    props.$fontcolor
      ? `
    color: ${props.$fontcolor};
  `
      : ''}
  ${props =>
    props.$weight
      ? `
    font-weight: ${props.$weight};
  `
      : ''}
  ${props =>
    props.$size
      ? `
    font-size: ${props.$size};
  `
      : ''}
  ${props =>
    props.$height
      ? `
    line-height: ${props.$height};
  `
      : ''}
  ${props =>
    props.$position
      ? `
    position: ${props.$position};
  `
      : ''}
  ${props =>
    props.$justifycontent
      ? `
    justify-content: ${props.$justifycontent};
  `
      : ''}
  ${props =>
    props.$margintop
      ? `
    margin-top: ${props.$margintop};
  `
      : ''}
  ${props =>
    props.$marginbottom
      ? `
    margin-bottom: ${props.$marginbottom};
  `
      : ''}

  ${props =>
    props.$marginleft
      ? `
    margin-left: ${props.$marginleft};
  `
      : ''}
  
  ${props =>
    props.$marginright
      ? `
    margin-right: ${props.$marginright};
  `
      : ''}
  ${props =>
    props.$display
      ? `
    display: ${props.$display};
  `
      : ''}
  ${props =>
    props.$flexflow
      ? `
    flex-flow: ${props.$flexflow};
  `
      : ''}
  ${props =>
    props.$padding
      ? `
    padding: ${props.$padding};
  `
      : ''}
  ${props =>
    props.$items
      ? `
    align-items: ${props.$items};
  `
      : ''}
  
  ${props =>
    props.$border
      ? `
    border: ${props.$border};
  `
      : ''}

   ${props =>
    props.$borderbottom
      ? `
      border-bottom: ${props.$borderbottom};
    `
      : ''}

  ${props =>
    props.$borderradius
      ? `
    border-radius: ${props.$borderradius};
  `
      : ''}

  ${props =>
    props.$cursor
      ? `
    cursor: ${props.$cursor};
  `
      : ''}

  svg.question {
    font-size: 16px;
    color: ${props => props.$fontcolor};
    cursor: pointer;
    margin: auto 0px auto 5px;
  }

  #min-received {
    max-width: 300px;
  }

  img.info-icon {
    margin-right: 12px;
    width: 20px;
    height: 20px;
  }

  span.token-symbol {
    font-weight: 400;
    font-size: 10px;
    line-height: 12px;
  }

  a.audit-link {
    text-decoration: underline;
    cursor: pointer;
    color: unset;
    font-weight: unset;
  }
`

const FlexDiv = styled.div`
  display: flex;

  ${props =>
    props.$width
      ? `
      width: ${props.$width};
    `
      : ''}

  ${props =>
    props.$gap
      ? `
      gap: ${props.$gap};
    `
      : ''}

  ${props =>
    props.$padding
      ? `
      padding: ${props.$padding};
    `
      : ''}

  ${props =>
    props.$margintop
      ? `
    margin-top: ${props.$margintop};
  `
      : ''}

  ${props =>
    props.$marginbottom
      ? `
    margin-bottom: ${props.$marginbottom};
  `
      : ''}

  ${props =>
    props.$justifycontent
      ? `
    justify-content: ${props.$justifycontent};
  `
      : ''}

  ${props =>
    props.$borderbottom
      ? `
    border-bottom: ${props.$borderbottom};
  `
      : ''}

  ${props =>
    props.$flexdirection
      ? `
    flex-direction: ${props.$flexdirection};
  `
      : ''}
`

const TokenInput = styled.div`
  position: relative;
  width: 195px;
  input[type='text'] {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: textfield;
  }

  input[type='text']::-webkit-outer-spin-button,
  input[type='text']::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`

const TokenAmount = styled.input`
  font-weight: 600;
  font-size: 14px;
  line-height: 24px;
  width: 100%;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  background: ${props => props.$bgcolor};
  border: 1px solid #d7dffa8c;
  outline: 0;
  padding: 7px 14px 7px 14px;
  border-radius: 8px;
  color: ${props => props.$fontcolor2};
  transition: 0.25s;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: textfield;
    margin: 0;
  }
`

const TokenUSDAmount = styled.div`
  position: absolute;
  right: 12px;
  bottom: 10px;
  font-size: 12px;
  color: ${props => props.$fontcolor3};
  font-weight: 400;
`

const TokenType = styled.div`
  position: relative;
  border: 1px solid #d7dffa8c;
  border-radius: 9px;
  width: 195px;
  img.token-symbol {
    position: absolute;
    left: 12px;
    bottom: 7px;
  }
`

const TokenName = styled.div`
  position: absolute;
  left: 50px;
  bottom: 10px;
  font-size: 12px;
  color: ${props => props.$fontcolor3};
  font-weight: 400;
`

const SwitchMode = styled.div`
  display: flex;
  align-items: center;

  #theme-switch {
    position: relative;
    width: fit-content;
    height: fit-content;
    touch-action: pan-x;
    user-select: none;

    input {
      cursor: pointer;
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      opacity: 0;
    }

    .switch-track {
      background: #7f9bff;
      height: 16px;
      width: 32px;
      border-radius: 30px;
      transition: all 0.2s ease 0s;
    }
    .switch-thumb {
      background-size: cover;
      background-repeat: no-repeat;
      background-color: white;
      height: 14px;
      left: 1px;
      position: absolute;
      top: 1px;
      width: 14px;
      border-radius: 50%;
      transition: all 0.25s ease 0s;
    }

    &:hover .switch-thumb {
      box-shadow: 0 0 2px 3px #ff9400;
    }
  }

  ${props =>
    props.$mode === 'apy'
      ? `
      #theme-switch {
        .switch-check {
          opacity: 1;
        }
        .switch-x {
          opacity: 0;
        }
        .switch-thumb {
          left: 17px;
        }
        .switch-track {
          background: #5DCF46;
        }
      }
    `
      : `
      #theme-switch {
        .switch-thumb {
        }
      }
    `}

  @media screen and (max-width: 992px) {
    #theme-switch {
      .switch-track {
        width: 24px;
        height: 12px;
      }

      .switch-thumb {
        width: 10px;
        height: 10px;
        top: 1px;
      }
    }

    ${props =>
      props.$mode === 'apy'
        ? `
        #theme-switch {
          .switch-thumb {
            left: 12px;
          }
      `
        : `
        #theme-switch {
        .switch-thumb {
          left: 2px;
        }
      `}
  }
`

export {
  ThemeMode,
  PanelHeader,
  RowDiv,
  ColumnDiv,
  PanelTitle,
  GeneralDiv,
  PanelTags,
  MainTag,
  BasePanelBox,
  ApyInfo,
  NewLabel,
  PilotInfoClose,
  PanelBalance,
  FlexDiv,
  PanelSubscribe,
  TokenInput,
  TokenAmount,
  TokenUSDAmount,
  TokenType,
  TokenName,
  SwitchMode,
}
