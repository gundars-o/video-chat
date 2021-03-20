const socket = io( "/" );
const videoGrid = document.getElementById( "video-grid" );
const myPeer = new Peer( undefined, {
    host: "/",
    port: "3001"
} );
const myVideo = document.createElement( "video" );
myVideo.muted = true;
const peers = {};
navigator.mediaDevices.getUserMedia( {
    video: true,
    audio: true
} ).then( stream => {
    addVideoStream( myVideo, stream );
    myPeer.on( "call", call => {
        call.answer( stream );
        const video = document.createElement( "video" );
        call.on( "stream", userVideoStream => {
            addVideoStream( video, userVideoStream );
        } );
        // DevTools failed to load SourceMap: Could not load content for https://unpkg.com/peerjs.min.js.map: HTTP error: status code 404, net::ERR_HTTP_RESPONSE_CODE_FAILURE
        // You probably have to disable javascript source map in inspect -> settings (Gear icon) -> under sources and then refresh your browser.
        // https://github.com/dart-lang/sdk/issues/41659#issuecomment-673053747
        // Go to inspect -> settings gear -> Uncheck 'enable javascript source maps' and 'enable css source map'.

    } );
    socket.on( "user-connected", userId => {
        connectToNewUser( userId, stream );
    } );
} );
socket.on( "user-disconnected", userId => {
    console.log( `User ${ userId } just left` );
    if ( peers[ userId ] ) peers[ userId ].close();
} );
myPeer.on( "open", id => {
    socket.emit( "join-room", ROOM_ID, id );
} );
/*test code:*/
// socket.on( "user-connected", userId => {
//     console.log( "User connected: " + userId );
// } );
function connectToNewUser( userId, stream ) {
    const call = myPeer.call( userId, stream );
    const video = document.createElement( "video" );
    call.on( "stream", userVideoStream => {
        addVideoStream( video, userVideoStream );
    } );
    call.on( "close", () => {
        video.remove();
    } );
    peers[ userId ] = call;
};
function addVideoStream( video, stream ) {
    video.srcObject = stream;
    video.addEventListener( "loadedmetadata", ()  => {
        video.play();
    } );
    videoGrid.append( video );
};
