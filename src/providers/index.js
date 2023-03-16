import React from 'react'
import { Web3ReactProvider } from '@web3-react/core'
import { ethers } from 'ethers'
import { ConnectButton, getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { chain, configureChains, createClient, WagmiConfig } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { WalletProvider } from './Wallet'
import { ContractsProvider } from './Contracts'
import { PoolsProvider } from './Pools'
import { VaultsProvider } from './Vault'
import { ActionsProvider } from './Actions'
import { StatsProvider } from './Stats'
import { ThemeProvider } from './useThemeContext'
import '@rainbow-me/rainbowkit/dist/index.css'

const { chains, provider } = configureChains(
  [chain.mainnet, chain.polygon, chain.optimism, chain.arbitrum],
  [alchemyProvider({ alchemyId: process.env.REACT_APP_INFURA_KEY }), publicProvider()],
)

const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  chains,
})

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
})

const getLibrary = provider => {
  const library = new ethers.providers.Web3Provider(provider)
  library.pollingInterval = 8000
  return library
}

const Providers = ({ children }) => (
  <Web3ReactProvider getLibrary={getLibrary}>
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <ContractsProvider>
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              authenticationStatus,
              mounted,
            }) => {
              // Note: If your app doesn't use authentication, you
              // can remove all 'authenticationStatus' checks
              const ready = mounted && authenticationStatus !== 'loading'
              const connected =
                ready &&
                account &&
                chain &&
                (!authenticationStatus || authenticationStatus === 'authenticated')
              const address = account ? account.address : null
              return (
                <WalletProvider
                  accountAddress={address}
                  connectedStatus={connected}
                  chainObj={chain}
                  openConnectModal={openConnectModal}
                  openAccountModal={openAccountModal}
                  openChainModal={openChainModal}
                >
                  <PoolsProvider>
                    <VaultsProvider>
                      <ActionsProvider>
                        <StatsProvider>
                          <ThemeProvider>{children}</ThemeProvider>
                        </StatsProvider>
                      </ActionsProvider>
                    </VaultsProvider>
                  </PoolsProvider>
                </WalletProvider>
              )
            }}
          </ConnectButton.Custom>
        </ContractsProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  </Web3ReactProvider>
)

export default Providers
