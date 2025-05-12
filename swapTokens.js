const { ethers } = require("ethers");

const SEPOLIA_URL = "https://sepolia.infura.io/v3/2f4613d5a37f4efdbd08429ec1fc2c0b"
const PKEY = ""
const CONTRACT_ADDRESS = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14"

const contractABI = [{
    "inputs": [
      { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
      { "internalType": "uint256", "name": "amountOutMin", "type": "uint256" },
      { "internalType": "address[]", "name": "path", "type": "address[]" },
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "deadline", "type": "uint256" }
    ],
    "name": "swapExactTokensForTokens",
    "outputs": [{ "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },{
    "inputs": [],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
]

async function main() {
  const provider = new ethers.JsonRpcProvider(SEPOLIA_URL)
  const wallet = new ethers.Wallet(PKEY, provider)

  console.log('Conta conectada:')
  console.log(wallet.address)

  console.log('Saldo em ETH: ')
  console.log(ethers.formatEther(await provider.getBalance(wallet.address)))

  const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet)

  const amountIn = ethers.parseEther("0.00002") 
  const amountOutMin = 0.2; 
  const path = [
    "0xb16F35c0Ae2912430DAc15764477E179D9B9EbEa",
    "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"  
  ];
  const deadline = Math.floor(Date.now() / 1000) + 240 

  try {
    const depositTx = await contract.deposit({
      value: amountIn,      
      gasLimit: 200000      
    })
    await depositTx.wait(); 
    console.log('WETH depositado:')
    console.log(depositTx.hash)
 
    const swapTx = await contract.swapExactTokensForTokens(
      amountIn,         
      amountOutMin,     
      path,            
      wallet.address,   
      deadline,         
      {
        gasLimit: 200000 
      }
    )

    const receipt = await swapTx.wait() 

    console.log('hash da transação:')
    console.log(swapTx.hash) // 
    console.log('gas usado na trasação:')
    console.log(receipt.gasUsed.toString())//

    const erc20abi = [
      "function balanceOf(address) view returns (uint256)",
      "function decimals() view returns (uint8)"
    ]
    const token = new ethers.Contract("0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", erc20abi, provider)
    const tokenBalance = await token.balanceOf(wallet.address)
    console.log('Saldo do token recebido:')
    console.log(ethers.formatUnits(tokenBalance, 18))

  } catch (error) {
    console.error("erro: ", error)
  }
}

main().catch(console.error)
