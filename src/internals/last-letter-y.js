const { concat, endsWith, test } = require( 'ramda' );

const re = require( '../../lib/regex' );

const endsWithY = endsWith( 'y' );

const lastLetterY = ( word ) => {
	if ( endsWithY( word ) ) {
		const stem = re.endsWithY.exec( word )[1];
		const regex = new RegExp( re.vowelStem );

		if ( test( regex, stem ) ) {
			return concat( stem, 'i' );
		}
	}

	return word;
};

module.exports = lastLetterY;
