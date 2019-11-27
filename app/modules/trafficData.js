// Foot(voetgangers):
// 16/foot/22,23/traffic_light,sensor/0,1
// 16/foot/24,25,28,29/traffic_light,sensor/0
// 16/foot/26,27/traffic_light,sensor/0,1,2
//
// Cycle(fietsers, brommers):
// 16/cycle/0,1,2,3,4,5,6/traffic_light,sensor/0
//
// Motorised(autos, vrachtwagens, motoren):
// 16/motorised/7,8,9,10,11,12,13,14,15,16,17/traffic_light/0
// 16/motorised/7,8,9,10,11,12,13,14,15,16,17/sensor/0,1
//
// Vessel(boten):
// 16/vessel/18,19/traffic_light,sensor,warning_light/0
// 16/vessel/18,19/barrier/0,1,2,3,4,5,6,7
//
// Track(treinen):
// 16/track/20,21/traffic_light,sensor,warning_light/0
// 16/track/20,21/barrier/0,1,2,3,4,5,6,7,8

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
    GREEN: 0,
    RED: 1
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
    // {
    //     name: 'traffic_light',
    //     statusTypes: TRAFFIC_LIGHT_STATUS
    // },
    // {
    //     name: 'warning_light',
    //     statusTypes: WARNING_LIGHT_STATUS
    // },
    {
        name: 'sensor',
        statusTypes: SENSOR_STATUS
    },
    // {
    //     name: 'barrier',
    //     statusTypes: BARRIER_STATUS
    // }
];

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



    // END BOAT


    // TRAIN


    // END TRAIN

];

const teamId = 16;

function getDisallowedTrafficLights( type, groupId ) {
    let dtl = disallowedTrafficLights.find( dt => dt.laneType === type && dt.groupId === groupId );

    if( !dtl )
        return [];

    return dtl.disallowed;
}

function generateTrafficData( type, minGroupId, maxGroupId ) {

    let data = {
        type: type,
        groups: []
    };

    for( let i = minGroupId; i <= maxGroupId; i++ )
    {
        data.groups.push( {
            id: i,
            sensorActivated: false,
            lastGreenLight: new Date(),
            currentStatus: TRAFFIC_LIGHT_STATUS.RED,

            disallowedTrafficLights: getDisallowedTrafficLights( type, i )
        } );
    }

    trafficData.push( data );
}

let trafficData = [ ];

generateTrafficData( 'foot', 0, 7 );
generateTrafficData( 'cycle', 0, 5 );
generateTrafficData( 'motorised', 0, 8 );
generateTrafficData( 'vessel', 0, 1 );
generateTrafficData( 'track', 0, 1 );

function fetchListeners( ) {
    let listeners = [ ];

    trafficData.forEach( t => {

        t.groups.forEach( g => {

            componentTypes.forEach( c => {

                // c.statusTypes.forEach( t => {
                    listeners.push( `${ teamId }/${ t.type }/${ g.id }/${ c.name }/0` ); // /${ t }
                // } );

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
    componentTypes
};