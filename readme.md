# Buy Coffee App (Frontend First)

This project is a simple HTML, CSS, and JavaScript frontend for a Buy Me a Coffee style dApp.

For now, this version does not use smart contracts. Buy Coffee works by sending a direct ETH transaction through MetaMask.

## Current Features

- Connect Wallet button (MetaMask integration)
- Fallback message when MetaMask is not installed
- Buy Coffee button (sends ETH transaction via MetaMask)
- Get Balance button (reads connected wallet balance)
- Withdraw button (not implemented yet)
- Basic form inputs for buyer name, message, and coffee amount
- Activity log in the UI

## Project Structure

- `index.html` - page structure and buttons
- `style.css` - basic styling
- `script.js` - MetaMask connect, transaction sending, and balance fetch logic

## How to Run

1. Open this folder in VS Code.
2. Open `index.html` in your browser.
3. Click Connect to connect MetaMask.
4. Enter an amount and click Buy Coffee.
5. Approve the transaction in MetaMask.
6. Click Get Balance to read the latest wallet balance.
7. If MetaMask is missing, the app shows: Please install MetaMask.

## Next Step (Later)

When you are ready, we can replace direct wallet transfer with Solidity contract calls:

- Connect wallet with MetaMask
- Call payable buy function
- Read contract balance
- Trigger withdraw function