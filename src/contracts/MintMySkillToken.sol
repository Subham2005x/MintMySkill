// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract MintMySkillToken is ERC20, ERC20Burnable, Ownable {
    // Mapping to track which courses have been completed by users
    mapping(address => mapping(uint256 => bool)) public completedCourses;
    
    // Event emitted when a course is completed and tokens are awarded
    event CourseCompleted(address indexed user, uint256 indexed courseId, uint256 amount);

    // Base token amount for course completion
    uint256 public constant COURSE_COMPLETION_REWARD = 100 * 10**18; // 100 tokens with 18 decimals

    constructor() ERC20("MintMySkill", "MMS") Ownable(msg.sender) {}

    /**
     * @dev Awards tokens to a user upon course completion
     * @param user Address of the user who completed the course
     * @param courseId ID of the completed course
     */
    function awardCourseCompletion(address user, uint256 courseId) external onlyOwner {
        require(user != address(0), "Invalid user address");
        require(!completedCourses[user][courseId], "Course already completed");

        completedCourses[user][courseId] = true;
        _mint(user, COURSE_COMPLETION_REWARD);
        
        emit CourseCompleted(user, courseId, COURSE_COMPLETION_REWARD);
    }

    /**
     * @dev Checks if a user has completed a specific course
     * @param user Address of the user
     * @param courseId ID of the course
     * @return bool indicating whether the course has been completed
     */
    function hasCourseCompleted(address user, uint256 courseId) external view returns (bool) {
        return completedCourses[user][courseId];
    }

    /**
     * @dev Burns tokens from the caller's account
     * @param amount Amount of tokens to burn
     */
    function burn(uint256 amount) public override {
        super.burn(amount);
    }
}