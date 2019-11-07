// fetch config data
const config = require( './config/conn.json' );

// import wrapper
const { trafficData, generateTrafficData, fetchListeners, teamId, MqttWrapper, TRAFFIC_LIGHT_STATUS, WARNING_LIGHT_STATUS, SENSOR_STATUS, componentTypes, BARRIER_STATUS } = require( "./modules/" );

// console.log( JSON.stringify( trafficData ) );
console.log( fetchListeners().length );

// create new instance of wrapper and pass in config data
const mqtt = new MqttWrapper( config, fetchListeners( ), onMessage );

// when a message is recieved, log it's topic and message
function onMessage( topic, data ) {
    console.log( `data recieved: ${ topic }: ${ data.toString( ) }` );

    const [ gId, trafficType, groupId, componentType, action ] = topic.split( '/' );

    if( +gId !== teamId )
        return console.log( '[ERROR] GroupID isnt valid!' );

    const currentTrafficData = trafficData.find( t => t.type === trafficType );

    if( !currentTrafficData )
        return console.log( '[ERROR] Invalid traffic type specified.' );

    const currentTrafficGroup = currentTrafficData.groups.find( g => g.id === +groupId );

    if( !currentTrafficGroup )
        return console.log( '[ERROR] Invalid group ID specified.' );

    if( componentType !== "sensor" )
        return console.log( "[ERROR] Component is not a sensor." );

    currentTrafficGroup.sensorActivated = +data === 1;


    // console.log( JSON.stringify( trafficData ) );
}

// run calls in async wrapper to await connection
( async ( ) => {

    // await connection
    await mqtt.connect( );

    // submit data to foo and bar
    // mqtt.submit( '16/motorised/0/traffic_light/0', "2" );
} )( );

function getTimeDifference( date1, date2 ) {
    return +date2 - +date1;
}

const maxGreenLightTime = 5000;

setInterval( ( ) => {

    let trafficLightsChanged = 0;

    trafficData.forEach( t => {

        t.groups.forEach( g => {

            if( g.currentStatus === TRAFFIC_LIGHT_STATUS.GREEN )
            {
                if( g.sensorActivated === false || getTimeDifference( g.lastGreenLight, new Date( ) ) > maxGreenLightTime )
                {
                    // g.currentStatus = TRAFFIC_LIGHT_STATUS.ORANGE;
                    // mqtt.submit( `${ teamId }/${ t.type }/${ g.id }/traffic_light/0`, "1" );

                    // setTimeout( ( ) => {
                        g.currentStatus = TRAFFIC_LIGHT_STATUS.RED;
                        mqtt.submit( `${ teamId }/${ t.type }/${ g.id }/traffic_light/0`, "0" );
                    // }, 2000 );

                    trafficLightsChanged++;
                }
            }

            if( g.sensorActivated === true && g.currentStatus === TRAFFIC_LIGHT_STATUS.RED )
            {
                if( getTimeDifference( g.lastGreenLight, new Date( ) ) > maxGreenLightTime )
                {

                    let turnGreen = true;

                    g.disallowedTrafficLights.forEach( dt => {

                        let tlData = trafficData.find(td => td.type === dt.type);

                        if( tlData )
                        {
                            let trafficLight = tlData.groups.find( tg => tg.id === dt.groupId );

                            if( trafficLight )
                            {
                                if( trafficLight.currentStatus === TRAFFIC_LIGHT_STATUS.GREEN )
                                    turnGreen = false;
                            }
                        }

                    } );

                    if( turnGreen )
                    {
                        g.lastGreenLight = new Date( );
                        g.currentStatus = TRAFFIC_LIGHT_STATUS.GREEN;
                        mqtt.submit( `${ teamId }/${ t.type }/${ g.id }/traffic_light/0`, "2" );

                        trafficLightsChanged++;
                    }

                }
            }

        } );

    } );

    console.log( `Total traffic lights changed: ${ trafficLightsChanged }` );

}, 500 );