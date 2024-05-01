
const express = require('express');
const axios = require('axios');
const router = express.Router();
const user = require('../model/usermodel');

const CLIENT_ID = '56213233979-f8f6n82j5rm54931r5jqrktqcsapihv2.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = '/auth/google/callback';

// Initiates the Google Login flow
router.get('/auth/google', (req, res) => {
  const currentBaseUrl = `${req.protocol}://${req.get('host')}`;
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${currentBaseUrl}${REDIRECT_URI}&response_type=code&scope=profile email`;
  res.redirect(url);
});


// Callback URL for handling the Google Login response
router.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;

  try {
    // Exchange authorization code for access token
    const { data } = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      redirect_uri: `${req.protocol}://${req.get('host')}${REDIRECT_URI}`,
      grant_type: 'authorization_code',
    });
    console.log("------------------------->Heoo");
    const { access_token, id_token } = data;

    console.log(data);

    // Use access_token or id_token to fetch user profile
    const { data: profile } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    // Code to handle user authentication and retrieval using the profile data
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
    req.session.email = email;
    req.session.status = "1"
    


    res.redirect('/');

  } catch (error) {
    console.error('Error:', error.response.data.error);
    res.redirect('/');
  }
});

// Logout route
router.get('/logout', (req, res) => {
  // Code to handle user logout
  res.redirect('/');
});

module.exports = router;