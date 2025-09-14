export const CourseTokenABI = [
  // ERC20 standard functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  
  // Custom functions for course completion
  "function awardTokens(address student, uint256 courseId) returns (bool)",
  "function hasCourseCompleted(address student, uint256 courseId) view returns (bool)",
  "function getCompletedCourses(address student) view returns (uint256[])",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event CourseCompleted(address indexed student, uint256 indexed courseId, uint256 reward)"
];