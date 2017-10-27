const {
	append,
	compose,
	cond,
	either,
	endsWith,
	identity,
	init,
	join,
	T,
	test
} = require( 'ramda' );

const {
	presentTense,
	presentProgressive,
	mgr0,
	vowelStem,
	stateSuffixes,
	repeatedConsonants,
	endsWithConsonant,
} = require( '../../lib/regex' );

const endsWithPresentTense = endsWith( 'eed' );
const endsWithPresentProgressive = either( endsWith( 'ed' ), endsWith( 'ing' ) );

const determineSense = ( word ) => {
	if ( endsWithPresentTense( word ) ) {
		const stem  = presentTense.exec( word )[1];
		const regex = new RegExp( mgr0 );

		if ( test( regex, stem ) ) {
			return init( word );
		}
	}
	else if ( endsWithPresentProgressive( word ) ) {
		const stem = presentProgressive.exec( word )[1];
		const regex = new RegExp( vowelStem );

		if ( test( regex, stem ) ) {
			return cond( [
				[test( stateSuffixes ), compose( join( '' ), append( 'e' ) )],
				[test( repeatedConsonants ), init],
				[test( endsWithConsonant ), compose( join( '' ), append( 'e' ) )],
				[T, identity],
			] )( stem );
		}

		return init( word );
	}

	return word;
};

module.exports = determineSense;
