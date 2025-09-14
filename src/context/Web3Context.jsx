import React, { createContext, useContext, useState, useEffect } from 'react';
import Web3 from 'web3';

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [balance, setBalance] = useState('0');
  const [tokenBalance, setTokenBalance] = useState('0');

  // Contract addresses (will be set from environment variables)
  const EDU_TOKEN_ADDRESS = process.env.REACT_APP_EDU_TOKEN_ADDRESS;
  const EDU_CERTIFICATE_ADDRESS = process.env.REACT_APP_EDU_CERTIFICATE_ADDRESS;

  // ERC-20 ABI (minimal for balance checking)
  const ERC20_ABI = [
    {
      "constant": true,
      "inputs": [{"name": "_owner", "type": "address"}],
      "name": "balanceOf",
      "outputs": [{"name": "balance", "type": "uint256"}],
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "symbol",
      "outputs": [{"name": "", "type": "string"}],
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "decimals",
      "outputs": [{"name": "", "type": "uint8"}],
      "type": "function"
    }
  ];

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  };

  // Initialize Web3 connection
  const initWeb3 = async () => {
    if (isMetaMaskInstalled()) {
      try {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        
        // Check if already connected
        const accounts = await web3Instance.eth.getAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          await updateBalances(web3Instance, accounts[0]);
        }

        // Get chain ID
        const networkId = await web3Instance.eth.net.getId();
        setChainId(networkId);

        return web3Instance;
      } catch (error) {
        console.error('Failed to initialize Web3:', error);
      }
    }
    return null;
  };

  // Connect to MetaMask
  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      alert('MetaMask is not installed. Please install MetaMask to continue.');
      window.open('https://metamask.io/download/', '_blank');
      return false;
    }

    setIsConnecting(true);
    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const web3Instance = web3 || new Web3(window.ethereum);
      setWeb3(web3Instance);

      const accounts = await web3Instance.eth.getAccounts();
      const networkId = await web3Instance.eth.net.getId();
      
      setAccount(accounts[0]);
      setChainId(networkId);
      setIsConnected(true);
      
      await updateBalances(web3Instance, accounts[0]);
      
      console.log('Connected to wallet:', accounts[0]);
      return true;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    setBalance('0');
    setTokenBalance('0');
    console.log('Wallet disconnected');
  };

  // Update ETH and token balances
  const updateBalances = async (web3Instance, accountAddress) => {
    try {
      // Get ETH balance
      const ethBalance = await web3Instance.eth.getBalance(accountAddress);
      setBalance(web3Instance.utils.fromWei(ethBalance, 'ether'));

      // Get EDU token balance if contract address is available
      if (EDU_TOKEN_ADDRESS) {
        const tokenContract = new web3Instance.eth.Contract(ERC20_ABI, EDU_TOKEN_ADDRESS);
        const tokenBal = await tokenContract.methods.balanceOf(accountAddress).call();
        setTokenBalance(web3Instance.utils.fromWei(tokenBal, 'ether'));
      }
    } catch (error) {
      console.error('Failed to update balances:', error);
    }
  };

  // Sign message for wallet verification
  const signMessage = async (message) => {
    if (!web3 || !account) {
      throw new Error('Wallet not connected');
    }

    try {
      const signature = await web3.eth.personal.sign(message, account, '');
      return signature;
    } catch (error) {
      console.error('Failed to sign message:', error);
      throw error;
    }
  };

  // Switch to a specific network
  const switchNetwork = async (targetChainId) => {
    if (!isMetaMaskInstalled()) {
      throw new Error('MetaMask not installed');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
      
      setChainId(targetChainId);
      return true;
    } catch (error) {
      console.error('Failed to switch network:', error);
      throw error;
    }
  };

  // Get network name
  const getNetworkName = (chainId) => {
    const networks = {
      1: 'Ethereum Mainnet',
      5: 'Goerli Testnet',
      11155111: 'Sepolia Testnet',
      137: 'Polygon Mainnet',
      80001: 'Polygon Mumbai',
      1337: 'Localhost'
    };
    return networks[chainId] || `Unknown Network (${chainId})`;
  };

  // Listen for account and network changes
  useEffect(() => {
    if (isMetaMaskInstalled()) {
      // Initialize Web3 on component mount
      initWeb3();

      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          if (web3) updateBalances(web3, accounts[0]);
        } else {
          disconnectWallet();
        }
      });

      // Listen for network changes
      window.ethereum.on('chainChanged', (chainId) => {
        setChainId(parseInt(chainId, 16));
        window.location.reload(); // Reload on network change
      });

      return () => {
        if (window.ethereum && window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged');
          window.ethereum.removeListener('chainChanged');
        }
      };
    }
  }, [web3]);

  // Refresh balances periodically
  useEffect(() => {
    if (isConnected && web3 && account) {
      const interval = setInterval(() => {
        updateBalances(web3, account);
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
  }, [isConnected, web3, account]);

  const value = {
    web3,
    account,
    chainId,
    isConnected,
    isConnecting,
    balance,
    tokenBalance,
    isMetaMaskInstalled,
    connectWallet,
    disconnectWallet,
    signMessage,
    switchNetwork,
    getNetworkName,
    updateBalances: () => updateBalances(web3, account),
    contracts: {
      EDU_TOKEN_ADDRESS,
      EDU_CERTIFICATE_ADDRESS
    }
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};