// Macros for all static data
const TRAFFIC_LIGHT_STATUS = {
    RED: 0,
    ORANGE: 1,
    GREEN: 2,
};

const WARNING_LIGHT_STATUS = {
    OFF: 0,
    ON: 1
};

const SENSOR_STATUS = {
    INACTIVE: 0,
    ACTIVE: 1
};

const BARRIER_STATUS = {
    OPEN: 0,
    CLOSED: 1
};

const BOAT_LIGHT_STATUS = {
    RED: 0,
    GREEN: 1
};

const DECK_STATUS = {
    CLOSED: 0,
    OPEN: 1
};

const componentTypes = [
    {
        name: 'sensor',
        statusTypes: SENSOR_STATUS
    }
];

// each traffic light has a list of other traffic lights that have to be red in order for this traffic light to be allowed to be set to green.
const disallowedTrafficLights = [

    // MOTORISED

    { // Noord -> Oost
        laneType: 'motorised',
        groupId: 0,
        disallowed: [
            { type: 'motorised', groupId: 4 }, // Oost -> Zuid
            { type: 'motorised', groupId: 5 }, // Zuid -> Noord & Oost
            { type: 'motorised', groupId: 7 }, // West -> Noord,

            { type: 'cycle', groupId: 0 }, // Noord: Oost -> West
            { type: 'cycle', groupId: 1 }, // Oost: Zuid -> Noord

            { type: 'foot', groupId: 1 }, // Noord: West -> Tussenstuk
            { type: 'foot', groupId: 2 }, // Oost: Noord -> Zuid
        ]
    },

    { // Noord -> Zuid
        laneType: 'motorised',
        groupId: 1,
        disallowed: [
            { type: 'motorised', groupId: 4 }, // Oost -> Zuid
            { type: 'motorised', groupId: 6 }, // Zuid -> West
            { type: 'motorised', groupId: 7 }, // West -> Noord
            { type: 'motorised', groupId: 8 }, // West -> Zuid

            { type: 'cycle', groupId: 0 }, // Noord: Oost -> West
            { type: 'cycle', groupId: 2 }, // Zuid: Noorden van spoort, West -> Oost
            { type: 'cycle', groupId: 3 }, // Zuid: Zuiden van spoort, Oost -> West

            { type: 'foot', groupId: 1 }, // Noord: West -> Tussenstuk
            { type: 'foot', groupId: 5 }, // Zuid: West -> Westelijke tussenstuk

            { type: 'track', groupId: 0 } // Train
        ]
    },

    { // Noord -> West
        laneType: 'motorised',
        groupId: 2,
        disallowed: [
            { type: 'motorised', groupId: 6 }, // Zuid -> West

            { type: 'cycle', groupId: 0 }, // Noord: Oost -> West
            { type: 'cycle', groupId: 4 }, // West: Noord -> Zuid

            { type: 'foot', groupId: 1 }, // Noord: West -> Tussenstuk
            { type: 'foot', groupId: 6 }, // West: Noord -> Zuid
        ]
    },

    { // Oost -> Noord
        laneType: 'motorised',
        groupId: 3,
        disallowed: [
            { type: 'motorised', groupId: 5 }, // Zuid -> Noord & Oost
            { type: 'motorised', groupId: 7 }, // West -> Noord

            { type: 'cycle', groupId: 0 }, // Noord: Oost -> West
            { type: 'cycle', groupId: 1 }, // Oost: Zuid -> Noord

            { type: 'foot', groupId: 0 }, // Noord: Oost -> Tussenstuk
            { type: 'foot', groupId: 2 }, // Oost: Noord -> Zuid
        ]
    },

    { // Oost -> Zuid
        laneType: 'motorised',
        groupId: 4,
        disallowed: [
            { type: 'motorised', groupId: 0 }, // Noord -> Oost
            { type: 'motorised', groupId: 1 }, // Noord -> Zuid
            { type: 'motorised', groupId: 5 }, // Zuid -> Noord & Oost
            { type: 'motorised', groupId: 6 }, // Zuid -> West
            { type: 'motorised', groupId: 8 }, // West -> Zuid

            { type: 'cycle', groupId: 1 }, // Oost: Zuid -> Noord
            { type: 'cycle', groupId: 2 }, // Zuid: Noorden van spoort, West -> Oost
            { type: 'cycle', groupId: 3 }, // Zuid: Zuiden van spoort, Oost -> West

            { type: 'foot', groupId: 2 }, // Oost: Noord -> Zuid
            { type: 'foot', groupId: 5 }, // Zuid: West -> Westelijke tussenstuk

            { type: 'track', groupId: 0 } // Train
        ]
    },

    { // Zuid -> Noord & Oost
        laneType: 'motorised',
        groupId: 5,
        disallowed: [
            { type: 'motorised', groupId: 0 }, // Noord & Oost
            { type: 'motorised', groupId: 3 }, // Oost -> Noord
            { type: 'motorised', groupId: 4 }, // Oost -> Zuid
            { type: 'motorised', groupId: 7 }, // West -> Noord

            { type: 'cycle', groupId: 0 }, // Noord: Oost -> West
            { type: 'cycle', groupId: 1 }, // Oost: Zuid -> Noord
            { type: 'cycle', groupId: 2 }, // Zuid: Noorden van spoort, West -> Oost
            { type: 'cycle', groupId: 3 }, // Zuid: Zuiden van spoort, Oost -> West

            { type: 'foot', groupId: 0 }, // Noord: Oost -> Tussenstuk
            { type: 'foot', groupId: 2 }, // Oost: Noord -> Zuid
            { type: 'foot', groupId: 3 }, // Zuid: Oost -> Oostelijke tussenstuk

            { type: 'track', groupId: 0 } // Train
        ]
    },

    { // Zuid -> West
        laneType: 'motorised',
        groupId: 6,
        disallowed: [
            { type: 'motorised', groupId: 1 }, // Noord -> Zuid
            { type: 'motorised', groupId: 2 }, // Noord -> West
            { type: 'motorised', groupId: 4 }, // Oost -> Zuid
            { type: 'motorised', groupId: 7 }, // West -> Noord

            { type: 'cycle', groupId: 2 }, // Zuid: Noorden van spoort, West -> Oost
            { type: 'cycle', groupId: 3 }, // Zuid: Zuiden van spoort, Oost -> West
            { type: 'cycle', groupId: 4 }, // West: Noord -> Zuid

            { type: 'foot', groupId: 4 }, // Zuid: Oostelijke tussenstuk -> Westelijke tussenstuk
            { type: 'foot', groupId: 6 }, // West: Noord -> Zuid

            { type: 'track', groupId: 0 } // Train
        ]
    },

    { // West -> Noord
        laneType: 'motorised',
        groupId: 7,
        disallowed: [
            { type: 'motorised', groupId: 0 }, // Noord & Oost
            { type: 'motorised', groupId: 1 }, // Noord -> Zuid
            { type: 'motorised', groupId: 3 }, // Oost -> Noord
            { type: 'motorised', groupId: 5 }, // Zuid -> Noord & Oost
            { type: 'motorised', groupId: 6 }, // Zuid -> West

            { type: 'cycle', groupId: 0 }, // Noord: Oost -> West
            { type: 'cycle', groupId: 4 }, // West: Noord -> Zuid

            { type: 'foot', groupId: 0 }, // Noord: Oost -> Tussenstuk
            { type: 'foot', groupId: 6 }, // West: Noord -> Zuid
        ]
    },

    { // West -> Zuid
        laneType: 'motorised',
        groupId: 8,
        disallowed: [
            { type: 'motorised', groupId: 1 }, // Noord -> Zuid
            { type: 'motorised', groupId: 4 }, // Oost -> Zuid

            { type: 'cycle', groupId: 2 }, // Zuid: Noorden van spoort, West -> Oost
            { type: 'cycle', groupId: 3 }, // Zuid: Zuiden van spoort, Oost -> West
            { type: 'cycle', groupId: 4 }, // West: Noord -> Zuid

            { type: 'foot', groupId: 5 }, // Zuid: West -> Westelijke tussenstuk
            { type: 'foot', groupId: 6 }, // West: Noord -> Zuid

            { type: 'track', groupId: 0 } // Train
        ]
    },

    // END MOTORISED


    // CYCLE

    { // Noord: Oost -> West
        laneType: 'cycle',
        groupId: 0,
        disallowed: [
            { type: 'motorised', groupId: 0 }, // Noord -> Oost
            { type: 'motorised', groupId: 1 }, // Noord -> Zuid
            { type: 'motorised', groupId: 2 }, // Noord -> West
            { type: 'motorised', groupId: 3 }, // Oost -> Noord
            { type: 'motorised', groupId: 5 }, // Zuid -> Noord & Oost
            { type: 'motorised', groupId: 7 }, // West -> Noord
        ]
    },

    { // Oost: Zuid -> Noord
        laneType: 'cycle',
        groupId: 1,
        disallowed: [
            { type: 'motorised', groupId: 0 }, // Noord -> Oost
            { type: 'motorised', groupId: 3 }, // Oost -> Noord
            { type: 'motorised', groupId: 4 }, // Oost -> Zuid
            { type: 'motorised', groupId: 5 }, // Zuid -> Noord & Oost
        ]
    },

    { // Zuid: Noorden van spoor, West -> Oost
        laneType: 'cycle',
        groupId: 2,
        disallowed: [
            { type: 'motorised', groupId: 1 }, // Noord -> Zuid
            { type: 'motorised', groupId: 4 }, // Oost -> Zuid
            { type: 'motorised', groupId: 5 }, // Zuid -> Noord & Oost
            { type: 'motorised', groupId: 6 }, // Zuid -> West
            { type: 'motorised', groupId: 8 }, // West -> Zuid
        ]
    },

    { // Zuid: Zuiden van spoor, Oost -> West
        laneType: 'cycle',
        groupId: 3,
        disallowed: [
            { type: 'motorised', groupId: 1 }, // Noord -> Zuid
            { type: 'motorised', groupId: 4 }, // Oost -> Zuid
            { type: 'motorised', groupId: 5 }, // Zuid -> Noord & Oost
            { type: 'motorised', groupId: 6 }, // Zuid -> West
            { type: 'motorised', groupId: 8 }, // West -> Zuid
        ]
    },

    { // West: Noord -> Zuid
        laneType: 'cycle',
        groupId: 4,
        disallowed: [
            { type: 'motorised', groupId: 1 }, // Noord -> Zuid
            { type: 'motorised', groupId: 4 }, // Oost -> Zuid
            { type: 'motorised', groupId: 5 }, // Zuid -> Noord & Oost
            { type: 'motorised', groupId: 6 }, // Zuid -> West
            { type: 'motorised', groupId: 8 }, // West -> Zuid
        ]
    },

    // END CYCLE


    // FOOT

    { // Noord: Oost -> Tussenstuk
        laneType: 'foot',
        groupId: 0,
        disallowed: [
            { type: 'motorised', groupId: 3 }, // Oost -> Noord
            { type: 'motorised', groupId: 5 }, // Zuid -> Noord & Oost
            { type: 'motorised', groupId: 7 }, // West -> Noord
        ]
    },

    { // Noord: West -> Tussenstuk
        laneType: 'foot',
        groupId: 1,
        disallowed: [
            { type: 'motorised', groupId: 0 }, // Noord -> Oost
            { type: 'motorised', groupId: 1 }, // Noord -> Zuid
            { type: 'motorised', groupId: 2 }, // Noord -> West
        ]
    },

    { // Oost: Noord -> Zuid
        laneType: 'foot',
        groupId: 2,
        disallowed: [
            { type: 'motorised', groupId: 0 }, // Noord -> Oost
            { type: 'motorised', groupId: 3 }, // Oost -> Noord
            { type: 'motorised', groupId: 4 }, // Oost -> Zuid
            { type: 'motorised', groupId: 5 }, // Zuid -> Noord & Oost
        ]
    },

    { // Zuid: Oost -> Oostelijke tussenstuk
        laneType: 'foot',
        groupId: 3,
        disallowed: [
            { type: 'motorised', groupId: 5 }, // Zuid -> Noord & Oost
        ]
    },

    { // Zuid: Oostelijke tussenstuk -> Westelijke tussenstuk
        laneType: 'foot',
        groupId: 4,
        disallowed: [
            { type: 'motorised', groupId: 6 }, // Zuid -> West
        ]
    },

    { // Zuid: West -> Westelijke tussenstuk
        laneType: 'foot',
        groupId: 5,
        disallowed: [
            { type: 'motorised', groupId: 1 }, // Noord -> Zuid
            { type: 'motorised', groupId: 4 }, // Oost -> Zuid
            { type: 'motorised', groupId: 8 }, // West -> Zuid

            { type: 'track', groupId: 0 } // Train
        ]
    },

    { // West: Noord -> Zuid
        laneType: 'foot',
        groupId: 6,
        disallowed: [
            { type: 'motorised', groupId: 2 }, // Noord -> West
            { type: 'motorised', groupId: 6 }, // Zuid -> West
            { type: 'motorised', groupId: 7 }, // West -> Noord
            { type: 'motorised', groupId: 8 }, // West -> Zuid
        ]
    },

    // END FOOT


    // BOAT

    { // Boten
        laneType: 'vessel',
        groupId: 0,
        disallowed: [ ]
    },

    // END BOAT


    // TRAIN

    { // Trein
        laneType: 'track',
        groupId: 0,
        disallowed: [
            // { type: 'motorised', groupId: 1 }, // Noord -> Zuid
            // { type: 'motorised', groupId: 4 }, // Oost -> Zuid
            // { type: 'motorised', groupId: 5 }, // Zuid -> Noord & Oost
            // { type: 'motorised', groupId: 6 }, // Zuid -> West
            // { type: 'motorised', groupId: 8 }, // West -> Zuid
        ]
    },

    // END TRAIN

];

