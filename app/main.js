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

    // split the string on '/' and store each item in it's own variable
    const [ gId, trafficType, groupId, componentType, componentId ] = topic.split( '/' );

    // if the group ID doesn't match ours
    if( +gId !== teamId )
        return console.log( '[ERROR] GroupID isnt valid!' );

    // get the current traffic data by type
    const currentTrafficData = trafficData.find( t => t.type === trafficType );

    // if data couldnt be found
    if( !currentTrafficData )
        return console.log( '[ERROR] Invalid traffic type specified.' );

    // fetch the group
    const currentTrafficGroup = currentTrafficData.groups.find( g => g.id === +groupId );

    // if the group couldnt be found
    if( !currentTrafficGroup )
        return console.log( '[ERROR] Invalid group ID specified.' );

    // if component type isn't a sensor, just cancel cause we don't have to listen to anything else
    if( componentType !== "sensor" )
        return console.log( "[ERROR] Component is not a sensor." );

    // set sensor status for this component ID.
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

// get time difference between 2 Date instances
function getTimeDifference( date1, date2 ) {
    // console.log( +date2 - +date1 > 5000 );
    return +date2 - +date1;
}

// returns true if this light can turn green, false otherwise
function canTurnGreen( g ) {

    // if( getTimeDifference( lastAnyRedLight, new Date( ) ) < 5000 )
    //     return false;

    let turnGreen = true;

    // loop thru the traffic lights that have to be on red in order for this one to be allowed to go green
    g.disallowedTrafficLights.forEach( dt => {

        let tlData = trafficData.find(td => td.type === dt.type);

        // if the traffic data for this light was found
        if( tlData )
        {
            let trafficLight = tlData.groups.find( tg => tg.id === dt.groupId );

            if( trafficLight )
            {
                // if the traffic light status is green/orange or the warning light status is on, this light can't go green.
                if( trafficLight.currentStatus !== TRAFFIC_LIGHT_STATUS.RED || trafficLight.warningLightStatus === WARNING_LIGHT_STATUS.ON )
                    turnGreen = false;
            }
        }

    } );

    return turnGreen;
}

// set all motorised traffic lights to red.
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

// set a single motorised light to orange, then after 2 seconds to red.
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

// try to open the bridge with this method, if the deck sensor is still active(meaning there's cars on the bridge) run this method again after 3 seconds recursively until it can open the bridge.
function tryOpenBridge( tl, actualGroup ) {
    setTimeout( ( ) => {
        if( tl.group.sensorStatuses[ 3 ] )
            return tryOpenBridge( tl, actualGroup );

        // close the barriers
        actualGroup.barrierStatus = BARRIER_STATUS.CLOSED;
        mqtt.submit( `${ teamId }/${ tl.t.type }/${ actualGroup.id }/barrier/0`, `${ BARRIER_STATUS.CLOSED }` );

        // after 4 seconds, open the bridge
        setTimeout( ( ) => {
            actualGroup.currentStatus = TRAFFIC_LIGHT_STATUS.GREEN;
            mqtt.submit( `${ teamId }/${ tl.t.type }/${ actualGroup.id }/deck/0`, `${ DECK_STATUS.OPEN }` );

            // after 10 seconds, set boat lights to green
            setTimeout( ( ) => {
                mqtt.submit( `${ teamId }/${ tl.t.type }/${ actualGroup.id }/boat_light/0`, `${ BOAT_LIGHT_STATUS.GREEN }` );
                mqtt.submit( `${ teamId }/${ tl.t.type }/${ actualGroup.id }/boat_light/1`, `${ BOAT_LIGHT_STATUS.GREEN }` );
            }, 10000 );
        }, 4000 );

    }, 3000 );
}

