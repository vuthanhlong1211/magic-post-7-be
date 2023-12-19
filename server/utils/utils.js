const bcrypt = require('bcrypt');

const makeSessionId = (length) => {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for( var i=0; i < length; i++ ) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

//causing error
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

//might need to fit company's domain
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

const validatePassword = (password) => {
  // Password should be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~`!@#$%^&*-_+=;"`,.])[A-Za-z\~`!@#$%^&*-_+="`,.]{8,}$/;
  return passwordRegex.test(password);
}

const generateSecurePassword = () => {
  const passwordLength = 12; 
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numberChars = '0123456789';
  const specialChars = '@$!%*?&';

  // Ensure at least one character from each category
  const randomLowercase = getRandomChar(lowercaseChars);
  const randomUppercase = getRandomChar(uppercaseChars);
  const randomNumber = getRandomChar(numberChars);
  const randomSpecialChar = getRandomChar(specialChars);

  // Generate the remaining characters
  const remainingChars = lowercaseChars + uppercaseChars + numberChars + specialChars;
  let generatedPassword = randomLowercase + randomUppercase + randomNumber + randomSpecialChar;

  for (let i = 4; i < passwordLength; i++) {
    const randomIndex = Math.floor(Math.random() * remainingChars.length);
    generatedPassword += remainingChars.charAt(randomIndex);
  }

  return generatedPassword;
}

function getRandomChar(characterSet) {
  const randomIndex = Math.floor(Math.random() * characterSet.length);
  return characterSet.charAt(randomIndex);
}

module.exports = {makeSessionId, hashPassword, validateEmail, validatePassword, generateSecurePassword};