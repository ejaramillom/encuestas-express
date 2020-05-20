const express = require( 'express' );
const cookieSession = require( 'cookie-session' )
const cookieParser = require( 'cookie-parser' );
const jwt = require( 'jsonwebtoken' );
const mongoose = require( 'mongoose' );
const path = require( 'path' );
require( './models/user' );
const routes = require( './routes' );

mongoose.connect( process.env.MONGODB_URL || 'mongodb://localhost:27017/encuestas', { useNewUrlParser: true } );

const app = express();
app.set( 'view engine', 'pug' );
app.set( 'views', 'views' );
app.use( express.urlencoded({ extended: true }));
app.use( cookieParser() );
app.use( cookieSession({
  secret: 'session',
  maxAge: 24 * 60 * 60 * 1000
}));
app.use( express.static(__dirname + '../public'));
app.use( '/assets', express.static( path.join( __dirname, 'assets' )));
app.use('/', routes);

app.listen( 3000, () => console.log( 'Corriendo en el puerto 3000 ...' ));
