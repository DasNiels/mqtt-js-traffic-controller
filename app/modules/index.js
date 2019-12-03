
const { fetchListeners, teamId, trafficData, generateTrafficData, BARRIER_STATUS, componentTypes, SENSOR_STATUS, TRAFFIC_LIGHT_STATUS, WARNING_LIGHT_STATUS, DECK_STATUS, BOAT_LIGHT_STATUS } = require( './trafficData' );
const { MqttWrapper } = require( './mqtt-wrapper' );

module.exports = {
    trafficData,
    generateTrafficData,
    fetchListeners,
    teamId,
    MqttWrapper,
    TRAFFIC_LIGHT_STATUS,
    WARNING_LIGHT_STATUS,
    SENSOR_STATUS,
    BARRIER_STATUS,
    DECK_STATUS,
    BOAT_LIGHT_STATUS,
    componentTypes
};