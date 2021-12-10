const { assert } = require("chai");

const { findUserByEmail } = require("../helpers.js");

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

describe("findUserByEmail", function () {
  it("should return true when both are equal to each other", function () {
    const user = findUserByEmail("user@example.com", testUsers);
    console.log(user);
    const expectedUserID = testUsers.userRandomID;
    console.log(expectedUserID);
    assert.equal(user, expectedUserID);
  });
  it("should return undefine when an email is not in the database", function () {
    const user = findUserByEmail("test@email.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
});
