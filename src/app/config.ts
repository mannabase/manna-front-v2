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

