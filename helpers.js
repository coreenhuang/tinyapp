const generateRandomString = function() {

  const charAndNum = ['ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890'];

  let newID = '';

  for (let i = 0; i < 6; i++) {
    newID += charAndNum[0][Math.floor(Math.random() * charAndNum[0].length)];
  }

  return newID;
}

const getUserByEmail = function(email, database) {

  for (const id in database) {
   const user = database[id];
   if (user.email === email) {
    return user;
   } 
  }
}

const urlsForUser = function(userID, database) {

  const urls = {};

  const keys = Object.keys(database);

  for (const key of keys) {
    const url = database[key];
    if (url.userID === userID) {
      urls[key] = url;
    }
  }

  return urls;
}

module.exports = {generateRandomString, getUserByEmail, urlsForUser};