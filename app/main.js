// fetch config data
const config = require( './config/conn.json' );

// import wrapper
import { MqttTrafficLights } from "./modules/init";

// create new instance of wrapper and pass in config data
const mqtt = new MqttTrafficLights( config, [ 'foo', 'bar' ], onMessage );

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
    mqtt.unsubscribeFromTopic( 'foo' );

    // this wont log cause we're no longer subscribed to foo
    mqtt.submit( 'foo', 'testing3' );

    // subscribe to a new topic called "more"
    mqtt.subscribeToTopic( 'more' );

    // submit something to more
    mqtt.submit( 'more', 'something' );
} )( );

