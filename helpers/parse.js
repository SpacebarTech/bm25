const { compose, split, trim, replace } = require( 'ramda' );

const { nonAlphaNumeric } = require( '../lib/regex' );

const parse = compose(
	split( ' ' ),
	trim(),
	replace( nonAlphaNumeric, ' ' )
);

module.exports = parse;
