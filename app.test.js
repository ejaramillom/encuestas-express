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
  await mongoose.disconnect();
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

  test( 'responde afirmativo si se autentia el usuario', async () => {
    const credentials = { email: 'usuario@ghotmail.com', password: 'usuario', name: 'usuario' };
    const user = await User.create( credentials );
    const agent = await signIn( credentials );
    const response = await agent.get( '/' );
    expect( response.statusCode ).toBe( 200 );
  });
});

test( 'usuario se puede registrar e ingresar', async () => {
  const nav = page.waitForNavigation();

  await page.goto( 'http://localhost:3000/' );
  await page.click( 'a[ href = "/login" ]' );
  await nav;
  await page.click( 'a[ href = "/register" ]' );

  // registrarse
  await page.waitFor( 'input[ id = email ]' );
  await page.type( 'input[ id = email ]', 'pedro@gmail.com' );
  await page.type( 'input[ id = password ]', 'test1234' );
  await page.click( 'button[ type = submit ]' );
  await nav;

  // login
  expect( page.url()).toBe( '/' );
  await page.type( 'input[id=email]', 'pedro@gmail.com' );
  await page.type( 'input[id=password]', 'test1234' );

  expect(page.url()).toBe("/");
});
