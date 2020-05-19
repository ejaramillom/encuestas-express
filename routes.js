const mongoose = require( 'mongoose' );
const User = require( './models/user' );
const Poll = require( './models/poll' );
const PollSchema = require( './models/poll' ).PollSchema;
const express = require( 'express' );
const router = express.Router();
const requireUser = async ( req, res, next ) => {
  const userId = req.session.userId;
  if ( userId ) {
    const user = await User.findOne({ _id: userId });
    res.locals.user = user;
    next();
  } else {
    return res.redirect( '/login' );
  }
}

router.get( '/', requireUser, async ( req, res ) => {
  const polls = await Poll.find();
  res.render( 'index', { polls: polls });
});

router.get( '/register', ( req, res ) => {
  res.render( 'newUser' );
});

router.post( '/register', async ( req, res ) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  const data = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  };

  try {
    const user = await User.create( data );
  } catch ( e ) {
    console.error( e );
  }
  res.redirect( '/' );
});

router.get( '/newPoll', ( req, res ) => {
  res.render( 'newPoll' );
});

router.post( '/newPoll', async ( req, res ) => {
  const question = req.body.question;
  const description = req.body.description;
  const choiceOne = req.body.choiceOne;
  const choiceTwo = req.body.choiceTwo;
  const user = res.locals.user;

  const data = {
    question: question,
    description: description,
    choices: {
      choiceOne,
      choiceTwo
    },
    user: user
  };

  try {
    const poll = await Poll.create( data );
  } catch ( e ) {
    console.error( e );
  }
  res.redirect( '/' );
});

router.get( '/login', ( req, res ) => {
  res.render( 'login' );
});

router.post( '/login', async function( req, res ) {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await User.authenticate( email, password );
    if ( user ) {
      req.session.userId = user._id;
      return res.redirect( '/' );
    } else {
      res.render( 'login', { error: 'Email incorrecto! intenta de nuevo' });
    }
  } catch ( e ) {
    return next( e );
  }
});

router.get( '/logout', ( req, res ) => {
  res.clearCookie( 'token' );
  res.redirect( '/login' );
});

module.exports = router;
