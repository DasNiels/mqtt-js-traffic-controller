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

    const [ gId, trafficType, groupId, componentType, componentId ] = topic.split( '/' );

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
    console.log( 'sensor active: ', currentTrafficGroup.sensorActivated );

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
    // console.log( +date2 - +date1 > 5000 );
    return +date2 - +date1;
}

function canTurnGreen( g ) {

    if( getTimeDifference( lastAnyRedLight, new Date( ) ) < 5000 )
        return false;

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

    return turnGreen;
}

const maxGreenLightTime = 7500;

let lastAnyRedLight = new Date( );

setInterval( ( ) => {

    let trafficLightsChangedToGreen = 0;
    let trafficLightsChangedToRed = 0;

    let trafficLightsInQueue = [];

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
                        console.log( `${ teamId }/${ t.type }/${ g.id }/traffic_light/0: set to red ` );
                    // }, 2000 );

                    lastAnyRedLight = new Date( );

                    trafficLightsChangedToRed++;
                }
            }

            else if( g.sensorActivated === true && g.currentStatus === TRAFFIC_LIGHT_STATUS.RED )
            {
                if( getTimeDifference( g.lastGreenLight, new Date( ) ) > maxGreenLightTime )
                {
                    trafficLightsInQueue.push( {
                        t: t,
                        group: g,
                        topic: `${ teamId }/${ t.type }/${ g.id }/traffic_light/0`,
                        payload: "2"
                    } );
                }
            }

            // console.log( `trafficlights in queue: ${ trafficLightsInQueue.length }` );
        } );

    } );

    if( trafficLightsInQueue.length === 0 )
        return;

    trafficLightsInQueue.sort( ( t1, t2 ) => +t1.group.lastGreenLight - +t2.group.lastGreenLight );

    if( trafficLightsInQueue.length > 0 )
        console.log( 'trafficlights in queue: ', trafficLightsInQueue.length );

    trafficLightsInQueue.forEach( tl => {

        if( canTurnGreen( tl.group ) )
        {
            let actualTrafficData = trafficData.find( t => t === tl.t );

            if( !actualTrafficData )
                return console.log( "Traffic data couldnt be found." );

            let actualGroup = actualTrafficData.groups.find( g => g === tl.group );

            if( !actualGroup )
                return console.log( "Traffic group couldnt be found." );

            actualGroup.lastGreenLight = new Date( );
            actualGroup.currentStatus = TRAFFIC_LIGHT_STATUS.GREEN;
            mqtt.submit( tl.topic, tl.payload );
            console.log( `${ tl.topic } set to green` );
            trafficLightsChangedToGreen++;
        }
    } );

    if( trafficLightsChangedToGreen > 0 )
        console.log( `Total traffic lights changed to green: ${ trafficLightsChangedToGreen }` );

    if( trafficLightsChangedToRed > 0 )
        console.log( `Total traffic lights changed to red: ${ trafficLightsChangedToRed }` );

}, 500 );