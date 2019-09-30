// fetch config data
const config = require( './config/conn.json' );

// import wrapper
import { MqttWrapper } from "./modules/mqtt-wrapper";

import { getListeners } from './modules/listeners';

console.log( getListeners().join( ', ' ) );
console.log( getListeners().length );

// create new instance of wrapper and pass in config data
const mqtt = new MqttWrapper( config, getListeners( ), onMessage );

// when a message is recieved, log it's topic and message
function onMessage( topic, message ) {
    console.log( `${ topic }: ${ message.toString( ) }` );
}

// run calls in async wrapper to await connection
( async ( ) => {

    // await connection
    await mqtt.connect( );

    // submit data to foo and bar
    mqtt.submit( 'foo', 'testing' );
    mqtt.submit( 'bar', 'testing2' );

    // unsubscribe from foo
    mqtt.removeListener( 'foo' );

    // this wont log cause we're no longer subscribed to foo
    mqtt.submit( 'foo', 'testing3' );

    // subscribe to a new topic called "more"
    mqtt.addListener( 'more' );

    // submit something to more
    mqtt.submit( 'more', 'something' );
} )( );

