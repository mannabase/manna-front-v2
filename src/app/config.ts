export let mannaChainId: bigint = 5n
export let mannaChainName: string = "Goerli"

export let chainConfig = {
    method: 'wallet_addEthereumChain',
    params: [
        {
            chainId: '0x5',
            chainName: 'Goerli',
            nativeCurrency: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18,
            },
            rpcUrls: ["https://rpc.ankr.com/eth_goerli"],
            blockExplorerUrls: ["https://goerli.etherscan.io"],
        },
    ],
}
// export let chainConfig = {
//     method: 'wallet_addEthereumChain',
//     params: [
//         {
//             chainId: '0xa4b1',
//             chainName: 'Arbitrum',
//             nativeCurrency: {
//                 name: 'Ethereum',
//                 symbol: 'ETH',
//                 decimals: 18,
//             },
//             rpcUrls: ["https://arb1.arbitrum.io/rpc"],
//             blockExplorerUrls: ["https://arbiscan.io/"],
//         },
//     ],
// }

export let mannaContractAddress = '0x5B47C7D32db51D03341840cDC3297557BFd8468b'
export let claimMannaContractAddress = '0x0De3040dE77Da1D6ECBCddBb3e3a9Dc73528F24d'

export let mannaContractABI = [{"inputs": [], "stateMutability": "nonpayable", "type": "constructor"}, {
    "inputs": [],
    "name": "AccessControlBadConfirmation",
    "type": "error",
}, {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}, {
        "internalType": "bytes32",
        "name": "neededRole",
        "type": "bytes32",
    }], "name": "AccessControlUnauthorizedAccount", "type": "error",
}, {
    "inputs": [{"internalType": "address", "name": "spender", "type": "address"}, {
        "internalType": "uint256",
        "name": "allowance",
        "type": "uint256",
    }, {"internalType": "uint256", "name": "needed", "type": "uint256"}],
    "name": "ERC20InsufficientAllowance",
    "type": "error",
}, {
    "inputs": [{"internalType": "address", "name": "sender", "type": "address"}, {
        "internalType": "uint256",
        "name": "balance",
        "type": "uint256",
    }, {"internalType": "uint256", "name": "needed", "type": "uint256"}],
    "name": "ERC20InsufficientBalance",
    "type": "error",
}, {
    "inputs": [{"internalType": "address", "name": "approver", "type": "address"}],
    "name": "ERC20InvalidApprover",
    "type": "error",
}, {
    "inputs": [{"internalType": "address", "name": "receiver", "type": "address"}],
    "name": "ERC20InvalidReceiver",
    "type": "error",
}, {
    "inputs": [{"internalType": "address", "name": "sender", "type": "address"}],
    "name": "ERC20InvalidSender",
    "type": "error",
}, {
    "inputs": [{"internalType": "address", "name": "spender", "type": "address"}],
    "name": "ERC20InvalidSpender",
    "type": "error",
}, {"inputs": [], "name": "EnforcedPause", "type": "error"}, {
    "inputs": [],
    "name": "ExpectedPause",
    "type": "error",
}, {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "address", "name": "owner", "type": "address"}, {
        "indexed": true,
        "internalType": "address",
        "name": "spender",
        "type": "address",
    }, {"indexed": false, "internalType": "uint256", "name": "value", "type": "uint256"}],
    "name": "Approval",
    "type": "event",
}, {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "address", "name": "from", "type": "address"}, {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256",
    }],
    "name": "Burned",
    "type": "event",
}, {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "address", "name": "to", "type": "address"}, {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256",
    }],
    "name": "Minted",
    "type": "event",
}, {
    "anonymous": false,
    "inputs": [{"indexed": false, "internalType": "address", "name": "account", "type": "address"}],
    "name": "Paused",
    "type": "event",
}, {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "bytes32", "name": "role", "type": "bytes32"}, {
        "indexed": true,
        "internalType": "bytes32",
        "name": "previousAdminRole",
        "type": "bytes32",
    }, {"indexed": true, "internalType": "bytes32", "name": "newAdminRole", "type": "bytes32"}],
    "name": "RoleAdminChanged",
    "type": "event",
}, {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "bytes32", "name": "role", "type": "bytes32"}, {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address",
    }, {"indexed": true, "internalType": "address", "name": "sender", "type": "address"}],
    "name": "RoleGranted",
    "type": "event",
}, {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "bytes32", "name": "role", "type": "bytes32"}, {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address",
    }, {"indexed": true, "internalType": "address", "name": "sender", "type": "address"}],
    "name": "RoleRevoked",
    "type": "event",
}, {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "address", "name": "from", "type": "address"}, {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address",
    }, {"indexed": false, "internalType": "uint256", "name": "value", "type": "uint256"}],
    "name": "Transfer",
    "type": "event",
}, {
    "anonymous": false,
    "inputs": [{"indexed": false, "internalType": "address", "name": "account", "type": "address"}],
    "name": "Unpaused",
    "type": "event",
}, {
    "inputs": [],
    "name": "BURNER_ROLE",
    "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
    "stateMutability": "view",
    "type": "function",
}, {
    "inputs": [],
    "name": "DEFAULT_ADMIN_ROLE",
    "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
    "stateMutability": "view",
    "type": "function",
}, {
    "inputs": [],
    "name": "MINTER_ROLE",
    "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
    "stateMutability": "view",
    "type": "function",
}, {
    "inputs": [],
    "name": "PAUSER_ROLE",
    "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
    "stateMutability": "view",
    "type": "function",
}, {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}, {
        "internalType": "address",
        "name": "spender",
        "type": "address",
    }],
    "name": "allowance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function",
}, {
    "inputs": [{"internalType": "address", "name": "spender", "type": "address"}, {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256",
    }],
    "name": "approve",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function",
}, {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function",
}, {
    "inputs": [{"internalType": "address", "name": "from", "type": "address"}, {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256",
    }], "name": "burn", "outputs": [], "stateMutability": "nonpayable", "type": "function",
}, {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function",
}, {
    "inputs": [{"internalType": "bytes32", "name": "role", "type": "bytes32"}],
    "name": "getRoleAdmin",
    "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
    "stateMutability": "view",
    "type": "function",
}, {
    "inputs": [{"internalType": "bytes32", "name": "role", "type": "bytes32"}, {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256",
    }],
    "name": "getRoleMember",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function",
}, {
    "inputs": [{"internalType": "bytes32", "name": "role", "type": "bytes32"}],
    "name": "getRoleMemberCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function",
}, {
    "inputs": [{"internalType": "bytes32", "name": "role", "type": "bytes32"}, {
        "internalType": "address",
        "name": "account",
        "type": "address",
    }], "name": "grantRole", "outputs": [], "stateMutability": "nonpayable", "type": "function",
}, {
    "inputs": [{"internalType": "bytes32", "name": "role", "type": "bytes32"}, {
        "internalType": "address",
        "name": "account",
        "type": "address",
    }],
    "name": "hasRole",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function",
}, {
    "inputs": [{"internalType": "address", "name": "to", "type": "address"}, {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256",
    }], "name": "mint", "outputs": [], "stateMutability": "nonpayable", "type": "function",
}, {
    "inputs": [],
    "name": "name",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function",
}, {"inputs": [], "name": "pause", "outputs": [], "stateMutability": "nonpayable", "type": "function"}, {
    "inputs": [],
    "name": "paused",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function",
}, {
    "inputs": [{"internalType": "bytes32", "name": "role", "type": "bytes32"}, {
        "internalType": "address",
        "name": "callerConfirmation",
        "type": "address",
    }], "name": "renounceRole", "outputs": [], "stateMutability": "nonpayable", "type": "function",
}, {
    "inputs": [{"internalType": "bytes32", "name": "role", "type": "bytes32"}, {
        "internalType": "address",
        "name": "account",
        "type": "address",
    }], "name": "revokeRole", "outputs": [], "stateMutability": "nonpayable", "type": "function",
}, {
    "inputs": [{"internalType": "bytes4", "name": "interfaceId", "type": "bytes4"}],
    "name": "supportsInterface",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function",
}, {
    "inputs": [],
    "name": "symbol",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function",
}, {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function",
}, {
    "inputs": [{"internalType": "address", "name": "to", "type": "address"}, {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256",
    }],
    "name": "transfer",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function",
}, {
    "inputs": [{"internalType": "address", "name": "from", "type": "address"}, {
        "internalType": "address",
        "name": "to",
        "type": "address",
    }, {"internalType": "uint256", "name": "value", "type": "uint256"}],
    "name": "transferFrom",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function",
}, {"inputs": [], "name": "unPause", "outputs": [], "stateMutability": "nonpayable", "type": "function"}]
export let claimMannaContractABI = [{"inputs": [], "name": "EnforcedPause", "type": "error"}, {
    "inputs": [],
    "name": "ExpectedPause",
    "type": "error",
}, {"inputs": [], "name": "InvalidInitialization", "type": "error"}, {
    "inputs": [],
    "name": "NotInitializing",
    "type": "error",
}, {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
    "name": "OwnableInvalidOwner",
    "type": "error",
}, {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "OwnableUnauthorizedAccount",
    "type": "error",
}, {
    "anonymous": false,
    "inputs": [{"indexed": false, "internalType": "uint64", "name": "version", "type": "uint64"}],
    "name": "Initialized",
    "type": "event",
}, {
    "anonymous": false,
    "inputs": [{"indexed": false, "internalType": "address", "name": "addr", "type": "address"}],
    "name": "MannaTokenSet",
    "type": "event",
}, {
    "anonymous": false,
    "inputs": [{"indexed": false, "internalType": "uint256", "name": "maxClaimable", "type": "uint256"}],
    "name": "MaxClaimableSet",
    "type": "event",
}, {
    "anonymous": false,
    "inputs": [{
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address",
    }, {"indexed": true, "internalType": "address", "name": "newOwner", "type": "address"}],
    "name": "OwnershipTransferred",
    "type": "event",
}, {
    "anonymous": false,
    "inputs": [{"indexed": false, "internalType": "address", "name": "account", "type": "address"}],
    "name": "Paused",
    "type": "event",
}, {
    "anonymous": false,
    "inputs": [{"indexed": false, "internalType": "uint256", "name": "scoreThreshold", "type": "uint256"}],
    "name": "ScoreThresholdSet",
    "type": "event",
}, {
    "anonymous": false,
    "inputs": [{"indexed": false, "internalType": "address", "name": "signatureVerifier", "type": "address"}],
    "name": "SignatureVerifierSet",
    "type": "event",
}, {
    "anonymous": false,
    "inputs": [{"indexed": false, "internalType": "address", "name": "account", "type": "address"}],
    "name": "Unpaused",
    "type": "event",
}, {
    "anonymous": false,
    "inputs": [{"indexed": false, "internalType": "uint256", "name": "checkPeriod", "type": "uint256"}],
    "name": "UserScoreValidPeriodSet",
    "type": "event",
}, {
    "inputs": [],
    "name": "claim",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function",
}, {
    "inputs": [{
        "components": [{"internalType": "uint256", "name": "day", "type": "uint256"}, {
            "internalType": "uint8",
            "name": "v",
            "type": "uint8",
        }, {"internalType": "bytes32", "name": "r", "type": "bytes32"}, {
            "internalType": "bytes32",
            "name": "s",
            "type": "bytes32",
        }], "internalType": "struct CheckinSignature[]", "name": "sigs", "type": "tuple[]",
    }],
    "name": "claimWithSigs",
    "outputs": [{"internalType": "uint256", "name": "claimed", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function",
}, {
    "inputs": [{"internalType": "address", "name": "addr", "type": "address"}],
    "name": "claimable",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function",
}, {
    "inputs": [{"internalType": "address", "name": "mannaAddr", "type": "address"}, {
        "internalType": "address",
        "name": "_signatureVerifier",
        "type": "address",
    }], "name": "initialize", "outputs": [], "stateMutability": "nonpayable", "type": "function",
}, {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "lastClaim",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function",
}, {
    "inputs": [],
    "name": "mannaToken",
    "outputs": [{"internalType": "contract IManna", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function",
}, {
    "inputs": [],
    "name": "maxClaimable",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function",
}, {
    "inputs": [],
    "name": "owner",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function",
}, {
    "inputs": [],
    "name": "paused",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function",
}, {
    "inputs": [],
    "name": "register",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function",
}, {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "registered",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function",
}, {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function",
}, {
    "inputs": [],
    "name": "scoreThreshold",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function",
}, {
    "inputs": [{"internalType": "address", "name": "addr", "type": "address"}],
    "name": "setMannaToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function",
}, {
    "inputs": [{"internalType": "uint256", "name": "maxClaimable_", "type": "uint256"}],
    "name": "setMaxClaimable",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function",
}, {
    "inputs": [{"internalType": "uint256", "name": "_scoreThreshold", "type": "uint256"}],
    "name": "setScoreThreshold",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function",
}, {
    "inputs": [{"internalType": "address", "name": "_signatureVerifier", "type": "address"}],
    "name": "setSignatureVerifier",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function",
}, {
    "inputs": [{"internalType": "uint256", "name": "period", "type": "uint256"}],
    "name": "setUserScoreValidPeriod",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function",
}, {
    "inputs": [],
    "name": "signatureVerifier",
    "outputs": [{"internalType": "contract ISignatureVerifier", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function",
}, {
    "inputs": [{
        "internalType": "uint256",
        "name": "score",
        "type": "uint256",
    }, {
        "components": [{"internalType": "uint256", "name": "timestamp", "type": "uint256"}, {
            "internalType": "uint8",
            "name": "v",
            "type": "uint8",
        }, {"internalType": "bytes32", "name": "r", "type": "bytes32"}, {
            "internalType": "bytes32",
            "name": "s",
            "type": "bytes32",
        }], "internalType": "struct VerificationSignature", "name": "sig", "type": "tuple",
    }], "name": "submitScore", "outputs": [], "stateMutability": "nonpayable", "type": "function",
}, {
    "inputs": [{"internalType": "address", "name": "newOwner", "type": "address"}],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function",
}, {
    "inputs": [],
    "name": "userScoreValidPeriod",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function",
}, {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "userScores",
    "outputs": [{"internalType": "uint256", "name": "timestamp", "type": "uint256"}, {
        "internalType": "uint256",
        "name": "score",
        "type": "uint256",
    }],
    "stateMutability": "view",
    "type": "function",
}]

export let serverUrl = 'https://mannatest.hedgeforhumanity.org/backend'

export const externalLinks = {
    twitterUrl: "https://twitter.com/mannatoken",
    discordUrl: "https://discord.com/invite/HjHBYkfSfJ",
    mediumUrl: "https://hedgeforhumanity.medium.com/",
    emailUrl: "https://mail@mannabase.com",
}
