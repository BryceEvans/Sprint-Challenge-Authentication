const axios = require('axios');
// define a database
const db = require('../database/dbConfig');
// define bcrypt
const bcrypt = require('bcryptjs');
// define jwt
const jwt = require('jsonwebtoken');

const { authenticate } = require('../auth/authenticate');

// secret in .env file
// const jwtKey =
//   process.env.JWT_SECRET ||

const secret = 'secret';

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

// This returns the id, but not the token, and creates user.
function register(req, res) {
  // implement user registration
  const creds = req.body;

  // Only add if username & password are not empty
  if (creds.username && creds.password) {
    // hash the password:
    creds.password = bcrypt.hashSync(creds.password, 12);

    // Insert into db:
    db(`users`).insert(creds)
      .then( (newID) => {
        // const token = generateToken(newID)
        res.status(201).json({ id: newID[0] });
      })
      .catch( (err) =>{
        res.status(500).json({ error: `Could not register new user: ${err}` });
      });
    // end-db.insert
  } else {
    // Missing username or password
    res.status(400).json({ error: "Please enter a username and a password." });
  }
}

function login(req, res) {
  // implement user login
  const creds = req.body;

  if (creds.username && creds.password) {
    db('users')
      .where('username', creds.username)
      .then(user => {
        if (user.length && bcrypt.compareSync(creds.password, user[0].password)) {
          const token = generateToken(user[0]);
          res.status(201).json({ message: 'User logged in', token });
        } else {
          res.status(401).json({ message: "Invaled credentials" });
        }
      })
      .catch(err => {
        res.status(500).send(err);
      })
  } else {
    res.status(400).json({ message: "Provide both username and passowrd." })
  }
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
