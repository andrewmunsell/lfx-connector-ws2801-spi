/**
 * @package lfx-connector-ws2801-spi
 * @author Andrew Munsell <andrew@wizardapps.net>
 * @copyright 2015 Andrew Munsell
 * @license http://www.gnu.org/licenses/ GNU GPLv3
 */

var SPI = require('spi');

/**
 * Constructor for the WS2801 LED SPI connector
 */
var WS2801_SPI_Connector = function(options) {
	this._device = new SPI.spi(options.device);

	this._buffer = new Array(options.count * 3);
	this._level = new Array(options.count);

	this._dirty = false;

	// Initialize the connector with the default settings of on and set to black.
	this.setLevel(1);
	this.setColor({
		r: 0,
		g: 0,
		b: 0
	});
};

/**
 * Return the metadata for the connector
 * @return {object}
 */
WS2801_SPI_Connector.metadata = function() {
	return {
		'name': 'WS2801 SPI Connector',
		'description': 'Connector for communicating with WS2801-like LED strands over 2-wire SPI',
		'type': 'light',

		'support': {
			'source': 'multi',
			'level': 'omni',
			'color': 'omni'
		}
	};
};

/**
 * Render the data into the fixture
 * @param  {number} frame    
 * @param  {number} deltaTime
 * @param  {function} next
 */
WS2801_SPI_Connector.prototype.render = function(frame, deltaTime, next) {
	if(this._dirty === true) {
		// Copy the buffer and apply the levels to it
		var level = this._level;

		var buffer = this._buffer.map(function(b, i) {
			return b * level[Math.floor(i / 3)];
		});

		this._device.write(new Buffer(buffer));

		this._dirty = false;
	}

	next();
};

/**
 * Set the level of the fixture
 * @param {number|boolean} level      
 * @param {number} startSource
 * @param {number} endSource  
 */
WS2801_SPI_Connector.prototype.setLevel = function(level, startSource, endSource) {
	this._dirty = true;

	var start = startSource || 0;
	var total = ((endSource || this._level.length) - start);

	for(var i = start; i < total; i++) {
		this._level[i] = level;
	}
};

/**
 * Set the color of the fixture, optionally from the specified starting source to ending source
 * (inclusive, exclusive).
 * @param {object} color      
 * @param {number} startSource
 * @param {number} endSource  
 */
WS2801_SPI_Connector.prototype.setColor = function(color, startSource, endSource) {
	if(typeof(color.color) != 'undefined') {
		throw new Error('This is an omnicolor fixture that cannot display named colors.');
	}

	this._dirty = true;

	var start = startSource || 0;
	var total = ((endSource || this._buffer.length / 3) - start);

	for(var i = start; i < total; i++) {
		this._buffer[i * 3] = color.r;
		this._buffer[(i * 3) + 1] = color.g;
		this._buffer[(i * 3) + 2] = color.b;
	}
};

/**
 * Set the animation for the fixture
 * @param {string} animation Animation module name
 */
WS2801_SPI_Connector.prototype.setAnimation = function(animation) {
	this._dirty = true;

	throw new Error('Not currently implemented.');
};

/**
 * Get the current animation
 * @return {object|null}
 */
WS2801_SPI_Connector.prototype.getAnimation = function() {
	return this._animation || null;
};

module.exports = WS2801_SPI_Connector;