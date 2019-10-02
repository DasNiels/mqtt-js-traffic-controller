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
    console.log( `${ topic }: ${ data.toString( ) }` );

    const [ gId, trafficType, groupId, actionType, action ] = topic.split( '/' );

    if( +gId !== globalGroupId )
        return console.log( '[ERROR] GroupID isnt valid!' );

    const currentTrafficData = trafficData.find( t => t.type === trafficType );

    if( !currentTrafficData )
        return console.log( '[ERROR] Invalid traffic type specified.' );

    const currentTrafficGroup = currentTrafficData.groups.find( g => g.id === +groupId );

    if( !currentTrafficGroup )
        return console.log( '[ERROR] Invalid group ID specified.' );

    if( actionType === 'queue' )
    {
        if( action === 'add' )
            currentTrafficGroup.totalInQueue += +data;
        else
            currentTrafficGroup.totalInQueue -= +data;
    }

    else if( actionType === 'status' )
    {
        currentTrafficGroup.currentStatus = +data;
    }

    console.log( JSON.stringify( trafficData ) );
}

// run calls in async wrapper to await connection
( async ( ) => {

    // await connection
    await mqtt.connect( );

    // submit data to foo and bar
    mqtt.submit( '16/foot/22/queue/add', "2" );
    mqtt.submit( '16/cycle/2/queue/add', "6" );
    mqtt.submit( '16/motorised/10/queue/add', "4" );
    mqtt.submit( '16/vessel/18/queue/add', "3" );
    mqtt.submit( '16/track/20/queue/add', "1" );
} )( );

