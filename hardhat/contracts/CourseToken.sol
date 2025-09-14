// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CourseToken is ERC20, Ownable {
    mapping(address => uint256[]) private completedCourses;
    mapping(address => mapping(uint256 => bool)) private courseCompletion;
    uint256 private constant REWARD_AMOUNT = 10 * 10**18; // 10 tokens per course

    event CourseCompleted(address indexed student, uint256 indexed courseId, uint256 reward);

    constructor() ERC20("Education Token", "EDU") Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * 10**decimals()); // Mint 1M tokens initially
    }

    function awardTokens(address student, uint256 courseId) external onlyOwner returns (bool) {
        require(student != address(0), "Invalid student address");
        require(!courseCompletion[student][courseId], "Course already completed");

        courseCompletion[student][courseId] = true;
        completedCourses[student].push(courseId);
        
        bool success = _mint(student, REWARD_AMOUNT);
        require(success, "Token minting failed");
        
        emit CourseCompleted(student, courseId, REWARD_AMOUNT);
        return true;
    }

    function hasCourseCompleted(address student, uint256 courseId) external view returns (bool) {
        return courseCompletion[student][courseId];
    }

    function getCompletedCourses(address student) external view returns (uint256[] memory) {
        return completedCourses[student];
    }
}