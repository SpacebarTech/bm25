const { pipe, startsWith, when } = require( 'ramda' );

const capitalize = require( '../../helpers/capitalize' );

const startsWithY = when(
	startsWith( 'y' ),
	pipe( capitalize )
);

module.exports = startsWithY;
