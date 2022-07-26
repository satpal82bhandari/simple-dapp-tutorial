//import ENS, { getEnsAddress } from '@ensdomains/ensjs'

/*global ethereum, MetamaskOnboarding */

// const { ENS, getEnsAddress } = require('@ensdomains/ensjs');


const forwarderOrigin = 'http://localhost:3000';

const initialize = () => {
  //Basic Actions Section
  const onboardButton = document.getElementById('connectButton');
  const getAccountsButton = document.getElementById('getAccounts');
  const getAccountsResult = document.getElementById('getAccountsResult');
  const withdraw1USDButton = document.getElementById('withdraw1USD');
  const ensButton = document.getElementById('ens');

  //Created check function to see if the MetaMask extension is installed
  const isMetaMaskInstalled = () => {
    //Have to check the ethereum binding on the window object to see if it's installed
    const { ethereum } = window;
    return Boolean(ethereum && ethereum.isMetaMask);
  };

  //We create a new MetaMask onboarding object to use in our app
  const onboarding = new MetaMaskOnboarding({ forwarderOrigin });

  //This will start the onboarding proccess
  const onClickInstall = () => {
    onboardButton.innerText = 'Onboarding in progress';
    onboardButton.disabled = true;
    //On this object we have startOnboarding which will start the onboarding process for our end user
    onboarding.startOnboarding();
  };

  const onClickConnect = async () => {
    try {
      // Will open the MetaMask UI
      // You should disable this button while the request is pending!
      await ethereum.request({ method: 'eth_requestAccounts' });
    } catch (error) {
      console.error(error);
    }
  };

  const MetaMaskClientCheck = () => {
    //Now we check to see if Metmask is installed
    if (!isMetaMaskInstalled()) {
      //If it isn't installed we ask the user to click to install it
      onboardButton.innerText = 'Click here to install MetaMask!';
      //When the button is clicked we call th is function
      onboardButton.onclick = onClickInstall;
      //The button is now disabled
      onboardButton.disabled = false;
    } else {
      //If MetaMask is installed we ask the user to connect to their wallet
      onboardButton.innerText = 'Connect';
      //When the button is clicked we call this function to connect the users MetaMask Wallet
      onboardButton.onclick = onClickConnect;
      //The button is now disabled
      onboardButton.disabled = false;
    }
  };

  //Eth_Accounts-getAccountsButton
  getAccountsButton.addEventListener('click', async () => {
    //we use eth_accounts because it returns a list of addresses owned by us.
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    //We take the first address in the array of addresses and display it
    getAccountsResult.innerHTML = accounts[0] || 'Not able to get accounts';
  });

  withdraw1USDButton.addEventListener('click', async () => {
    const contractABI = await $.getJSON("./contract-abi.json");
    const contractAddress = "0x0000000000000000000000000000000000002070";

    var web3 = new Web3(window.ethereum);

    const contractRef = new web3.eth.Contract(
      contractABI, contractAddress);

    const estGasFees = await contractRef.methods.withdrawWireInt(web3.utils.toWei("1", "gwei"), web3.utils.sha3('0x3f15742b0c318ada62cd4063aaea5262666154f643150c2c4284ce09861673eb')).estimateGas({ from: window.ethereum.selectedAddress })
    console.log(`EstGasFees : ${estGasFees}`);
    const receipt = await contractRef.methods.withdrawWireInt(web3.utils.toWei("1", "gwei"), web3.utils.sha3('0x3f15742b0c318ada62cd4063aaea5262666154f643150c2c4284ce09861673eb'))
      .send({ from: window.ethereum.selectedAddress, gas: estGasFees });
    console.log(`Receipt : ${JSON.stringify(receipt)}`);
  });

  ensButton.addEventListener('click', async () => {
    console.log(`ensButton clicked`);
    const contractABI = await $.getJSON("./kaledio-contract-abi.json");
    const contractAddress = "0x3fbb17910fbf8a33a3ad5a6e23daa55a7845d269";

    var web3 = new Web3(window.ethereum);

    const contractRef = new web3.eth.Contract(
      contractABI, contractAddress);

    const estGasFees = await contractRef.methods.set("1000000100000000").estimateGas({ from: window.ethereum.selectedAddress })
    console.log(`EstGasFees : ${estGasFees}`);
    const receipt = await contractRef.methods.set("1000000100000000")
      .send({ from: window.ethereum.selectedAddress, gas: estGasFees });
    console.log(`Receipt : ${JSON.stringify(receipt)}`);
  })

  MetaMaskClientCheck();
}
window.addEventListener('DOMContentLoaded', initialize);
