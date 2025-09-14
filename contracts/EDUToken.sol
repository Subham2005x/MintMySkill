// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title EduToken
 * @dev ERC20 Token for EduVerse platform with reward distribution functionality
 * Used for rewarding students upon course completion and enabling token redemption
 */
contract EduToken is ERC20, ERC20Burnable, Ownable, ReentrancyGuard {
    
    // Events
    event TokensRewarded(address indexed student, uint256 amount, uint256 courseId, string reason);
    event TokensRedeemed(address indexed user, uint256 amount, string redemptionType, string details);
    event RewardRateUpdated(uint256 oldRate, uint256 newRate);
    event CourseRewardSet(uint256 courseId, uint256 rewardAmount);
    
    // State variables
    mapping(address => bool) public authorizedMinters;
    mapping(uint256 => uint256) public courseRewards; // courseId => reward amount
    mapping(address => uint256) public totalEarned; // total tokens earned by user
    mapping(address => uint256) public totalRedeemed; // total tokens redeemed by user
    
    uint256 public defaultRewardRate = 100 * 10**18; // 100 EDU tokens default
    uint256 public maxSupply = 1000000000 * 10**18; // 1 billion tokens max supply
    
    // Redemption types and costs
    mapping(string => uint256) public redemptionCosts; // redemption type => cost in tokens
    
    constructor() ERC20("EduVerse Token", "EDU") {
        // Mint initial supply to deployer
        _mint(msg.sender, 10000000 * 10**18); // 10 million initial supply
        
        // Set initial redemption costs
        redemptionCosts["course_discount_10"] = 50 * 10**18; // 50 EDU for 10% course discount
        redemptionCosts["course_discount_25"] = 150 * 10**18; // 150 EDU for 25% course discount
        redemptionCosts["course_discount_50"] = 300 * 10**18; // 300 EDU for 50% course discount
        redemptionCosts["certificate_premium"] = 100 * 10**18; // 100 EDU for premium certificate
        redemptionCosts["one_on_one_session"] = 500 * 10**18; // 500 EDU for 1-on-1 session
    }
    
    /**
     * @dev Modifier to check if caller is authorized minter
     */
    modifier onlyAuthorizedMinter() {
        require(authorizedMinters[msg.sender] || msg.sender == owner(), "Not authorized to mint tokens");
        _;
    }
    
    /**
     * @dev Add authorized minter (usually the backend service)
     */
    function addAuthorizedMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = true;
    }
    
    /**
     * @dev Remove authorized minter
     */
    function removeAuthorizedMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = false;
    }
    
    /**
     * @dev Set reward amount for specific course
     */
    function setCourseReward(uint256 courseId, uint256 rewardAmount) external onlyOwner {
        courseRewards[courseId] = rewardAmount;
        emit CourseRewardSet(courseId, rewardAmount);
    }
    
    /**
     * @dev Update default reward rate
     */
    function updateDefaultRewardRate(uint256 newRate) external onlyOwner {
        uint256 oldRate = defaultRewardRate;
        defaultRewardRate = newRate;
        emit RewardRateUpdated(oldRate, newRate);
    }
    
    /**
     * @dev Set redemption cost for a specific type
     */
    function setRedemptionCost(string memory redemptionType, uint256 cost) external onlyOwner {
        redemptionCosts[redemptionType] = cost;
    }
    
    /**
     * @dev Reward tokens to student for course completion
     */
    function rewardStudent(
        address student, 
        uint256 courseId, 
        string memory reason
    ) external onlyAuthorizedMinter nonReentrant {
        require(student != address(0), "Invalid student address");
        require(totalSupply() + getRewardAmount(courseId) <= maxSupply, "Exceeds max supply");
        
        uint256 rewardAmount = getRewardAmount(courseId);
        
        _mint(student, rewardAmount);
        totalEarned[student] += rewardAmount;
        
        emit TokensRewarded(student, rewardAmount, courseId, reason);
    }
    
    /**
     * @dev Batch reward multiple students
     */
    function batchRewardStudents(
        address[] memory students,
        uint256[] memory courseIds,
        string memory reason
    ) external onlyAuthorizedMinter nonReentrant {
        require(students.length == courseIds.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < students.length; i++) {
            uint256 rewardAmount = getRewardAmount(courseIds[i]);
            require(totalSupply() + rewardAmount <= maxSupply, "Exceeds max supply");
            
            _mint(students[i], rewardAmount);
            totalEarned[students[i]] += rewardAmount;
            
            emit TokensRewarded(students[i], rewardAmount, courseIds[i], reason);
        }
    }
    
    /**
     * @dev Redeem tokens for benefits
     */
    function redeemTokens(
        string memory redemptionType,
        string memory details
    ) external nonReentrant {
        uint256 cost = redemptionCosts[redemptionType];
        require(cost > 0, "Invalid redemption type");
        require(balanceOf(msg.sender) >= cost, "Insufficient token balance");
        
        _burn(msg.sender, cost);
        totalRedeemed[msg.sender] += cost;
        
        emit TokensRedeemed(msg.sender, cost, redemptionType, details);
    }
    
    /**
     * @dev Get reward amount for a course
     */
    function getRewardAmount(uint256 courseId) public view returns (uint256) {
        if (courseRewards[courseId] > 0) {
            return courseRewards[courseId];
        }
        return defaultRewardRate;
    }
    
    /**
     * @dev Get user's token statistics
     */
    function getUserStats(address user) external view returns (
        uint256 balance,
        uint256 earned,
        uint256 redeemed
    ) {
        return (
            balanceOf(user),
            totalEarned[user],
            totalRedeemed[user]
        );
    }
    
    /**
     * @dev Get available redemption options
     */
    function getRedemptionCost(string memory redemptionType) external view returns (uint256) {
        return redemptionCosts[redemptionType];
    }
    
    /**
     * @dev Emergency function to recover stuck tokens (only owner)
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            payable(owner()).transfer(amount);
        } else {
            IERC20(token).transfer(owner(), amount);
        }
    }
    
    /**
     * @dev Override to prevent renouncing ownership
     */
    function renounceOwnership() public virtual override {
        revert("Cannot renounce ownership");
    }
}