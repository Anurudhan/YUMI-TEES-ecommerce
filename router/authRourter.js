const express = require('express');
const axios = require('axios');
const router = express()
const user = require('../model/usermodel')
const product = require('../model/productSchema')
const bcrypt = require('bcrypt');

const CLIENT_ID = "1064120531339-ft6gbehuig5s02l7h680vg7u8n5fdmav.apps.googleusercontent.com"
const CLIENT_SECRET = "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"
const REDIRECT_URI = 'http://localhost:3000/auth/google/callback';


// Initiates the Google Login flow
router.get('/auth/google', (req, res) => {
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=profile email;`
  res.redirect(url);
});


// Callback URL for handling the Google Login response
router.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;

  try {
    const { data } = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    });
    const { access_token, id_token } = data;
    const { data: profile } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      headers: { Authorization: `Bearer ${access_token}`},
    });

    // code for retrive user data
    const { id, name, email } = profile;
    console.log(id, name, email);

    let users = await user.findOne({ email });

    if (!users) {
      users = new user({
        name: name,
        email: email
        // password: id
      });
      await users.save();
    }
    req.session.logged = true;
    req.session.userEmail = email;
    req.session.status = "1"
    


    res.redirect('/');
  } catch (error) {
    if (error.response && error.response.data && error.response.data.error) {
        console.error('Error:', error.response.data.error);
      } else {
        console.error('Error:', error.message);
      }
      res.redirect('/');
    }
});

// Logout route
router.get('/logout', (req, res) => {
    req.session.logged=false;
  // Code to handle user logout
  res.redirect('/');
});

module.exports = router