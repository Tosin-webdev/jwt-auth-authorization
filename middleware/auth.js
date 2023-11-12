const jwt = require('jsonwebtoken');
const User = require('../model/userModel');


exports.protect = async (req, res, next) => {
  // 1) Getting token and check if its there
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } 

  if (!token) {
    // return res.redirect('/signin');
    return res.status(401).json({ message: "Token is missing" });
  }
  // 2) Verification token
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);
  // console.log(decoded);
  // res.send(decoded);
  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.user_id);
  console.log(currentUser);
  if (!currentUser) {
    return res.status(401).json({ message: "The user belonging to this email does not exist" });
  }

  // Grant Access to protected route
  req.user = currentUser;
  next();
};

// authorization

exports.checkAdmin = async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'You do not have permission to perform this action' });
  }
}