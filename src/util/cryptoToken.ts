import crypto from 'crypto';

const cryptoToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Log the token to the console
console.log(cryptoToken());
export default cryptoToken;