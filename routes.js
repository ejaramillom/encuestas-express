const jwt = require( 'jsonwebtoken' );
const mongoose = require( 'mongoose' );
const User = require( './models/user' );
const Poll = require( './models/poll' );
const express = require( 'express' );
const auth = require( './helpers/auth' );
const router = express.Router();

router.use( auth.setUser );

router.get( '/', async ( req, res ) => {
  const polls = await Poll.find();
  res.render( 'index', { polls: polls });
});

router.get( '/register', ( req, res ) => {
  res.render( 'newUser' );
});

router.get( '/newPoll', auth.requireUser, async ( req, res ) => {
  const newPoll = await Poll.find({ user: res.locals.user });
	res.render( 'newPoll' , { newPoll } )
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
  const choiceThree = req.body.choiceThree;
  const user = res.locals.user;

  const data = {
    question: question,
    description: description,
    choices: {
      choiceOne,
      choiceTwo,
      choiceThree
    },
    user: user,
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

router.get( '/polls/:id', async (req, res) => {
  const polls = await Poll.find();
  const poll = await Poll.findById( req.params.id );
  res.render( 'showPoll', { polls: polls, currentPoll: poll });
});

// router.get("/poll/:id/edit", async (req, res, next) => {
//   const polls = await Poll.find();
//   const poll =  await Poll.findById(req.params.id);
//   res.render( "editPoll", { polls: polls, currentPoll: poll });
// });

router.get( '/polls/:id/edit', async (req, res, next) => {
  try {
   const polls = await Poll.find();
   const poll = await Poll.findById( req.params.id );
   res.render( 'editPoll', { polls: polls, currentPoll: poll } )
  }
  catch ( e ) {
    return next( e );
  }
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

router.patch( '/polls/:id', async ( req, res ) => {
  const id = req.params.id;
  const poll = await Poll.findById( id );

  poll.question = req.body.question;
  poll.description = req.body.description;

  try {
    await poll.save();
  } catch ( e ) {
    return next( e );
  }

  res.status(204).send({});
});

router.delete( '/polls/:id', async ( req, res ) => {
  await Poll.deleteOne({ _id: req.params.id });
  res.status( 204 ).send({});
});

router.get( '/logout', auth.requireUser, ( req, res ) => {
  res.clearCookie( 'token' );
  res.redirect( '/login' );
});

module.exports = router;