// try to close the bridge, if there's still a boat under the bridge run this method again until there is no boat under the bridge
function tryCloseBridge( t, g ) {

    setTimeout( ( ) => {

        // set boat light status to red
        mqtt.submit( `${ teamId }/${ t.type }/${ g.id }/boat_light/0`, `${ BOAT_LIGHT_STATUS.RED }` );
        mqtt.submit( `${ teamId }/${ t.type }/${ g.id }/boat_light/1`, `${ BOAT_LIGHT_STATUS.RED }` );

        if( g.sensorStatuses[ 1 ] )
            return tryCloseBridge( t, g );

        // move bridge back down
        g.currentStatus = TRAFFIC_LIGHT_STATUS.RED;
        mqtt.submit( `${ teamId }/${ t.type }/${ g.id }/deck/0`, `${ DECK_STATUS.CLOSED }` );

        // after 10 seconds, open the barriers
        setTimeout( ( ) => {
            mqtt.submit( `${ teamId }/${ t.type }/${ g.id }/barrier/0`, `${ BARRIER_STATUS.OPEN }` );
            g.barrierStatus = BARRIER_STATUS.OPEN;

            // after 4 more seconds, turn off warning lights
            setTimeout( ( ) => {
                mqtt.submit( `${ teamId }/${ t.type }/${ g.id }/warning_light/0`, `${ WARNING_LIGHT_STATUS.OFF }` );
                g.warningLightStatus = WARNING_LIGHT_STATUS.OFF;
            }, 4000 );

        }, 10000 );

    }, 1000 );
}

// maximum time a traffic light for motorised/cycle/foot can be green
const maxGreenLightTime = 7500;

// last time any light was set to red
let lastAnyRedLight = new Date( );

