const mongoose = require( 'mongoose' );
const jwt = require( 'jsonwebtoken' );
const User = require( './models/user' );
const Poll = require( './models/poll' );
const PollSchema = require( './models/poll' ).PollSchema;
const express = require( 'express' );
const router = express.Router();
const auth = require( './helpers/auth' );
router.use( auth.setUser );

router.get( '/', async ( req, res ) => {
  const polls = await Poll.find();
  res.render( 'index', { polls: polls });
});

router.get( '/newPoll', auth.requireUser, async ( req, res ) => {
  const newPoll = await Poll.find({ user: res.locals.user });
	res.render( "newPoll" , { newPoll } )
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

router.get( '/:id', async (req, res) => {
  const polls = await Poll.find();
  const poll = await Poll.findById( req.params.id );
  res.render( 'showPoll', { polls: polls, currentPoll: poll });
});

router.post( '/login', async ( req, res, next ) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await User.authenticate( email, password );
    if ( user ) {
      const token = jwt.sign({ userId: user._id }, 'secretcode' );
      res.cookie( 'token', token, { expires: new Date( Date.now() + 24*60*60*1000 ), httpOnly: true });
      return res.redirect( '/' );
    } else {
      res.render( 'login', { error: 'Correo o constraseña incorrecto. Intentalo de nuevo!' });
    }
  } catch ( e ) {
    return next( e );
  }
});

router.delete( '/:id', async ( req, res ) => {
  await Poll.deleteOne({ _id: req.params.id });
  res.status( 204 ).send({});
});

router.get( '/logout', auth.requireUser, ( req, res ) => {
  res.clearCookie( 'token' );
  res.clearCookie( 'session' );
	res.clearCookie( 'session.sig' );
  res.redirect( '/' );
});

module.exports = router;
