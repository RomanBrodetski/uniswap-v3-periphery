import { Fixture } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { v3RouterFixture } from './externalFixtures'
import { constants } from 'ethers'
import {
  IWETH9,
  MockTimeNonfungiblePositionManager,
  MockTimeSwapRouter,
  NonfungibleTokenPositionDescriptor,
  TestERC20,
  IUniswapV3Factory,
} from '../../typechain'

const completeFixture = async ([wallet]: any) => {
  const { weth9, factory, router } = await v3RouterFixture([wallet])

  const tokenFactory = await ethers.getContractFactory('TestERC20', wallet)
  console.log("inited token factory: ", wallet.address);
  const tokens: [TestERC20, TestERC20, TestERC20] = [
    (await tokenFactory.deploy(constants.MaxUint256.div(2))) as any, // do not use maxu256 to avoid overflowing
    (await tokenFactory.deploy(constants.MaxUint256.div(2))) as any,
    (await tokenFactory.deploy(constants.MaxUint256.div(2))) as any,
  ]

  console.log("TOKENS DEPLOYED");

  const nftDescriptorLibraryFactory = await ethers.getContractFactory('NFTDescriptor', wallet)
  const nftDescriptorLibrary = await nftDescriptorLibraryFactory.deploy()
  const positionDescriptorFactory = await ethers.getContractFactory('NonfungibleTokenPositionDescriptor', {
    libraries: {
      NFTDescriptor: nftDescriptorLibrary.address,
    },
  },)
  const nftDescriptor = (await positionDescriptorFactory.deploy(
    tokens[0].address,
    // 'ETH' as a bytes32 string
    '0x4554480000000000000000000000000000000000000000000000000000000000'
  )) as any

  console.log("DESCRIPTOR DEPLOYED");

  const positionManagerFactory = await ethers.getContractFactory('MockTimeNonfungiblePositionManager', wallet)
  const nft = (await positionManagerFactory.deploy(
    factory.address,
    weth9.address,
    nftDescriptor.address
  )) as any

  console.log("NFT POS MANAGER DEPLOYED");

  tokens.sort((a, b) => (a.address.toLowerCase() < b.address.toLowerCase() ? -1 : 1))

  return {
    weth9,
    factory,
    router,
    tokens,
    nft,
    nftDescriptor,
  }
}

export default completeFixture
