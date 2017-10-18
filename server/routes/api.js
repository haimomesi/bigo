const express = require('express');
const jwt = require('express-jwt');
const jwks = require('jwks-rsa');

const router = express.Router();

// We are going to implement a JWT middleware that will ensure the validity of our token. We'll require each protected route to have a valid access_token sent in the Authorization header
var jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: "https://bigocommerce.auth0.com/.well-known/jwks.json"
  }),
  audience: 'https://auth.bigocommerce.com/',
  issuer: "https://bigocommerce.auth0.com/",
  algorithms: ['RS256']
});

/* GET api listing. */
router.get('/', jwtCheck, (req, res) => {
  res.send('api works');
});

module.exports = router;