const R                  = require( 'ramda' );

const parse              = require( '../helpers/parse' );
const containsStopWord   = require( '../helpers/contains-stop-word' );

const determineSense     = require( './internals/determine-sense' );
const format             = require( './internals/format' );
const lastLetterE        = require( './internals/last-letter-e' );
const lastLetterY        = require( './internals/last-letter-y' );
const matchPlurals       = require( './internals/match-plurals' );
const parseStem          = require( './internals/parse-stem' );
const replaceStep2Suffix = require( './internals/replace-step2-suffix' );
const replaceStep3Suffix = require( './internals/replace-step3-suffix' );
const startsWithY        = require( './internals/starts-with-y' );


class BM25 {
	constructor() {
		this.terms                   = {};
		this.documents               = {};
		this.totalDocuments          = 0;
		this.totalDocumentTermLength = 0;
		this.averageDocumentLength   = 0;
	}

	stemmer( word ) {
		if ( word.length < 3 ) {
			return word;
		}

		return R.compose(
			format,
			lastLetterE,
			parseStem,
			replaceStep3Suffix,
			replaceStep2Suffix,
			lastLetterY,
			determineSense,
			matchPlurals,
			startsWithY,
		)( word );
	}

	sanitize( query ) {
		return R.compose(
			R.map( this.stemmer ),
			parse
		)( query );
	}

	sanitizeWithoutStopWords( query ) {
		return R.compose(
			R.map( this.stemmer ),
			R.reject( containsStopWord ),
			parse
		)( query );
	}

	tokenize( query, keepStopWords = false ) {
		if ( keepStopWords ) {
			return this.sanitize( query );
		}

		return this.sanitizeWithoutStopWords( query );
	}

	addDocument( document, documentId ) {
		// possibly use R.countBy to get the number of each word.
	}
}

const myBM25 = new BM25();

console.log( myBM25.tokenize( 'yes', true ) ); // => [ 'Yes' ]
console.log( myBM25.tokenize( 'enabling', true ) );
console.log( myBM25.tokenize( 'there are plenty of words to go around', true ) ); // => [ 'there', 'ar', 'plenti', 'of', 'word', 'to', 'go', 'around' ]
console.log( myBM25.tokenize( 'hopefully this works!', true ) ); // => [ 'hopefulli', 'thi', 'work' ]

module.exports = BM25;
