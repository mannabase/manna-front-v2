export let mannaChainId: number = 42161
export let mannaChainName: string = "Arbitrum"

export let chainConfig = {
    method: 'wallet_addEthereumChain',
    params: [
        {
            chainId: '0xa4b1',
            chainName: 'Arbitrum',
            nativeCurrency: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18,
            },
            rpcUrls: ["https://arb1.arbitrum.io/rpc"],
            blockExplorerUrls: ["https://arbiscan.io/"],
        },
    ],
}

export let serverUrl = 'https://mannatest.hedgeforhumanity.org/backend/';

export let mannaContractAddress = '0xC0DE5623db360495Fc67af4eB03313A42360eC23';
export let claimMannaContractAddress = '0xeb2873A6ee9786C1EfD715DF0D62C34BE2Fd5D27';
export let mannaBrightIDContractAddress = '0x1b7705B07229D238F045B2b3a13688fb50B737Ed';