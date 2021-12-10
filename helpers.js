//Encryption
const bcrypt = require("bcryptjs");

//authenthication
const authenticateUser = (email, password) => {
  // retrieve the user with that email
  const user = findUserByEmail(email, users);

  // if we got a user back and the passwords match then return the userObj
  if (user && bcrypt.compareSync(password, user.password)) {
    // user is authenticated
    return user;
  } else {
    // Otherwise return false
    return false;
  }
};

//Generate a random string
const generateRandomString = function () {
  let randomString = "";
  for (let i = 0; i < 6; i++) {
    const randomCharCode = Math.floor(Math.random() * 26 + 97);
    const randomChar = String.fromCharCode(randomCharCode);
    randomString += randomChar;
  }
  return randomString;
};

// looks for user in the Database
const findUserByEmail = (email, database) => {
  for (const userId in database) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

module.exports = {
  authenticateUser,
  generateRandomString,
  findUserByEmail,
};
