const connectBtn = document.getElementById('connectBtn');
const balanceBtn = document.getElementById('balanceBtn');
const withdrawBtn = document.getElementById('withdrawBtn');
const coffeeForm = document.getElementById('coffeeForm');
const walletStatus = document.getElementById('walletStatus');
const activityList = document.getElementById('activityList');

const COFFEE_RECIPIENT_ADDRESS = '0xb75F9F59Aa4b90d90eD00EEcf49aDE1e3514e383';

let isConnected = false;
let connectedAccount = '';

function addActivity(text) {
  const item = document.createElement('li');
  item.textContent = text;
  activityList.prepend(item);
}

function hasMetaMask() {               /*this checks if the user has metamask installed in the browser*/
  return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
}

function shortAddress(address) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function parseEthToWei(ethValue) {
  const normalized = String(ethValue).trim();
  if (!normalized || Number.isNaN(Number(normalized)) || Number(normalized) <= 0) {
    throw new Error('Invalid ETH amount.');
  }

  const [wholePart, decimalPart = ''] = normalized.split('.');
  if (decimalPart.length > 18) {
    throw new Error('Too many decimal places. Max is 18.');
  }

  const wholeWei = BigInt(wholePart || '0') * (10n ** 18n);
  const decimalWei = BigInt((decimalPart + '0'.repeat(18)).slice(0, 18));
  return wholeWei + decimalWei;
}

function formatWeiToEth(weiHex) {
  const wei = BigInt(weiHex);
  const whole = wei / (10n ** 18n);
  const fraction = wei % (10n ** 18n);
  const fractionText = fraction.toString().padStart(18, '0').replace(/0+$/, '');
  return fractionText ? `${whole.toString()}.${fractionText}` : whole.toString();
}

async function waitForReceipt(txHash, retries = 20, delayMs = 1500) {
  for (let i = 0; i < retries; i += 1) {
    const receipt = await window.ethereum.request({
      method: 'eth_getTransactionReceipt',
      params: [txHash],
    });

    if (receipt) {
      return receipt;
    }

    // Poll for confirmation without adding extra dependencies.
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  return null;
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
  getBalance();
});

withdrawBtn.addEventListener('click', () => {
  withdrawCoffeeFunds();
});

coffeeForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!isConnected) {
    addActivity('Connect wallet first.');
    return;
  }

  buyCoffee();
});

async function getBalance() {
  if (!isConnected || !connectedAccount) {
    addActivity('Connect wallet first.');
    return;
  }

  try {
    const balanceHex = await window.ethereum.request({
      method: 'eth_getBalance',
      params: [connectedAccount, 'latest'],
    });

    const ethBalance = formatWeiToEth(balanceHex);
    addActivity(`Balance for ${shortAddress(connectedAccount)}: ${ethBalance} ETH`);
  } catch (error) {
    addActivity(`Failed to fetch balance: ${error && error.message ? error.message : 'Unknown error'}`);
  }
}

async function buyCoffee() {
  const amountInput = document.getElementById('amount');
  const name = document.getElementById('name').value.trim() || 'Anonymous';
  const amountText = amountInput.value;

  try {
    const weiValue = parseEthToWei(amountText);

    // No contract for now: send ETH directly to the configured recipient wallet.
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: connectedAccount,
          to: COFFEE_RECIPIENT_ADDRESS,
          value: `0x${weiValue.toString(16)}`,
        },
      ],
    });

    addActivity(`${name} bought coffee for ${shortAddress(COFFEE_RECIPIENT_ADDRESS)}. Tx sent: ${txHash}`);

    const receipt = await waitForReceipt(txHash);
    if (receipt && receipt.status === '0x1') {
      addActivity('Transaction confirmed.');
      coffeeForm.reset();
      amountInput.value = '0.001';
      return;
    }

    addActivity('Transaction submitted. Confirmation still pending.');
  } catch (error) {
    if (error && error.code === 4001) {
      addActivity('Transaction rejected in MetaMask.');
      return;
    }

    addActivity(`Buy Coffee failed: ${error && error.message ? error.message : 'Unknown error'}`);
  }
}

async function withdrawCoffeeFunds() {
  if (!isConnected || !connectedAccount) {
    addActivity('Connect wallet first.');
    return;
  }

  const destination = connectedAccount;

  try {
    const balanceHex = await window.ethereum.request({
      method: 'eth_getBalance',
      params: [connectedAccount, 'latest'],
    });
    const gasPriceHex = await window.ethereum.request({
      method: 'eth_gasPrice',
      params: [],
    });

    const balanceWei = BigInt(balanceHex);
    const gasPriceWei = BigInt(gasPriceHex);
    const transferGasLimit = 21000n;
    const gasCostWei = gasPriceWei * transferGasLimit;
    const sendValueWei = balanceWei - gasCostWei;

    if (sendValueWei <= 0n) {
      addActivity('Not enough balance to withdraw after gas.');
      return;
    }

    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: connectedAccount,
          to: destination,
          gas: `0x${transferGasLimit.toString(16)}`,
          value: `0x${sendValueWei.toString(16)}`,
        },
      ],
    });

    addActivity(`Withdraw submitted to ${shortAddress(destination)}. Tx: ${txHash}`);

    const receipt = await waitForReceipt(txHash);
    if (receipt && receipt.status === '0x1') {
      addActivity('Withdraw confirmed.');
      return;
    }

    addActivity('Withdraw submitted. Confirmation still pending.');
  } catch (error) {
    if (error && error.code === 4001) {
      addActivity('Withdraw rejected in MetaMask.');
      return;
    }

    addActivity(`Withdraw failed: ${error && error.message ? error.message : 'Unknown error'}`);
  }
}

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
