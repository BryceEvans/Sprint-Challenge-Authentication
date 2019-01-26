const axios = require('axios');
// define a database
const db = require('../database/dbConfig');
// define bcrypt
const bcrypt = require('bcryptjs');
// define jwt
const jwt = require('jsonwebtoken');

const { authenticate } = require('../auth/authenticate');

// secret in .env file
const secret = 
  process.env.JWT_SECRET ||


// generate token
function generateToken(user) {
  const payload = {
    username: user.username
  };

  const options = {
    expiresIn: '1hr',
    jwtid: '12345' // jti --> like Luis used in auth-ii lecture
  }
  //return token
  return jwt.sign(payload, secret, options);
  
};

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

function register(req, res) {
  // implement user registration
  const creds = req.body;
  const hash = bcrypt.hashSync(creds.username, 10);
  creds.password = hash;

  db('users')
    .insert(creds)
    .then(ids => {
      const id = ids[0];

      db('users')
        .where({ id })
        .first()
        .then(user => {
          const token = generateToken(user);
          res.status(201).json({ id: user.id, token})
        })
        .catch(err => {
          res.status(500).send(err);
        })
    })
}

function login(req, res) {
  // implement user login
}

function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: 'application/json' },
  };

  axios
    .get('https://icanhazdadjoke.com/search', requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}
