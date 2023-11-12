const express = require('express');
const bcrypt = require('bcryptjs')
const User = require('./model/userModel')
const jwt = require('jsonwebtoken')
const auth = require('./middleware/auth')
const app = express();

// load env variables
require('dotenv').config()
// import database
require('./config/database')

const port = 3000;


app.use(express.json());

// Handling user registration endpoint
app.post('/register', async (req, res) =>{

 // Extracting user information from the request body
  const {firstName, lastName, email, password, role} = req.body

 // Hashing the user's password with bcrypt for security
  const hashedPassword = await bcrypt.hash(password, 12);

 // Creating a new user in the database with hashed password
  const user = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    role
  });

 // Generating a JWT token for the newly registered user
  const token = jwt.sign(
    { user_id: user._id },
    process.env.JWT_SECRET,
    {
      expiresIn: "5h",
    }
  );

 // Sending a success response with the token and user information
    res.status(201).json({
      status: 'success',
      token,
      user
    })
});

// Handle user login endpoint
app.post('/login', async (req, res) =>{

  // Extract email and password from the request body
  const { email, password } = req.body;

  // Query the database to find a user with the provided email
  const user = await User.findOne({ email })

  // Return a 404 status with an error message if the user is not found
  if(!user){
    return res.status(404).json({ message: "User doesn't exist" });
  }

  // Verify the provided password against the hashed password in the database
   const isPasswordCorrect = await bcrypt.compare(password, user.password);

  // If the password is incorrect, return a 400 status with an error message
   if (!isPasswordCorrect)
      return res.status(400).json({ message: "Invalid credentials" });

  // If the user is authenticated, generate a JWT token
    const token = jwt.sign({ user_id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "5h",
    });

  // Send a successful response with the generated token and user information
     res.status(200).json({
      status: 'success',
      token,
      user
    })
})

app.get('/verified', auth.protect, (req, res) =>{
  res.status(200).send('authenticated page')
})

// only admin can have access to this route
app.get('/admin', auth.protect, auth.checkAdmin, (req, res) =>{
  res.status(200).send('Welcome to the authorized page')
})

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

