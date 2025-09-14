import { expect } from "chai";
import { ethers } from "hardhat";

describe("CourseToken", function () {
  let CourseToken;
  let courseToken;
  let owner;
  let student;
  let otherAccount;

  beforeEach(async function () {
    [owner, student, otherAccount] = await ethers.getSigners();
    CourseToken = await ethers.getContractFactory("CourseToken");
    courseToken = await CourseToken.deploy();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await courseToken.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await courseToken.balanceOf(owner.address);
      const totalSupply = await courseToken.totalSupply();
      expect(ownerBalance).to.equal(totalSupply);
    });
  });

  describe("Course completion", function () {
    it("Should award tokens for course completion", async function () {
      const courseId = 1;
      const initialBalance = await courseToken.balanceOf(student.address);
      await courseToken.awardTokens(student.address, courseId);
      const finalBalance = await courseToken.balanceOf(student.address);
      expect(finalBalance - initialBalance).to.equal(ethers.parseEther("10"));
    });

    it("Should not allow completing the same course twice", async function () {
      const courseId = 1;
      await courseToken.awardTokens(student.address, courseId);
      await expect(courseToken.awardTokens(student.address, courseId))
        .to.be.revertedWith("Course already completed");
    });

    it("Should track completed courses correctly", async function () {
      const courseId = 1;
      await courseToken.awardTokens(student.address, courseId);
      expect(await courseToken.hasCourseCompleted(student.address, courseId)).to.be.true;
      const completedCourses = await courseToken.getCompletedCourses(student.address);
      expect(completedCourses.length).to.equal(1);
      expect(completedCourses[0]).to.equal(courseId);
    });
  });

  describe("Security", function () {
    it("Should only allow owner to award tokens", async function () {
      const courseId = 1;
      await expect(courseToken.connect(otherAccount).awardTokens(student.address, courseId))
        .to.be.revertedWithCustomError(courseToken, "OwnableUnauthorizedAccount");
    });

    it("Should not allow awarding tokens to zero address", async function () {
      const courseId = 1;
      await expect(courseToken.awardTokens(ethers.ZeroAddress, courseId))
        .to.be.revertedWith("Invalid student address");
    });
  });
});