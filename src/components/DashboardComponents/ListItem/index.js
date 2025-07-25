import React from 'react'
import { useThemeContext } from '../../../providers/useThemeContext'
import { Container, Content, Label } from './style'
import AnimatedDots from '../../AnimatedDots'

const ListItem = ({ weight, size, height, color, label, icon, value, marginBottom, marginTop }) => {
  const { fontColor } = useThemeContext()
  return (
    <Container $fontcolor={fontColor} $marginbottom={marginBottom} $margintop={marginTop}>
      {label ? (
        <Label>
          {icon && icon !== '' ? (
            <img src={`${icon.toLowerCase()}.svg`} width="16px" height="16px" alt="" />
          ) : (
            <></>
          )}
          <Content $weight={weight} $size={size} $height={height} $fontcolor={color}>
            {label}
          </Content>
        </Label>
      ) : (
        ''
      )}
      {value ? (
        value === '-1' ? (
          <Content $height={height}>
            <AnimatedDots />
          </Content>
        ) : (
          <Content $weight={weight} $size={size} $height={height} $fontcolor={color}>
            {value}
          </Content>
        )
      ) : (
        ''
      )}
    </Container>
  )
}
export default ListItem
