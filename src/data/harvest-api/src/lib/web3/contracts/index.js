const vaultMethods = require('../contracts/vault/methods')
const vaultContract = require('../contracts/vault/contract.json')

const controllerMethods = require('../contracts/controller/methods')
const controllerContract = require('../contracts/controller/contract.json')

const crvMethods = require('../contracts/crv/methods')
const crvContract = require('../contracts/crv/contract.json')

const crvYPoolMethods = require('../contracts/crv-ypool/methods')
const crvYPoolContract = require('../contracts/crv-ypool/contract.json')

const crvGaugeMethods = require('../contracts/crv-gauge/methods')
const crvGaugeContract = require('../contracts/crv-gauge/contract.json')

const balGaugeMethods = require('../contracts/bal-gauge/methods')
const balGaugeContract = require('../contracts/bal-gauge/contract.json')

const crvControllerMethods = require('../contracts/crv-controller/methods')
const crvControllerContract = require('../contracts/crv-controller/contract.json')

const idleControllerMethods = require('../contracts/idle-controller/methods')
const idleControllerContract = require('../contracts/idle-controller/contract.json')

const idleLendingTokenMethods = require('../contracts/idle-lending-token/methods')
const idleLendingTokenContract = require('../contracts/idle-lending-token/contract.json')

const poolMethods = require('../contracts/pool/methods')
const poolContract = require('../contracts/pool/contract.json')

const potPoolMethods = require('../contracts/pot-pool/methods')
const potPoolContract = require('../contracts/pot-pool/contract.json')

const tokenMethods = require('../contracts/token/methods')
const tokenContract = require('../contracts/token/contract.json')

const farmsteadUSDCMethods = require('../contracts/farmstead-usdc/methods')
const farmsteadUSDCContract = require('../contracts/farmstead-usdc/contract.json')

const balancerVaultMethods = require('../contracts/balancer-vault/methods')
const balancerVaultContract = require('../contracts/balancer-vault/contract.json')

const quickswapDualRewardMethods = require('../contracts/quickswap-dual-reward/methods')
const quickswapDualRewardContract = require('../contracts/quickswap-dual-reward/contract.json')

const uniNonFungibleManagerMethods = require('../contracts/uni-non-fungible-manager/methods')
const uniNonFungibleManagerContract = require('../contracts/uni-non-fungible-manager/contract.json')

const balTokenAdminMethods = require('../contracts/bal-token-admin/methods')
const balTokenAdminContract = require('../contracts/bal-token-admin/contract.json')

const balLpTokenMethods = require('../contracts/bal-lp-token/methods')
const balLpTokenContract = require('../contracts/bal-lp-token/contract.json')

const balBoostLpTokenMethods = require('../contracts/bal-boost-lp-token/methods')
const balBoostLpTokenContract = require('../contracts/bal-boost-lp-token/contract.json')

module.exports = {
  vault: {
    methods: vaultMethods,
    contract: vaultContract,
  },
  controller: {
    methods: controllerMethods,
    contract: controllerContract,
  },
  crv: {
    methods: crvMethods,
    contract: crvContract,
  },
  crvYPool: {
    methods: crvYPoolMethods,
    contract: crvYPoolContract,
  },
  crvGauge: {
    methods: crvGaugeMethods,
    contract: crvGaugeContract,
  },
  balGauge: {
    methods: balGaugeMethods,
    contract: balGaugeContract,
  },
  crvController: {
    methods: crvControllerMethods,
    contract: crvControllerContract,
  },
  idleController: {
    methods: idleControllerMethods,
    contract: idleControllerContract,
  },
  idleLendingToken: {
    methods: idleLendingTokenMethods,
    contract: idleLendingTokenContract,
  },
  token: {
    methods: tokenMethods,
    contract: tokenContract,
  },
  pool: {
    methods: poolMethods,
    contract: poolContract,
  },
  potPool: {
    methods: potPoolMethods,
    contract: potPoolContract,
  },
  farmsteadUSDC: {
    contract: farmsteadUSDCContract,
    methods: farmsteadUSDCMethods,
  },
  balancerVault: {
    contract: balancerVaultContract,
    methods: balancerVaultMethods,
  },
  quickswapDualReward: {
    contract: quickswapDualRewardContract,
    methods: quickswapDualRewardMethods,
  },
  uniNonFungibleManager: {
    contract: uniNonFungibleManagerContract,
    methods: uniNonFungibleManagerMethods,
  },
  balTokenAdmin: {
    contract: balTokenAdminContract,
    methods: balTokenAdminMethods,
  },
  balLpToken: {
    contract: balLpTokenContract,
    methods: balLpTokenMethods,
  },
  balBoostLpToken: {
    contract: balBoostLpTokenContract,
    methods: balBoostLpTokenMethods,
  },
}
