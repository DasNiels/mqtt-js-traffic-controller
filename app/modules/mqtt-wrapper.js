
const mqtt = require( 'mqtt' );

/**
 * Create a new instance of the MQTT Wrapper
 * @param options array Array containing connection info, see config/conn.json
 * @param topics array An array containing strings of topics to connect to by default
 * @param onMessage function A function that gets called when a message is recieved on one of the topics that it's listening to
 * @constructor
 */
function MqttWrapper( options, topics, onMessage ) {

    this.client = null;
    this.options = options;
    this.connected = false;
    this.onMessage = onMessage;
    this.topics = topics || [];

    /**
     * Connect to the MQTT broker
     * @returns {Promise}
     */
    this.connect = async ( ) => {
        return await new Promise( ( resolve, reject ) => {
            console.log( `[MQTT] Connecting to ${ this.options.hostname }:${ this.options.port }...` );
            this.client = mqtt.connect( this.options );

            this.client.on( 'connect', this.onConnect );
            this.client.on( 'message', this.onMessage );

            // wait till it's connected then return the promise
            let readyTimer = setInterval( ( ) => {
                if( this.connected )
                {
                    clearInterval( readyTimer );
                    console.log( '[SUCCESS] Connected!' );
                    resolve( );
                }
            }, 100 );

            // if it hasn't connected after 5 seconds, consider it a timeout
            setTimeout( ( ) => {
                if( !this.connected )
                {
                    clearInterval( readyTimer );
                    console.log( '[ERROR] Connection timeout' );
                    reject( );
                }
            }, this.options.connectTimeout );

        } );
    };

    /**
     * Disconnects from the current MQTT broker
     */
    this.disconnect = ( ) => {
        this.client.end( );

        this.topics = [ ];

        this.connected = false;
    };

    /**
     * Adds a new listener to the MQTT instance
     * @param topic string the topic to listen to
     */
    this.addListener = ( topic ) => {

        if( this.topics.includes( topic ) )
            return;

        this.topics.push( topic );
        this.client.subscribe( topic );
    };

    /**
     * Removes an existing listener from the MQTT instance
     * @param topic string the topic to remove
     */
    this.removeListener = ( topic ) => {

        let idx = this.topics.indexOf( topic );

        if( idx === -1 )
            return;

        this.topics.splice( idx, 1 );
        this.client.unsubscribe( topic );

    };

    /**
     * Adds all default listeners that were submitted during instantiation
     */
    this.addListeners = ( ) => {
        this.topics.forEach( topic => {
            this.client.subscribe( topic );
        } );
    };

    /**
     * This gets called when the MQTT connection is established
     */
    this.onConnect = ( ) => {
        this.addListeners();

        this.connected = true;
    };

    /**
     * Submit some data
     * @param topic string the topic to submit data to
     * @param data string the data to submit
     */
    this.submit = ( topic, data ) => {
        this.client.publish( topic, data );

        // if( topic.includes( 'track' ) )
        console.log( `submitting: ${ topic }: ${ data }` );
    };
}

module.exports = {
    MqttWrapper
};