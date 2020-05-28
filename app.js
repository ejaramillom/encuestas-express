const express = require( 'express' );
const cookieParser = require( 'cookie-parser' );
const mongoose = require( 'mongoose' );
const path = require( 'path' );
const User = require( './models/User' );
const Poll = require( './models/Poll' );
const routes = require( './routes' );

mongoose.connect( process.env.MONGODB_URL || 'mongodb://localhost:27017/encuestas', { useNewUrlParser: true } );

const app = express();
app.set( 'view engine', 'pug' );
app.set( 'views', 'views' );

app.use( express.urlencoded({ extended: true }));
app.use( cookieParser() );

app.use( express.static(__dirname + '../public'));
app.use( '/assets', express.static( path.join( __dirname, 'assets' )));
app.use('/', routes);

app.listen( 3000, () => console.log( 'Corriendo en el puerto 3000 ...' ));
