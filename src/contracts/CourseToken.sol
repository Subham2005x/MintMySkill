// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CourseToken is ERC20, Ownable {
    // Fixed reward amount per course completion: 100 tokens
    uint256 public constant REWARD_AMOUNT = 100 * 10**18;

    // Track completed courses
    mapping(address => uint256[]) public completedCourses;

    // Events
    event CourseCompleted(address indexed student, uint256 courseId);

    constructor() ERC20("Course Completion Token", "CCT") Ownable(msg.sender) {}

    // Award tokens for course completion
    function awardTokens(address student, uint256 courseId) external onlyOwner {
        require(student != address(0), "Invalid address");
        require(!hasCourseCompleted(student, courseId), "Course already completed");

        // Record completion
        completedCourses[student].push(courseId);
        
        // Mint tokens to student
        _mint(student, REWARD_AMOUNT);

        emit CourseCompleted(student, courseId);
    }

    // Check if a course is completed
    function hasCourseCompleted(address student, uint256 courseId) public view returns (bool) {
        uint256[] memory courses = completedCourses[student];
        for (uint i = 0; i < courses.length; i++) {
            if (courses[i] == courseId) {
                return true;
            }
        }
        return false;
    }

    // Get all completed courses for a student
    function getCompletedCourses(address student) external view returns (uint256[] memory) {
        return completedCourses[student];
    }
}