const express = require( 'express' );
const session = require( 'express-session' );
const cookieParser = require( 'cookie-parser' );
const mongoose = require( 'mongoose' );
const path = require( 'path' );
const User = require( './models/User' );
const Poll = require( './models/Poll' );
const compression = require( 'compression' );
const routes = require( './routes' );
const flash = require( 'connect-flash' );

mongoose.connect( process.env.MONGODB_URI || 'mongodb://localhost:27017/encuestas', { useNewUrlParser: true } );
mongoose.set( 'useFindAndModify', false);

const app = express();
app.set( 'view engine', 'pug' );
app.set( 'views', 'views' );

app.use( express.urlencoded({ extended: true }));
app.use( cookieParser( 'secret' ) );
app.use( session({ cookie: { maxAge: 60000 }}));
app.use( flash() );
app.use( function( req, res, next ){
  res.locals.message = req.flash();
  next();
});

app.use( express.static(__dirname + '../public'));
app.use( '/assets', express.static( path.join( __dirname, 'assets' )));
app.use( '/', routes);
app.use( compression());

module.exports = app;
