/*global ethereum, MetamaskOnboarding */

/*
The `piggybankContract` is compiled from:

  pragma solidity ^0.4.0;
  contract PiggyBank {

      uint private balance;
      address public owner;

      function PiggyBank() public {
          owner = msg.sender;
          balance = 0;
      }

      function deposit() public payable returns (uint) {
          balance += msg.value;
          return balance;
      }

      function withdraw(uint withdrawAmount) public returns (uint remainingBal) {
          require(msg.sender == owner);
          balance -= withdrawAmount;

          msg.sender.transfer(withdrawAmount);

          return balance;
      }
  }
*/




const forwarderOrigin = 'http://localhost:3000';

const initialize = () => {
  //Basic Actions Section
  const onboardButton = document.getElementById('connectButton');
  const getAccountsButton = document.getElementById('getAccounts');
  const getAccountsResult = document.getElementById('getAccountsResult');
  const withdraw1USDButton = document.getElementById('withdraw1USD');

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

    var web3 = new Web3(" https://rpc.tst.publicmint.io:8545/");

    const contractRef = new web3.eth.Contract(
      contractABI, contractAddress);


    const receipt = await contractRef.methods.withdrawWireInt(web3.utils.toWei("1"),
      '0x0d63f952f267aa920b4b906d0c1821218aa0d1349df07efa2a8039626a8864b8').encodeABI();

    const transaction = {

      from: "0x8F3cEA8ba0201104f3Fb733f50738892129f19e3",
      to: contractAddress,
      //'value': 0,
      gas: estGasFees,
      //maxFeePerGas: 1000000108,
      //nonce: nonce,
      //gasLimit: 70000,
      data: receipt
      // optional data field to send message or execute smart contract
    };

    const walletAccountPrivateKey1 = '8cc14c56d1a8b92424a0d772f2226df9bc86af9670ba7f2ff336443b3f94f63f';
    web3.eth.accounts.signTransaction(transaction, walletAccountPrivateKey1).then(signed => {
      var tran = web3.eth.sendSignedTransaction(signed.rawTransaction);
      tran.on('confirmation', (confirmationNumber, receipt) => {
        console.log('confirmation: ' + confirmationNumber);
      });

      tran.on('transactionHash', hash => {
        console.log('hash');
        console.log(hash);
      });
      tran.on('receipt', receipt => {
        console.log('reciept');
        console.log(receipt);
      });
      tran.on('error', console.error);
    });
  });

  MetaMaskClientCheck();
}
window.addEventListener('DOMContentLoaded', initialize);
