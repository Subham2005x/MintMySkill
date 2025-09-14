// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title EDUToken
 * @dev ERC-20 token for MintMySkill education platform
 * Features:
 * - Mintable by owner (for rewards)
 * - Burnable (for redemptions)
 * - Pausable (emergency stops)
 * - Capped supply (100 million tokens)
 */
contract EDUToken is ERC20, ERC20Burnable, Pausable, Ownable {
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10**18; // 100 million tokens
    
    // Mapping to track authorized minters (backend wallets)
    mapping(address => bool) public authorizedMinters;
    
    // Events
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event TokensRewarded(address indexed user, uint256 amount, string reason);
    event TokensRedeemed(address indexed user, uint256 amount, string item);

    constructor(
        string memory name,
        string memory symbol,
        address initialOwner
    ) ERC20(name, symbol) {
        _transferOwnership(initialOwner);
        
        // Mint initial supply to owner (10% of max supply)
        uint256 initialSupply = 10_000_000 * 10**18; // 10 million tokens
        _mint(initialOwner, initialSupply);
        
        // Add owner as authorized minter
        authorizedMinters[initialOwner] = true;
        emit MinterAdded(initialOwner);
    }

    /**
     * @dev Modifier to check if caller is authorized minter
     */
    modifier onlyMinter() {
        require(authorizedMinters[msg.sender], "EDUToken: caller is not an authorized minter");
        _;
    }

    /**
     * @dev Add authorized minter (backend wallet)
     */
    function addMinter(address minter) external onlyOwner {
        require(minter != address(0), "EDUToken: minter cannot be zero address");
        require(!authorizedMinters[minter], "EDUToken: minter already authorized");
        
        authorizedMinters[minter] = true;
        emit MinterAdded(minter);
    }

    /**
     * @dev Remove authorized minter
     */
    function removeMinter(address minter) external onlyOwner {
        require(authorizedMinters[minter], "EDUToken: minter not authorized");
        
        authorizedMinters[minter] = false;
        emit MinterRemoved(minter);
    }

    /**
     * @dev Mint tokens as rewards (only by authorized minters)
     */
    function rewardTokens(
        address to,
        uint256 amount,
        string calldata reason
    ) external onlyMinter {
        require(to != address(0), "EDUToken: cannot reward to zero address");
        require(amount > 0, "EDUToken: reward amount must be greater than 0");
        require(totalSupply() + amount <= MAX_SUPPLY, "EDUToken: would exceed max supply");
        
        _mint(to, amount);
        emit TokensRewarded(to, amount, reason);
    }

    /**
     * @dev Burn tokens for redemptions
     */
    function redeemTokens(uint256 amount, string calldata item) external {
        require(amount > 0, "EDUToken: redeem amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "EDUToken: insufficient balance");
        
        _burn(msg.sender, amount);
        emit TokensRedeemed(msg.sender, amount, item);
    }

    /**
     * @dev Batch reward tokens to multiple users
     */
    function batchRewardTokens(
        address[] calldata recipients,
        uint256[] calldata amounts,
        string calldata reason
    ) external onlyMinter {
        require(recipients.length == amounts.length, "EDUToken: arrays length mismatch");
        require(recipients.length > 0, "EDUToken: empty arrays");

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        
        require(totalSupply() + totalAmount <= MAX_SUPPLY, "EDUToken: would exceed max supply");

        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "EDUToken: cannot reward to zero address");
            require(amounts[i] > 0, "EDUToken: reward amount must be greater than 0");
            
            _mint(recipients[i], amounts[i]);
            emit TokensRewarded(recipients[i], amounts[i], reason);
        }
    }

    /**
     * @dev Pause token transfers (emergency stop)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause token transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Override _beforeTokenTransfer to include pausable functionality
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }

    /**
     * @dev Get remaining mintable supply
     */
    function remainingSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }

    /**
     * @dev Check if address is authorized minter
     */
    function isMinter(address account) external view returns (bool) {
        return authorizedMinters[account];
    }
}