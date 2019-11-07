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
    OOS: 3 // Out Of Service
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

const globalGroupId = 16;

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
            currentStatus: 0
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
                    listeners.push( `${ globalGroupId }/${ t.type }/${ g.id }/${ c.name }` ); // /${ t }
                // } );

            } );

        } );

    } );

    return listeners;
}


module.exports = {
    generateTrafficData,
    fetchListeners,
    globalGroupId,
    trafficData
};