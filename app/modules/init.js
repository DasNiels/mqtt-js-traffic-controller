
const mqtt = require( 'mqtt' );

export function MqttTrafficLights( options, topics, onMessage ) {
    this.client = null;
    this.options = options;
    this.ready = false;
    this.onMessage = onMessage;
    this.topics = topics || [];

    this.connect = async ( ) => {
        return await new Promise( ( resolve, reject ) => {
            console.log( `[MQTT] Connecting to ${ this.options.hostname }:${ this.options.port }...` );
            this.client = mqtt.connect( this.options );

            this.client.on( 'connect', this.onConnect );
            this.client.on( 'message', this.onMessage );

            // wait till it's connected then return the promise
            let readyTimer = setInterval( ( ) => {
                if( this.ready )
                {
                    clearInterval( readyTimer );
                    console.log( '[SUCCESS] Connected!' );
                    resolve( );
                }
            }, 100 );

            // if it hasn't connected after 5 seconds, consider it a timeout
            setTimeout( ( ) => {
                if( !this.ready )
                {
                    clearInterval( readyTimer );
                    console.log( '[ERROR] Connection timeout' );
                    reject( );
                }
            }, this.options.connectTimeout );

        } );
    };

    this.disconnect = ( ) => {
        this.client.end( );

        this.topics = [ ];

        this.ready = false;
    };

    this.subscribeToTopic = ( topic ) => {

        if( this.topics.includes( topic ) )
            return;

        this.topics.push( topic );
        this.client.subscribe( topic );
    };

    this.unsubscribeFromTopic = ( topic ) => {

        let idx = this.topics.indexOf( topic );

        if( idx === -1 )
            return;

        this.topics.splice( idx, 1 );
        this.client.unsubscribe( topic );

    };

    this.subscribeToTopics = ( ) => {
        this.topics.forEach( topic => {
            this.client.subscribe( topic );
        } );
    };

    this.onConnect = ( ) => {
        this.subscribeToTopics();

        this.ready = true;
    };

    this.submit = ( topic, data ) => {
        this.client.publish( topic, data );
    };
}