// our team ID
const teamId = 16;

// get the disallowed traffic lights for this traffic light from the array.
function getDisallowedTrafficLights( type, groupId ) {
    let dtl = disallowedTrafficLights.find( dt => dt.laneType === type && dt.groupId === groupId );

    // if it couldnt be found, return an empty array
    if( !dtl )
        return [];

    return dtl.disallowed;
}

// fill the traffic data array with all the required topics and data required
function generateTrafficData( type, minGroupId, maxGroupId, sensorAmount ) {

    sensorAmount = sensorAmount || 1;

    let data = {
        type: type,
        groups: []
    };

    for( let i = minGroupId; i <= maxGroupId; i++ )
    {
        data.groups.push( {
            id: i,
            sensorAmount: sensorAmount,
            sensorStatuses: new Array( sensorAmount + 1 ).fill( false ),
            lastGreenLight: new Date(),
            currentStatus: TRAFFIC_LIGHT_STATUS.RED,
            barrierStatus: BARRIER_STATUS.OPEN,
            warningLightStatus: WARNING_LIGHT_STATUS.OFF,

            disallowedTrafficLights: getDisallowedTrafficLights( type, i )
        } );
    }

    trafficData.push( data );
}

let trafficData = [ ];

// generate traffic data for all types
generateTrafficData( 'foot', 0, 7, 5 );
generateTrafficData( 'cycle', 0, 5, 5 );
generateTrafficData( 'motorised', 0, 8 );
generateTrafficData( 'vessel', 0, 1, 5 );
generateTrafficData( 'track', 0, 1, 5 );

// get a list of listeners that need to be listened on
function fetchListeners( ) {
    let listeners = [ ];

    trafficData.forEach( t => {

        t.groups.forEach( g => {

            componentTypes.forEach( c => {

                for( let i = 0; i < g.sensorAmount; i++ )
                {
                    listeners.push( `${ teamId }/${ t.type }/${ g.id }/${ c.name }/${ i }` );
                }

            } );

        } );

    } );

    return listeners;
}


module.exports = {
    generateTrafficData,
    fetchListeners,
    teamId,
    trafficData,
    TRAFFIC_LIGHT_STATUS,
    WARNING_LIGHT_STATUS,
    SENSOR_STATUS,
    BARRIER_STATUS,
    DECK_STATUS,
    BOAT_LIGHT_STATUS,
    componentTypes
};