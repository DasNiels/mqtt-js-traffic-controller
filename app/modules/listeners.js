
const laneTypes = [ 'foot', 'cycle', 'motorised', 'vessel', 'track' ];
const totalGroups = 30;
const componentTypes = [ 'traffic_light', 'warning_light', 'sensor' ];

function getListeners( ) {
    let listeners = [ ];

    laneTypes.forEach( lane => {
        componentTypes.forEach( component => {
            for( let i = 0; i < totalGroups; i++ )
            {
                listeners.push( `${ lane }/${ i }/${ component }` );
            }
        } );
    } );

    return listeners;
}





module.exports = {
    getListeners
};