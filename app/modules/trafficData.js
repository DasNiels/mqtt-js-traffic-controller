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

    { // Noord -> Oost
        laneType: 'motorised',
        groupId: 0,
        disallowed: [
            { type: 'motorised', groupId: 4 }, // Oost -> Zuid
            { type: 'motorised', groupId: 5 }, // Zuid -> Noord & Oost
            { type: 'motorised', groupId: 7 }, // West -> Noord
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
        ]
    },

    { // Noord -> West
        laneType: 'motorised',
        groupId: 2,
        disallowed: [
            { type: 'motorised', groupId: 6 }, // Zuid -> West
        ]
    },

    { // Oost -> Noord
        laneType: 'motorised',
        groupId: 3,
        disallowed: [
            { type: 'motorised', groupId: 5 }, // Zuid -> Noord & Oost
            { type: 'motorised', groupId: 7 }, // West -> Noord
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
        ]
    },

    { // West -> Zuid
        laneType: 'motorised',
        groupId: 8,
        disallowed: [
            { type: 'motorised', groupId: 1 }, // Noord -> Zuid
            { type: 'motorised', groupId: 4 }, // Oost -> Zuid
        ]
    },

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