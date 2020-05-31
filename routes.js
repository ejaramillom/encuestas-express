const jwt = require( 'jsonwebtoken' );
const mongoose = require( 'mongoose' );
const User = require( './models/User' );
const Poll = require( './models/Poll' );
const express = require( 'express' );
const auth = require( './helpers/auth' );
const router = express.Router();

router.use( auth.setUser );

router.get( '/login', ( req, res ) => {
  res.render( 'login' );
});

router.post( '/login', async ( req, res, next ) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await User.authenticate( email, password );
    if ( user ) {
      const token = jwt.sign({ userId: user._id }, 'secretcode' );
      res.cookie( 'token', token, { expires: new Date( Date.now() + 24*60*60*1000 ), httpOnly: true });
      req.flash( 'success', 'Ingresó correctamente!' );
      return res.redirect( '/' );
    } else {
      res.render( 'login', { error: 'Correo o constraseña incorrecto. Intentalo de nuevo!' });
    }
  } catch ( e ) {
    return next( e );
  }
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
    res.render( 'newUser', { error: 'No debe dejar datos vacios. Intentalo de nuevo!' });
  }
  req.flash( 'success', 'Se creó usuario correctamente! ahora puede ingresar' );
  res.render( '/' );
});

router.get( '/', async ( req, res, next ) => {
  try {
    const polls = await Poll.find().populate( 'User' );
    res.render( 'index', { polls: polls });
  } catch (e) {
    next(e);
  }
});

router.get( '/newPoll', auth.requireUser, async ( req, res ) => {
  const newPoll = await Poll.find({ user: res.locals.user });
	res.render( 'newPoll' , { newPoll } )
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
    user: user._id,
    options: [
          { text: choiceOne },
          { text: choiceTwo },
          { text: choiceThree }
        ]
  };

  try {
    const poll = await Poll.create( data );
  } catch ( e ) {
    res.render( 'newPoll', { error: 'No debe dejar datos vacios!' });
  }
  req.flash( 'success', 'Se creó encuesta correctamente!' );
  res.redirect( '/' );
});

router.get( '/polls/:id', async (req, res) => {
  const polls = await Poll.find().populate( 'user' );
  const poll = await Poll.findById( req.params.id ).populate( 'user' );
  res.render( 'showPoll', { polls: polls, currentPoll: poll });
});

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

router.post( '/polls/:id/vote', async ( req, res, next ) => {
  try {
    const optionId = req.body.option;
    await Poll.update(
      { '_id': req.params.id, 'options._id' : optionId },
      { $inc: { 'options.$.votes': 1 } },
    );
    res.redirect( `/polls/${ req.params.id }/results` );
  } catch (e) {
    next(e);
  }
});

router.get( '/polls/:id/results', async ( req, res, next ) => {
  try{
    const polls = await Poll.find().populate( 'user' );
    const poll = await Poll.findById( req.params.id ).populate( 'user' );
    const path = ( req.protocol + '://' + req.get( 'host' ) + '/polls/' + poll._id );
    res.render( 'resultPoll', { polls: polls, currentPoll: poll, currentPath: path });
  } catch (e) {
    next(e);
  }
});

router.post( '/polls/:id', auth.requireUser, async ( req, res, next ) => {
  const question = req.body.question;
  const description = req.body.description;
  const choiceOne = req.body.choiceOne;
  const choiceTwo = req.body.choiceTwo;
  const choiceThree = req.body.choiceThree;

  try {
    let id = req.params.id;
    const data = {
      question: question,
      description: description,
      options: [
        { text: choiceOne },
        { text: choiceTwo },
        { text: choiceThree },
      ]
    }
    await Poll.update( { _id:id }, data );
    res.redirect( '/' )
  } catch( e ) {
    next( e )
  }

});

router.delete( '/polls/:id', async ( req, res ) => {
  await Poll.deleteOne({ _id: req.params.id });
  res.status( 204 ).send({});
});

router.get( '/logout', auth.requireUser, ( req, res ) => {
  res.clearCookie( 'token' );
  req.flash( 'success', 'Has salido correctamente!' );
  res.redirect( '/' );
});

module.exports = router;
