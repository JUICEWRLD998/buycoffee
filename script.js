const connectBtn = document.getElementById('connectBtn');
const balanceBtn = document.getElementById('balanceBtn');
const withdrawBtn = document.getElementById('withdrawBtn');
const coffeeForm = document.getElementById('coffeeForm');
const walletStatus = document.getElementById('walletStatus');
const activityList = document.getElementById('activityList');

let isConnected = false;
let connectedAccount = '';

function addActivity(text) {
  const item = document.createElement('li');
  item.textContent = text;
  activityList.prepend(item);
}

function hasMetaMask() {
  return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
}

function shortAddress(address) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

async function connectWallet() {
  if (!hasMetaMask()) {
    walletStatus.textContent = 'MetaMask not found. Please install MetaMask.';
    addActivity('Please install MetaMask to connect your wallet.');
    return;
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

    if (!accounts || accounts.length === 0) {
      walletStatus.textContent = 'No account found. Please unlock MetaMask.';
      addActivity('Connection failed: no account selected in MetaMask.');
      return;
    }

    connectedAccount = accounts[0];
    isConnected = true;
    walletStatus.textContent = `Connected: ${shortAddress(connectedAccount)}`;
    addActivity(`Wallet connected: ${connectedAccount}`);
  } catch (error) {
    if (error && error.code === 4001) {
      walletStatus.textContent = 'Connection request was rejected.';
      addActivity('User rejected MetaMask connection request.');
      return;
    }

    walletStatus.textContent = 'Could not connect to MetaMask.';
    addActivity(`Connection error: ${error && error.message ? error.message : 'Unknown error'}`);
  }
}

connectBtn.addEventListener('click', connectWallet);

balanceBtn.addEventListener('click', () => {
  addActivity('Get Balance is not implemented yet (smart contract step).');
});

withdrawBtn.addEventListener('click', () => {
  addActivity('Withdraw is not implemented yet (smart contract step).');
});

coffeeForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!isConnected) {
    addActivity('Connect wallet first.');
    return;
  }

  addActivity('Buy Coffee is not implemented yet (smart contract step).');
});

if (hasMetaMask()) {
  window.ethereum.on('accountsChanged', (accounts) => {
    if (!accounts || accounts.length === 0) {
      isConnected = false;
      connectedAccount = '';
      walletStatus.textContent = 'Wallet disconnected.';
      addActivity('MetaMask account disconnected.');
      return;
    }

    connectedAccount = accounts[0];
    isConnected = true;
    walletStatus.textContent = `Connected: ${shortAddress(connectedAccount)}`;
    addActivity(`Active account changed: ${connectedAccount}`);
  });
}
