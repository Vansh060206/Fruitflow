const { generateSecret, verifySync } = require('otplib');

const secret = generateSecret();
const token = '123456';

const isValid = verifySync({ token, secret });
console.log('Is valid:', isValid);
