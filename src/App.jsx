import React, { useEffect, useState } from "react";
import "./App.css";
import { ethers } from "ethers";
import abi from "./utils/WavePortal.json";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");

  const [val, setVal] = useState("");
  const [readOnly, setReadOnly] = useState(false);
  //const [backgroundColor, setBackgroundColor] = useState({});

  const [allWaves, setAllWaves] = useState([]);

  // Wave Contract Address
  const contractAddress ="0xF1Cb71Eb8AFcC6931Bef017DA2A4A4AB9c9f54de";
  //Contract ABI
  const contractABI = abi.abi;

  //Check if wallet is connected
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        getAllWaves();
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }
 
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async () => {
      try {
        const { ethereum } = window;
  
        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
          setReadOnly(() => true);
          let count = await wavePortalContract.getTotalWaves();
          console.log("Retrieved total wave count...", count.toNumber());
          
  
          /*
          * Execute the actual wave from your smart contract
          */
          const waveTxn = await wavePortalContract.wave(val);
          console.log(val);
          console.log("Mining...", waveTxn.hash);
  
          await waveTxn.wait();
          console.log("Mined -- ", waveTxn.hash);
          
          setVal(() => "");
          setReadOnly(() => false);
          count = await wavePortalContract.getTotalWaves();
          console.log("Retrieved total wave count...", count.toNumber());
        } else {
          console.log("Ethereum object doesn't exist!");
        }
      } catch (error) {
        console.log(error);
        setReadOnly(() => false);
      }
    }

  /*
   * Create a method that gets all waves from your contract
   */
  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();
        
        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }
  

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <div className="mainContainer">
      <div className="dataContainer">
                {!currentAccount && (
          <h1 align="right" >
            <button className="waveButton" onClick={connectWallet}>
              Connect your Wallet 
            </button>
          </h1>
        
        )}
        <div className="header">
        Hello World. 
        </div>

        <div className="bio">
          I am Allen and I am learning Web3 Development. Connect your Ethereum wallet and wave at me!
        </div>

        <form>
          <label>
            Message:
            <input type="text" readOnly = {readOnly} name="Input" value={val} onChange={ (e) => {
              setVal(() => e.target.value) }} 
              />
          </label>
        </form>

        <button className="waveButton" onClick={wave}>
          Wave here 
        </button>

        {allWaves.slice(0).reverse().map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>
            )
          })
        }


      </div>
    </div>
  );
}

export default App