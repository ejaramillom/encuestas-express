const request = require( 'supertest' );
const app = require( './app' );
const mongoose = require( 'mongoose' );
const puppeteer = require( 'puppeteer' );
const User = require( './models/User' );
const Poll = require( './models/Poll' );

request.agent.prototype._saveCookies = function( res ) {
  const cookies = res.headers[ 'set-cookie' ];
  if ( cookies ) this.jar.setCookies( cookies[ 0 ].split( ',' ));
};

let server;
let page;
let browser;
beforeAll(async () => {
  server = app.listen( 3000 );

  browser = await puppeteer.launch({
    headless: true,
    args: [ `--window-size=1920,1080` ]
  });
  page = await browser.newPage();
});

beforeEach( async () => {
  for ( var i in mongoose.connection.collections ) {
    await mongoose.connection.collections[ i ].remove({});
  }
});

afterAll(async () => {
  server.close();
  await mongoose.disconnect();
  browser.close();
});

describe( '/', () => {
  test( 'GET / responde afirmativo', async () => {
    const response = await request( app ).get('/');
    expect( response.statusCode ).toBe( 200 );
  });
});

describe( '/login', () => {
  test( 'GET / login responde afirmativo', async () => {
    const response = await request( app ).get( '/login' );
    expect( response.statusCode ).toBe( 200 );
  });
});

describe( '/register', () => {
  test( 'GET /register responde afirmativo', async () => {
    const response = await request( app ).get( '/register' );
    expect( response.statusCode ).toBe( 200 );
  });
});

const signIn = async ( credentials ) => {
  const agent = request.agent( app );
  await agent.post( '/login' )
    .type( 'form' )
    .send( credentials );
  return agent;
}

describe( 'GET /newPoll', () => {
  test( 'redirige a login si trata de crear encuesta sin autenticar', async () => {
    const response = await request( app ).get( '/newPoll' );
    expect( response.statusCode ).toBe( 302 );
    expect( response.headers.location ).toBe( '/login' );
  });

  test( 'responde afirmativo si se autentica el usuario', async () => {
    const credentials = { email: 'usuario@hotmail.com', password: 'usuario', name: 'usuario' };
    const user = await User.create( credentials );
    const agent = await signIn( credentials );
    const response = await agent.get( '/' );
    expect( response.statusCode ).toBe( 200 );
  });
});

test( 'usuario se puede registrar e ingresar', async () => {
  await page.goto( "http://localhost:3000/login" );
  await page.click( 'a[ href = "/register" ]' );
  await page.waitFor( 'input[ id = email ]' );
  await page.type( 'input[ id = email ]', 'nuevousuario@gmail.com' );
  await page.type( 'input[ id = password ]', 'testusuario' );
  await page.type( 'input[ id = name ]', 'nuevousuario' );
  await page.click( 'button[ type = submit ]');
  await page.waitForNavigation();

  expect( page.url()).toBe( '/' );
  await page.click( 'a[ href = "/login" ]' );
  await page.type( 'input[ id = email ]', 'nuevousuario@gmail.com' );
  await page.type( 'input[ id = password ]', 'testusuario' );
  await page.click( 'button[ type = submit ]');

});
