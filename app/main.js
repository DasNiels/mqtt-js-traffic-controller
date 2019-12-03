// fetch config data
const config = require( './config/conn.json' );

// import wrapper
const { trafficData, generateTrafficData, fetchListeners, teamId, MqttWrapper, TRAFFIC_LIGHT_STATUS, WARNING_LIGHT_STATUS, SENSOR_STATUS, componentTypes, BOAT_LIGHT_STATUS, DECK_STATUS, BARRIER_STATUS } = require( "./modules/" );

// console.log( JSON.stringify( trafficData ) );
// console.log( fetchListeners().length );

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

    currentTrafficGroup.sensorStatuses[ componentId ] = +data === 1;
    console.log( `sensor [${ topic }] active: `, currentTrafficGroup.sensorStatuses[ componentId ] );

    // console.log( JSON.stringify( trafficData ) );
}

// run calls in async wrapper to await connection
( async ( ) => {

    // await connection
    await mqtt.connect( );

    // submit data to foo and bar
    // mqtt.submit( '16/vessel/0/warning_light/0', "1" );
} )( );

function getTimeDifference( date1, date2 ) {
    // console.log( +date2 - +date1 > 5000 );
    return +date2 - +date1;
}

function canTurnGreen( g ) {

    // if( getTimeDifference( lastAnyRedLight, new Date( ) ) < 5000 )
    //     return false;

    let turnGreen = true;

    g.disallowedTrafficLights.forEach( dt => {

        let tlData = trafficData.find(td => td.type === dt.type);

        if( tlData )
        {
            let trafficLight = tlData.groups.find( tg => tg.id === dt.groupId );

            if( trafficLight )
            {
                if( trafficLight.currentStatus !== TRAFFIC_LIGHT_STATUS.RED || trafficLight.warningLightStatus === WARNING_LIGHT_STATUS.ON )
                    turnGreen = false;
            }
        }

    } );

    return turnGreen;
}

function setAllLightsToRed( ) {

    trafficData.forEach( t => {
        t.groups.forEach( g => {
            if( t.type === 'motorised' )
            {
                setMotorisedLightToRed( t, g );
            }
        } );
    } );

}

function setMotorisedLightToRed( t, g ) {

    if( g.currentStatus !== TRAFFIC_LIGHT_STATUS.GREEN )
        return;

    g.currentStatus = TRAFFIC_LIGHT_STATUS.ORANGE;
    mqtt.submit( `${ teamId }/${ t.type }/${ g.id }/traffic_light/0`, "1" );
    console.log( `${ teamId }/${ t.type }/${ g.id }/traffic_light/0: set to orange ` );


    setTimeout( ( ) => {

        if( t.type === 'cycle' || t.type === 'foot' )
            g.sensorStatuses.fill( false );

        g.currentStatus = TRAFFIC_LIGHT_STATUS.RED;
        mqtt.submit( `${ teamId }/${ t.type }/${ g.id }/traffic_light/0`, "0" );
        console.log( `${ teamId }/${ t.type }/${ g.id }/traffic_light/0: set to red ` );
    }, 2000 );
}

function tryOpenBridge( tl, actualGroup ) {
    setTimeout( ( ) => {
        if( tl.group.sensorStatuses[ 3 ] )
            return tryOpenBridge( tl, actualGroup );

        actualGroup.barrierStatus = BARRIER_STATUS.CLOSED;
        mqtt.submit( `${ teamId }/${ tl.t.type }/${ actualGroup.id }/barrier/0`, `${ BARRIER_STATUS.CLOSED }` );

        setTimeout( ( ) => {
            actualGroup.currentStatus = TRAFFIC_LIGHT_STATUS.GREEN;
            mqtt.submit( `${ teamId }/${ tl.t.type }/${ actualGroup.id }/deck/0`, `${ DECK_STATUS.OPEN }` );

            setTimeout( ( ) => {
                mqtt.submit( `${ teamId }/${ tl.t.type }/${ actualGroup.id }/boat_light/0`, `${ BOAT_LIGHT_STATUS.GREEN }` );
                mqtt.submit( `${ teamId }/${ tl.t.type }/${ actualGroup.id }/boat_light/1`, `${ BOAT_LIGHT_STATUS.GREEN }` );
            }, 10000 );
        }, 4000 );

    }, 3000 );
}

