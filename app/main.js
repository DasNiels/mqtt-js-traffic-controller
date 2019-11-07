// fetch config data
const config = require( './config/conn.json' );

// import wrapper
const { trafficData, generateTrafficData, fetchListeners, globalGroupId, MqttWrapper } = require( "./modules/" );

// console.log( JSON.stringify( trafficData ) );
console.log( fetchListeners().length );

// create new instance of wrapper and pass in config data
const mqtt = new MqttWrapper( config, fetchListeners( ), onMessage );

// when a message is recieved, log it's topic and message
function onMessage( topic, data ) {
    console.log( `data recieved: ${ topic }: ${ data.toString( ) }` );

    const [ gId, trafficType, groupId, componentType, action ] = topic.split( '/' );

    if( +gId !== globalGroupId )
        return console.log( '[ERROR] GroupID isnt valid!' );

    const currentTrafficData = trafficData.find( t => t.type === trafficType );

    if( !currentTrafficData )
        return console.log( '[ERROR] Invalid traffic type specified.' );

    const currentTrafficGroup = currentTrafficData.groups.find( g => g.id === +groupId );

    if( !currentTrafficGroup )
        return console.log( '[ERROR] Invalid group ID specified.' );

    // console.log( JSON.stringify( trafficData ) );
}

// run calls in async wrapper to await connection
( async ( ) => {

    // await connection
    await mqtt.connect( );

    // submit data to foo and bar
    mqtt.submit( '16/foot/0/sensor', "2" );
} )( );

setInterval( ( ) => {

    trafficData.forEach( t => {



    } );

}, 500 );