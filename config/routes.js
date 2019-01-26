const axios = require('axios');
// define a database
const db = require('../database/dbConfig');
// define bcrypt
const bcrypt = require('bcryptjs');
// define jwt
const jwt = require('jsonwebtoken');

const { authenticate } = require('../auth/authenticate');

// secret in .env file
const jwtKey =
  process.env.JWT_SECRET ||
// const secret = 'secret';

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
  return jwt.sign(payload, jwtKey, options);
};

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

// // this returns empty array, but creates user
// function register(req, res){
//   const creds = req.body;

//   const hash = bcrypt.hashSync(creds.password, 10);
//   creds.password = hash;

//   db('users')
//     .insert(creds)
//     .then(ids => {
//       const id = ids[0];

//       // find the user using the id
//       db('users')
//         .where({ id })
//         .first()
//         .then(user => {
//           // generate a token
//           const token = generateToken(user);
//           // attach that token to the response
//           res.status(201).json({ id: ids[0], token });
//         })
//         .catch(err => {
//           res.status(500).send(err);
//         })
//     })
//     .catch(err => res.status(500).send(err));
// };

// // This loads forever, but creates user
// function register(req, res) {
//   // implement user registration

//   const creds = req.body;

//   if (creds.username && creds.password) {
//     const hash = bcrypt.hashSync(creds.username, 10);
//     creds.password = hash;

//     db('users')
//     .insert(creds)
//     .then(ids => {
//       const id = ids[0];
//       db('users')
//         .where('id', id)
//         .then(user => {
//           const token = generateToken(user);
//           res.status(201).json({ id: ids[0], token })
//         })
//     })
//     .catch(err => {
//       res.status(500).send(err);
//     })
//   } else {
//     res.status(400).json({ message: "Provide username and password." });
//   }
// }

function register(req, res) {
  // implement user registration
  const newUser = req.body;

  // Only add if username & password are not empty
  if( newUser.username && newUser.password ){
    // hash the password:
    newUser.password = bcrypt.hashSync(newUser.password, 12);

    // Insert into db:
    db(`users`).insert(newUser)
      .then( (newId) => {
        res.status(201).json({ id: newId[0] });
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
