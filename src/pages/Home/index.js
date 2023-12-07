import React from 'react'
import { useHistory } from 'react-router-dom'
import { useThemeContext } from '../../providers/useThemeContext'
import {
  Container,
  Inner,
  FirstPart,
  FirstBack,
  Title,
  Desc,
  SecondPart,
  FirstFarmingPart,
  AdvancedFarms,
  FirstFarmTitle,
  FirstFarmDesc,
  AdvancedTitle,
  AdvancedDesc,
} from './style'
import { ROUTES } from '../../constants'

const Home = () => {
  const { push } = useHistory()
  const { pageBackColor, fontColor } = useThemeContext()

  return (
    <Container pageBackColor={pageBackColor} fontColor={fontColor}>
      <Inner>
        <FirstPart>
          <FirstBack
            onClick={() => {
              push(ROUTES.BEGINNERS)
            }}
          >
            <Title>Farms for Beginners</Title>
            <Desc>Become a crypto farmer today.</Desc>
          </FirstBack>
        </FirstPart>
        <SecondPart>
          <FirstFarmingPart>
            <FirstFarmTitle>New to Crypto Farming?</FirstFarmTitle>
            <FirstFarmDesc>Get started with crypto farming at ease.</FirstFarmDesc>
          </FirstFarmingPart>
          <AdvancedFarms
            onClick={() => {
              push(ROUTES.ADVANCED)
            }}
          >
            <AdvancedTitle>Advanced Farms</AdvancedTitle>
            <AdvancedDesc>Over 100 farms to explore.</AdvancedDesc>
          </AdvancedFarms>
        </SecondPart>
      </Inner>
    </Container>
  )
}

export default Home
