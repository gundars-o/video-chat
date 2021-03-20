require( "dotenv" ).config();
const express = require( "express" );
const app = express();

//????
const cors = require( 'cors' );
app.use( cors() );

const server = require( "http" ).Server( app );
// const io = require( "socket.io" )( server );
//????
const io = require( "socket.io" )( server, { cors: { origin: "*" } }  );

const { v4: uuidV4 } = require( "uuid" );
app.set( "view engine", "ejs" );
app.use( express.static( "public" ) );
app.get( "/", ( req, res ) => {
    res.redirect( `/${ uuidV4() }` );
} )/*gives a dinamic (random) url
http://localhost:3000/aa97a9bf-952d-49b1-96a0-d5363207b0a4*/;
app.get( "/:room", ( req, res ) => {
    res.render( "room", { roomId: req.params.room } );
} );
io.on( "connection", socket => {
    socket.on( "join-room", ( roomId, userId ) => {
        // console.log( roomId, userId );
        socket.join( roomId );
        socket.to( roomId ).broadcast.emit( "user-connected", userId );
        socket.on( "disconnect", () => {
            socket.to( roomId ).broadcast.emit( "user-disconnected", userId );
        } );
    } );
} );
const port = process.env.PORT || 3000;
// server.listen( 3000 );
server.listen( port );
