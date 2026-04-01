# Buy Coffee App (Frontend First)

This project is a simple HTML, CSS, and JavaScript frontend for a Buy Me a Coffee style dApp.

For now, this version does not include smart contracts. The goal is to keep things clean and simple so contract integration can be added later.

## Current Features

- Connect Wallet button (MetaMask integration)
- Fallback message when MetaMask is not installed
- Buy Coffee button (not implemented yet)
- Get Balance button (not implemented yet)
- Withdraw button (not implemented yet)
- Basic form inputs for buyer name, message, and coffee amount
- Activity log in the UI

## Project Structure

- `index.html` - page structure and buttons
- `style.css` - basic styling
- `script.js` - frontend interaction logic (placeholder functions)

## How to Run

1. Open this folder in VS Code.
2. Open `index.html` in your browser.
3. Click Connect to connect MetaMask.
4. If MetaMask is missing, the app shows: Please install MetaMask.

## Next Step (Later)

When you are ready, we can connect these functions to your Solidity contract using ethers.js:

- Connect wallet with MetaMask
- Call payable buy function
- Read contract balance
- Trigger withdraw function