setInterval( ( ) => {

    let trafficLightsChangedToGreen = 0;
    let trafficLightsChangedToRed = 0;

    let trafficLightsInQueue = [];

    // loop thru traffic data
    trafficData.forEach( t => {

        t.groups.forEach( g => {

            // if the traffic light is on green
            if( g.currentStatus === TRAFFIC_LIGHT_STATUS.GREEN )
            {
                // if there are no more vehicles waiting at the traffic light or if the maximum time has passed
                if( g.sensorStatuses.every( s => s === false ) || getTimeDifference( g.lastGreenLight, new Date( ) ) > maxGreenLightTime )
                {
                    // if this is a train
                    if( t.type === 'track' )
                    {
                        // if all sensors are inactive, try to open the barriers etc
                        if( g.sensorStatuses.every( s => s === false ) )
                        {
                            // open the barriers
                            mqtt.submit( `${ teamId }/${ t.type }/${ g.id }/barrier/0`, `${ BARRIER_STATUS.OPEN }` );
                            g.barrierStatus = BARRIER_STATUS.OPEN;

                            // after 4 seconds, disable warning lights and train lights
                            setTimeout( ( ) => {
                                g.warningLightStatus = WARNING_LIGHT_STATUS.OFF;
                                mqtt.submit( `${ teamId }/${ t.type }/${ g.id }/warning_light/0`, `${ WARNING_LIGHT_STATUS.OFF }` );
                                mqtt.submit( `${ teamId }/${ t.type }/${ g.id }/train_light/0`, `${ TRAFFIC_LIGHT_STATUS.RED }` );
                                mqtt.submit( `${ teamId }/${ t.type }/${ g.id }/train_light/1`, `${ TRAFFIC_LIGHT_STATUS.RED }` );

                            }, 4000 );

                            g.currentStatus = TRAFFIC_LIGHT_STATUS.RED;
                        }

                    }
                    // if this is a boat
                    else if( t.type === 'vessel' )
                    {
                        // if all sensors are inactive, try to close the bridge
                        if( g.sensorStatuses.every( s => s === false ) )
                            tryCloseBridge( t, g );
                    }
                    else // if cycle/motorised/foot
                    {
                        setMotorisedLightToRed( t, g );
                    }

                    lastAnyRedLight = new Date( );

                    trafficLightsChangedToRed++;
                }
            }

            // if there's a vehicle waiting at a red light
            else if( g.sensorStatuses.some( ( s, i ) => s === true && i !== 3 && i !== 1 ) && g.currentStatus === TRAFFIC_LIGHT_STATUS.RED )
            {
                // if the vehicle has waited for a bit
                if( getTimeDifference( g.lastGreenLight, new Date( ) ) > maxGreenLightTime )
                {
                    // add this traffic light to queue
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

    // if nothing needs to be done, exit here
    if( trafficLightsInQueue.length === 0 )
        return;

    // sort the queue based on how long a traffic light has been on red(longest comes first)
    trafficLightsInQueue.sort( ( t1, t2 ) => +t1.group.lastGreenLight - +t2.group.lastGreenLight );

    // make sure the train and boat lights are added to the front of the queue since these get priority.
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
    /////////////////


    // log the amount of traffic lights that are waiting in the queue
    if( trafficLightsInQueue.length > 0 )
        console.log( 'trafficlights in queue: ', trafficLightsInQueue.length );

    // loop thru queued traffic lights
    trafficLightsInQueue.forEach( tl => {

        let actualTrafficData = trafficData.find( t => t === tl.t );

        if( !actualTrafficData )
            return console.log( "Traffic data couldnt be found." );

        let actualGroup = actualTrafficData.groups.find( g => g === tl.group );

        if( !actualGroup )
            return console.log( "Traffic group couldnt be found." );

        // if its a train
        if( tl.t.type === 'track' )
        {
            // if warning lights are off(and thus train is waiting)
            if( actualGroup.warningLightStatus === WARNING_LIGHT_STATUS.OFF )
            {
                // set motorised traffic lights to red
                setAllLightsToRed( );

                // turn on warning lights
                actualGroup.warningLightStatus = WARNING_LIGHT_STATUS.ON;
                mqtt.submit( `${ teamId }/${ tl.t.type }/${ actualGroup.id }/warning_light/0`, `${ WARNING_LIGHT_STATUS.ON }` );

                // after 5 seconds, close barriers
                setTimeout( ( ) => {
                    actualGroup.barrierStatus = BARRIER_STATUS.CLOSED;
                    mqtt.submit( `${ teamId }/${ tl.t.type }/${ actualGroup.id }/barrier/0`, `${ BARRIER_STATUS.CLOSED }` );

                    // after 4 seconds, allow train to move
                    setTimeout( ( ) => {
                        actualGroup.currentStatus = TRAFFIC_LIGHT_STATUS.GREEN;
                        mqtt.submit( `${ teamId }/${ tl.t.type }/${ actualGroup.id }/train_light/0`, `${ TRAFFIC_LIGHT_STATUS.ORANGE }` );
                        mqtt.submit( `${ teamId }/${ tl.t.type }/${ actualGroup.id }/train_light/1`, `${ TRAFFIC_LIGHT_STATUS.ORANGE }` );
                    }, 4000 );
                }, 5000 );

                trafficLightsChangedToGreen++;
            }
        }

        // if its a boat
        if( tl.t.type === 'vessel' )
        {
            // if warning lights are off(and tbus bridge is in idle state)
            if( actualGroup.warningLightStatus === WARNING_LIGHT_STATUS.OFF )
            {
                // set all motorised lights to red
                setAllLightsToRed( );

                // turn on warning lights
                actualGroup.warningLightStatus = WARNING_LIGHT_STATUS.ON;
                mqtt.submit( `${ teamId }/${ tl.t.type }/${ actualGroup.id }/warning_light/0`, `${ WARNING_LIGHT_STATUS.ON }` );

                // try and open the bridge
                tryOpenBridge( tl, actualGroup );
                trafficLightsChangedToGreen++;
            }
        }

        // if its motorised/cycle/foot
        if( tl.t.type === 'motorised' || tl.t.type === 'cycle' || tl.t.type === 'foot' )
        {
            // check if this traffic light is still allowed to go green during this iteration
            if( canTurnGreen( tl.group ) )
            {
                // set the lastGreenLight value to now so we know when this traffic light was last set to green
                actualGroup.lastGreenLight = new Date( );
                actualGroup.currentStatus = TRAFFIC_LIGHT_STATUS.GREEN; // change status

                // send to simulator
                mqtt.submit( tl.topic, tl.payload );

                console.log( `${ tl.topic } set to green` );
                trafficLightsChangedToGreen++;
            }
        }
    } );

    // log what happened
    if( trafficLightsChangedToGreen > 0 )
        console.log( `Total traffic lights changed to green: ${ trafficLightsChangedToGreen }` );

    if( trafficLightsChangedToRed > 0 )
        console.log( `Total traffic lights changed to red: ${ trafficLightsChangedToRed }` );

}, 500 );