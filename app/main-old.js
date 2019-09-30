// var mqtt = require( 'mqtt' );
//

//
// var client  = mqtt.connect( config );
//
// client.on( 'connect', ( ) => {
//     client.subscribe( 'crossroads' );
//     sendStateUpdate( 'asd' );
// } );
//
// function sendStateUpdate ( state ) {
//     console.log('sending state: ', state );
//     client.publish('crossroads', state );
// }
//
// client.on( 'message', ( topic, message ) => {
//     // message is Buffer
//     console.log( `${ topic }: ${ message.toString( ) }` );
//     client.end( )
// } );
//