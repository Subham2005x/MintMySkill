// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title EDUCertificate
 * @dev NFT contract for course completion certificates
 * Features:
 * - Non-transferable certificates (soulbound)
 * - Metadata stored on IPFS
 * - Verifiable course completion
 * - Batch minting capability
 */
contract EDUCertificate is ERC721, ERC721URIStorage, ERC721Burnable, Pausable, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    // Mapping to track authorized issuers (backend wallets)
    mapping(address => bool) public authorizedIssuers;
    
    // Certificate data structure
    struct Certificate {
        string courseName;
        string courseId;
        address student;
        uint256 completionDate;
        uint256 score;
        string grade;
        string instructorName;
        bool isValid;
    }

    // Mapping from token ID to certificate data
    mapping(uint256 => Certificate) public certificates;
    
    // Mapping from student to their certificates (courseId => tokenId)
    mapping(address => mapping(string => uint256)) public studentCertificates;
    
    // Mapping to prevent duplicate certificates
    mapping(bytes32 => bool) public certificateExists;

    // Events
    event IssuerAdded(address indexed issuer);
    event IssuerRemoved(address indexed issuer);
    event CertificateIssued(
        uint256 indexed tokenId,
        address indexed student,
        string courseId,
        string courseName,
        uint256 score
    );
    event CertificateRevoked(uint256 indexed tokenId, string reason);

    constructor(
        string memory name,
        string memory symbol,
        address initialOwner
    ) ERC721(name, symbol) {
        _transferOwnership(initialOwner);
        
        // Add owner as authorized issuer
        authorizedIssuers[initialOwner] = true;
        emit IssuerAdded(initialOwner);
        
        // Start token IDs from 1
        _tokenIdCounter.increment();
    }

    /**
     * @dev Modifier to check if caller is authorized issuer
     */
    modifier onlyIssuer() {
        require(authorizedIssuers[msg.sender], "EDUCertificate: caller is not an authorized issuer");
        _;
    }

    /**
     * @dev Add authorized issuer (backend wallet)
     */
    function addIssuer(address issuer) external onlyOwner {
        require(issuer != address(0), "EDUCertificate: issuer cannot be zero address");
        require(!authorizedIssuers[issuer], "EDUCertificate: issuer already authorized");
        
        authorizedIssuers[issuer] = true;
        emit IssuerAdded(issuer);
    }

    /**
     * @dev Remove authorized issuer
     */
    function removeIssuer(address issuer) external onlyOwner {
        require(authorizedIssuers[issuer], "EDUCertificate: issuer not authorized");
        
        authorizedIssuers[issuer] = false;
        emit IssuerRemoved(issuer);
    }

    /**
     * @dev Issue certificate to student
     */
    function issueCertificate(
        address student,
        string calldata courseId,
        string calldata courseName,
        uint256 score,
        string calldata grade,
        string calldata instructorName,
        string calldata metadataURI
    ) external onlyIssuer returns (uint256) {
        return _issueCertificate(student, courseId, courseName, score, grade, instructorName, metadataURI);
    }

    /**
     * @dev Internal function to issue certificate
     */
    function _issueCertificate(
        address student,
        string memory courseId,
        string memory courseName,
        uint256 score,
        string memory grade,
        string memory instructorName,
        string memory metadataURI
    ) internal returns (uint256) {
        require(student != address(0), "EDUCertificate: cannot issue to zero address");
        require(bytes(courseId).length > 0, "EDUCertificate: courseId cannot be empty");
        require(bytes(courseName).length > 0, "EDUCertificate: courseName cannot be empty");
        
        // Create unique hash for this certificate
        bytes32 certificateHash = keccak256(abi.encodePacked(student, courseId));
        require(!certificateExists[certificateHash], "EDUCertificate: certificate already exists");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        // Mint the NFT
        _safeMint(student, tokenId);
        _setTokenURI(tokenId, metadataURI);

        // Store certificate data
        certificates[tokenId] = Certificate({
            courseName: courseName,
            courseId: courseId,
            student: student,
            completionDate: block.timestamp,
            score: score,
            grade: grade,
            instructorName: instructorName,
            isValid: true
        });

        // Update mappings
        studentCertificates[student][courseId] = tokenId;
        certificateExists[certificateHash] = true;

        emit CertificateIssued(tokenId, student, courseId, courseName, score);
        
        return tokenId;
    }

    /**
     * @dev Batch issue certificates
     */
    function batchIssueCertificates(
        address[] calldata students,
        string[] calldata courseIds,
        string[] calldata courseNames,
        uint256[] calldata scores,
        string[] calldata grades,
        string[] calldata instructorNames,
        string[] calldata tokenURIs
    ) external onlyIssuer returns (uint256[] memory) {
        uint256 length = students.length;
        require(length == courseIds.length, "EDUCertificate: arrays length mismatch");
        require(length == courseNames.length, "EDUCertificate: arrays length mismatch");
        require(length == scores.length, "EDUCertificate: arrays length mismatch");
        require(length == grades.length, "EDUCertificate: arrays length mismatch");
        require(length == instructorNames.length, "EDUCertificate: arrays length mismatch");
        require(length == tokenURIs.length, "EDUCertificate: arrays length mismatch");
        require(length > 0, "EDUCertificate: empty arrays");

        uint256[] memory tokenIds = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            tokenIds[i] = _issueCertificate(
                students[i],
                courseIds[i],
                courseNames[i],
                scores[i],
                grades[i],
                instructorNames[i],
                tokenURIs[i]
            );
        }

        return tokenIds;
    }

    /**
     * @dev Revoke certificate (mark as invalid)
     */
    function revokeCertificate(uint256 tokenId, string calldata reason) external onlyIssuer {
        require(_exists(tokenId), "EDUCertificate: certificate does not exist");
        require(certificates[tokenId].isValid, "EDUCertificate: certificate already revoked");
        
        certificates[tokenId].isValid = false;
        emit CertificateRevoked(tokenId, reason);
    }

    /**
     * @dev Verify certificate authenticity
     */
    function verifyCertificate(uint256 tokenId) external view returns (
        bool isValid,
        address student,
        string memory courseId,
        string memory courseName,
        uint256 completionDate,
        uint256 score,
        string memory grade
    ) {
        require(_exists(tokenId), "EDUCertificate: certificate does not exist");
        
        Certificate memory cert = certificates[tokenId];
        return (
            cert.isValid,
            cert.student,
            cert.courseId,
            cert.courseName,
            cert.completionDate,
            cert.score,
            cert.grade
        );
    }

    /**
     * @dev Get student's certificate for a specific course
     */
    function getStudentCertificate(address student, string calldata courseId) external view returns (uint256) {
        return studentCertificates[student][courseId];
    }

    /**
     * @dev Get all certificates owned by a student
     */
    function getStudentCertificates(address student) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(student);
        uint256[] memory tokenIds = new uint256[](balance);
        uint256 index = 0;
        
        for (uint256 i = 1; i < _tokenIdCounter.current(); i++) {
            if (_exists(i) && ownerOf(i) == student) {
                tokenIds[index] = i;
                index++;
            }
        }
        
        return tokenIds;
    }

    /**
     * @dev Check if student has certificate for course
     */
    function hasCertificate(address student, string calldata courseId) external view returns (bool) {
        uint256 tokenId = studentCertificates[student][courseId];
        return tokenId > 0 && _exists(tokenId) && certificates[tokenId].isValid;
    }

    /**
     * @dev Pause certificate issuance
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause certificate issuance
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Override transfer functions to make certificates non-transferable (soulbound)
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override whenNotPaused {
        require(from == address(0) || to == address(0), "EDUCertificate: certificates are non-transferable");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    /**
     * @dev Override supportsInterface
     */
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Override tokenURI
     */
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    /**
     * @dev Override _burn
     */
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    /**
     * @dev Check if address is authorized issuer
     */
    function isIssuer(address account) external view returns (bool) {
        return authorizedIssuers[account];
    }

    /**
     * @dev Get total certificates issued
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter.current() - 1;
    }
}