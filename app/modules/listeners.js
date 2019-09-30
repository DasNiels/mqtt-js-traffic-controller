
export const laneTypes = [ 'foot', 'cycle', 'motorised', 'vessel', 'track' ];
export const totalGroups = 30;
export const componentTypes = [ 'traffic_light', 'warning_light', 'sensor' ];

export function getListeners( ) {
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