function tryCloseBridge( t, g ) {

    setTimeout( ( ) => {

        mqtt.submit( `${ teamId }/${ t.type }/${ g.id }/boat_light/0`, `${ BOAT_LIGHT_STATUS.RED }` );
        mqtt.submit( `${ teamId }/${ t.type }/${ g.id }/boat_light/1`, `${ BOAT_LIGHT_STATUS.RED }` );

        if( g.sensorStatuses[ 1 ] )
            return tryCloseBridge( t, g );

        g.currentStatus = TRAFFIC_LIGHT_STATUS.RED;
        mqtt.submit( `${ teamId }/${ t.type }/${ g.id }/deck/0`, `${ DECK_STATUS.CLOSED }` );

        setTimeout( ( ) => {
            mqtt.submit( `${ teamId }/${ t.type }/${ g.id }/barrier/0`, `${ BARRIER_STATUS.OPEN }` );
            g.barrierStatus = BARRIER_STATUS.OPEN;

            setTimeout( ( ) => {
                mqtt.submit( `${ teamId }/${ t.type }/${ g.id }/warning_light/0`, `${ WARNING_LIGHT_STATUS.OFF }` );
                g.warningLightStatus = WARNING_LIGHT_STATUS.OFF;
            }, 4000 );

        }, 10000 );

    }, 1000 );
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
                if( g.sensorStatuses.every( s => s === false ) || getTimeDifference( g.lastGreenLight, new Date( ) ) > maxGreenLightTime )
                {
                    if( t.type === 'track' )
                    {
                        if( g.sensorStatuses.every( s => s === false ) )
                        {
                            mqtt.submit( `${ teamId }/${ t.type }/${ g.id }/barrier/0`, `${ BARRIER_STATUS.OPEN }` );
                            g.barrierStatus = BARRIER_STATUS.OPEN;

                            setTimeout( ( ) => {
                                g.warningLightStatus = WARNING_LIGHT_STATUS.OFF;
                                mqtt.submit( `${ teamId }/${ t.type }/${ g.id }/warning_light/0`, `${ WARNING_LIGHT_STATUS.OFF }` );
                                mqtt.submit( `${ teamId }/${ t.type }/${ g.id }/train_light/0`, `${ TRAFFIC_LIGHT_STATUS.RED }` );
                                mqtt.submit( `${ teamId }/${ t.type }/${ g.id }/train_light/1`, `${ TRAFFIC_LIGHT_STATUS.RED }` );

                            }, 4000 );

                            g.currentStatus = TRAFFIC_LIGHT_STATUS.RED;
                        }

                    }
                    else if( t.type === 'vessel' )
                    {
                        if( g.sensorStatuses.every( s => s === false ) )
                            tryCloseBridge( t, g );
                    }
                    else
                    {
                        setMotorisedLightToRed( t, g );
                    }

                    lastAnyRedLight = new Date( );

                    trafficLightsChangedToRed++;
                }
            }

            else if( g.sensorStatuses.some( ( s, i ) => s === true && i !== 3 && i !== 1 ) && g.currentStatus === TRAFFIC_LIGHT_STATUS.RED )
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
        } );

    } );

    if( trafficLightsInQueue.length === 0 )
        return;

    trafficLightsInQueue.sort( ( t1, t2 ) => +t1.group.lastGreenLight - +t2.group.lastGreenLight );

    let trainIdx = trafficLightsInQueue.findIndex( tliq => tliq.t.type === 'track' );
    let boatIdx = trafficLightsInQueue.findIndex( tliq => tliq.t.type === 'vessel' );

    if( trainIdx !== -1 ) {
        let firstItem = trafficLightsInQueue[ 0 ];

        trafficLightsInQueue[ 0 ] = trafficLightsInQueue[ trainIdx ];
        trafficLightsInQueue[ trainIdx ] = firstItem;
    }

    if( boatIdx !== -1 ) {

        let newIdx = trainIdx === -1 ? 0 : 1;

        let item = trafficLightsInQueue[ newIdx ];

        trafficLightsInQueue[ newIdx ] = trafficLightsInQueue[ boatIdx ];
        trafficLightsInQueue[ boatIdx ] = item;
    }

    if( trafficLightsInQueue.length > 0 )
        console.log( 'trafficlights in queue: ', trafficLightsInQueue.length );

    trafficLightsInQueue.forEach( tl => {

        let actualTrafficData = trafficData.find( t => t === tl.t );

        if( !actualTrafficData )
            return console.log( "Traffic data couldnt be found." );

        let actualGroup = actualTrafficData.groups.find( g => g === tl.group );

        if( !actualGroup )
            return console.log( "Traffic group couldnt be found." );

        if( tl.t.type === 'track' )
        {
            if( actualGroup.warningLightStatus === WARNING_LIGHT_STATUS.OFF )
            {
                setAllLightsToRed( );

                actualGroup.warningLightStatus = WARNING_LIGHT_STATUS.ON;
                mqtt.submit( `${ teamId }/${ tl.t.type }/${ actualGroup.id }/warning_light/0`, `${ WARNING_LIGHT_STATUS.ON }` );

                setTimeout( ( ) => {
                    actualGroup.barrierStatus = BARRIER_STATUS.CLOSED;
                    mqtt.submit( `${ teamId }/${ tl.t.type }/${ actualGroup.id }/barrier/0`, `${ BARRIER_STATUS.CLOSED }` );

                    setTimeout( ( ) => {
                        actualGroup.currentStatus = TRAFFIC_LIGHT_STATUS.GREEN;
                        mqtt.submit( `${ teamId }/${ tl.t.type }/${ actualGroup.id }/train_light/0`, `${ TRAFFIC_LIGHT_STATUS.ORANGE }` );
                        mqtt.submit( `${ teamId }/${ tl.t.type }/${ actualGroup.id }/train_light/1`, `${ TRAFFIC_LIGHT_STATUS.ORANGE }` );
                    }, 4000 );
                }, 5000 );

                trafficLightsChangedToGreen++;
            }
        }

        if( tl.t.type === 'vessel' )
        {
            if( actualGroup.warningLightStatus === WARNING_LIGHT_STATUS.OFF )
            {
                setAllLightsToRed( );

                actualGroup.warningLightStatus = WARNING_LIGHT_STATUS.ON;
                mqtt.submit( `${ teamId }/${ tl.t.type }/${ actualGroup.id }/warning_light/0`, `${ WARNING_LIGHT_STATUS.ON }` );

                tryOpenBridge( tl, actualGroup );
                trafficLightsChangedToGreen++;
            }
        }

        if( tl.t.type === 'motorised' || tl.t.type === 'cycle' || tl.t.type === 'foot' )
        {
            if( canTurnGreen( tl.group ) )
            {
                actualGroup.lastGreenLight = new Date( );
                actualGroup.currentStatus = TRAFFIC_LIGHT_STATUS.GREEN;

                mqtt.submit( tl.topic, tl.payload );

                console.log( `${ tl.topic } set to green` );
                trafficLightsChangedToGreen++;
            }
        }
    } );

    if( trafficLightsChangedToGreen > 0 )
        console.log( `Total traffic lights changed to green: ${ trafficLightsChangedToGreen }` );

    if( trafficLightsChangedToRed > 0 )
        console.log( `Total traffic lights changed to red: ${ trafficLightsChangedToRed }` );

}, 500 );