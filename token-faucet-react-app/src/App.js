import { useState } from "react";
import Web3 from "web3";
import Web3EthContract from "web3-eth-contract"
import CONTRACT_ABI from "./abiv1.json"

const CHAIN_ID = "0x5";
const CHAIN_NAME = "Goerli";
const CONTRACT_ADDRESS = "0x8a9BCa1EE8cba53b0372C07F0aA39CDdF9f57217";

function App() {
  const [isConnected, setIsConnected] = useState(false);

  async function connectWallet() {
    if (!window.ethereum) {
        alert("No injected provider found. Install Metamask.");
    } else {
        try {
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
            const account = accounts[0];
  
            const chainId = await window.ethereum.request({
                method: "eth_chainId",
            });
  
            if (chainId !== CHAIN_ID) {
                alert("Connected to wrong chain! Please change to " + CHAIN_NAME)
            } else {
                alert("Connected to account: " + String(account) + " and chainID: " + String(chainId));
                setIsConnected(true);
            }
  
        } catch {
            alert("Something went wrong connecting. Refresh and try again.");
        }
    }
  }
  
  async function donate() {
    const web3 = new Web3(window.ethereum);
    let gasPriceEstimate = await web3.eth.getGasPrice();
    console.log({gasPriceEstimate1: gasPriceEstimate});
    gasPriceEstimate = String(gasPriceEstimate)
    console.log({gasPriceEstimate2: gasPriceEstimate});
    let firstDigit = Array.from(gasPriceEstimate)[0];
    firstDigit = Number(firstDigit)
    firstDigit *= 3
    gasPriceEstimate = String(firstDigit) + gasPriceEstimate.substring(1)
    gasPriceEstimate += "00";
    console.log({gasPriceEstimate3: gasPriceEstimate});

    try {
      await web3.eth.sendTransaction({
        from: window.ethereum.selectedAddress,
        to: CONTRACT_ADDRESS,
        value: web3.utils.toWei(".1", "ether"),
        gasPrice: gasPriceEstimate
      })
    } catch (error) {
      console.log(error)
      alert("Tx failed. Canceled or wrong wallet")
      return;
    }
  }

  async function withdraw() {
    console.log("CONTRACT_ABI: ", CONTRACT_ABI);
    // Web3EthContract.SetProvider(window.ethereum);
    const web3 = new Web3(window.ethereum);
    let SmartContractObj = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
    console.log("SmartContractObj", SmartContractObj);

    let gasLimitEstimate;
    try{
      gasLimitEstimate = await SmartContractObj.methods.withdraw(web3.utils.toWei(".1", "ether")).estimateGas({
        from: window.ethereum.selectedAddress,
        to: CONTRACT_ADDRESS
      });

    } catch (error) {
        console.log({error: error})
        alert("Error estimating gas limit");
        return;
      }
      console.log({gasLimitEstimate: gasLimitEstimate})
      gasLimitEstimate = Math.round(1.2*Number(String(gasLimitEstimate)))
      console.log({gasLimitEstimate2: gasLimitEstimate})
      
      let gasPriceEstimate = await web3.eth.getGasPrice();
      gasPriceEstimate = Math.round(1.2*Number(String(gasPriceEstimate)))
      gasPriceEstimate = String(gasPriceEstimate)

      let firstDigit = Array.from(gasPriceEstimate)[0];
      firstDigit = Number(firstDigit)
      firstDigit *= 18
      gasPriceEstimate = String(firstDigit) + gasPriceEstimate.substring(1)
      gasPriceEstimate += "0".repeat(6);
      console.log({gasPriceEstimate3: gasPriceEstimate});
  

    try {
      await SmartContractObj.methods.withdraw(web3.utils.toWei(".1", "ether")).send({
        from: window.ethereum.selectedAddress,
        to: CONTRACT_ADDRESS,
        gasLimit: gasLimitEstimate,
        gasPrice: gasPriceEstimate
      })

    } catch (error) {
        console.log(error)
        alert("Tx failed. Canceled or wrong wallet");
        return;
      }

  }


  return (
    <div>
      <h1>Token Faucet</h1>
      {!isConnected ?
        <button onClick={connectWallet}>Connect Wallet</button>
      : 
        <div>
          <button onClick={donate}>Donate .1 eth to the Faucet</button>
          <button onClick={withdraw}>Withdraw .1 eth to the Faucet</button>
        </div>
      }
    </div>
  );
}

export default App;
