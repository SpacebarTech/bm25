const R         = require( 'ramda' );

const stopWords = require( './lib/stopwords' );

const BM25 = ( function () {

	const self = this;

	// what we aim to populate
	self.terms     = {};
	self.documents = {};

	// stemmer algorithm
	self.stemmer = ( function () {

		const step2list = {
			'ational' : 'ate',
			'tional'  : 'tion',
			'enci'    : 'ence',
			'anci'    : 'ance',
			'izer'    : 'ize',
			'bli'     : 'ble',
			'alli'    : 'al',
			'entli'   : 'ent',
			'eli'     : 'e',
			'ousli'   : 'ous',
			'ization' : 'ize',
			'ation'   : 'ate',
			'ator'    : 'ate',
			'alism'   : 'al',
			'iveness' : 'ive',
			'fulness' : 'ful',
			'ousness' : 'ous',
			'aliti'   : 'al',
			'iviti'   : 'ive',
			'biliti'  : 'ble',
			'logi'    : 'log',
		};

		const step3list = {
			'icate' : 'ic',
			'ative' : '',
			'alize' : 'al',
			'iciti' : 'ic',
			'ical'  : 'ic',
			'ful'   : '',
			'ness'  : '',
		};

		const c    = '[^aeiou]';                            // consonant
		const v    = '[aeiouy]';                            // vowel
		const C    = `${c}${c}*'`;                          // consonant sequence
		const V    = `${v}${v}*'`;                          // vowel sequence

		const mgr0 = `^(${C})?${V}${C}`;                    // [C]VC... is m>0
		const meq1 = `^(${C})?${V}${C}(${V})?$`;            // [C]VC[V] is m=1
		const mgr1 = `^(${C})?${V}${C}${V}${C}`;            // [C]VCVC... is m>1
		const s_v  = `^(${C})?${v}`;                        // vowel in stem

		return function ( w ) {

			const head        = R.head( w );                  // first character
			const tail        = R.tail( w );                  // all but the first character
			const startsWithY = R.startsWith( 'y', head );

			let mutatedWord = w;                              // don't mutate original
			let stem;                                         //
			let suffix;                                       //
			let re;                                           // regular expression 1
			let re2;                                          // regular expression 2
			let re3;                                          // regular expression 3
			let re4;                                          // regular expression 4

			// w cannot be condensed
			if ( w.length < 3 ) {
				return w;
			}


			// y at beginning of word is always consonant
			if ( startsWithY ) {
				mutatedWord = `${R.toUpper( head )}${tail}`;
			}

			// Step 1a - match plurals
			re  = /^(.+?)(ss|i)es$/;
			re2 = /^(.+?)([^s])s$/;

			if ( re.test( mutatedWord ) ) {
				mutatedWord = mutatedWord.replace( re, '$1$2' );
			}
			else if ( re2.test( mutatedWord ) ) {
				mutatedWord = mutatedWord.replace( re2, '$1$2' );
			}

			// Step 1b - determine tense
			re  = /^(.+?)eed$/;
			re2 = /^(.+?)(ed|ing)$/;

			// present
			if ( re.test( mutatedWord ) ) {
				const fp = re.exec( mutatedWord );
				re = new RegExp( mgr0 );                       // [C]VC

				if ( re.test( fp[1] ) ) {
					re = /.$/;
					mutatedWord = mutatedWord.replace( re, '' );
				}
			}

			// past or present progressive
			else if ( re2.test( mutatedWord ) ) {
				const fp = re2.exec( mutatedWord );
				stem = fp[1];
				re2 = new RegExp( s_v );

				if ( re2.test( stem ) ) {
					mutatedWord = stem;
					re2 = /(at|bl|iz)$/;
					re3 = new RegExp( '([^aeiouylsz])\\1$' );
					re4 = new RegExp( `^${C}${v}[^aeiouwxy]$` );

					if ( re2.test( mutatedWord ) || re4.test( mutatedWord ) ) {
						mutatedWord = `${w}e`;
					}
					else if ( re3.test( w ) ) {
						re = /.$/;
						mutatedWord = mutatedWord.replace( re, '' );
					}
				}
			}

			// Step 1c
			re = /^(.+?)y$/;

			if ( re.test( mutatedWord ) ) {
				const fp = re.exec( mutatedWord );
				stem = fp[1];
				re = new RegExp( s_v );
				if ( re.test( stem ) ) {
					mutatedWord = `${stem}i`;
				}
			}

			// Step 2
			re = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;

			if ( re.test( mutatedWord ) ) {
				const fp = re.exec( mutatedWord );
				stem = fp[1];
				suffix = fp[2];
				re = new RegExp( mgr0 );

				if ( re.test( stem ) ) {
					mutatedWord = `${stem}${step2list[suffix]}`;
				}
			}

			// Step 3
			re = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;

			if ( re.test( mutatedWord ) ) {
				const fp = re.exec( mutatedWord );
				stem = fp[1];
				suffix = fp[2];
				re = new RegExp( mgr0 );

				if ( re.test( stem ) ) {
					mutatedWord = `${stem}${step3list[suffix]}`;
				}
			}

			// Step 4
			re = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;
			re2 = /^(.+?)(s|t)(ion)$/;

			if ( re.test( mutatedWord ) ) {
				const fp = re.exec( mutatedWord );
				stem = fp[1];
				re = new RegExp( mgr1 );

				if ( re.test( stem ) ) {
					mutatedWord = stem;
				}
			}
			else if ( re2.test( mutatedWord ) ) {
				const fp = re2.exec( mutatedWord );
				stem = fp[1] + fp[2];
				re2 = new RegExp( mgr1 );

				if ( re2.test( stem ) ) {
					mutatedWord = stem;
				}
			}

			// Step 5
			re = /^(.+?)e$/;

			if ( re.test( w ) ) {
				const fp = re.exec( w );
				stem = fp[1];
				re = new RegExp( mgr1 );
				re2 = new RegExp( meq1 );
				re3 = new RegExp( `^${C}${v}[^aeiouwxy]$` );

				if ( re.test( stem ) || ( re2.test( stem ) && !( re3.test( stem ) ) ) ) {
					mutatedWord = stem;
				}
			}

			re = /ll$/;
			re2 = new RegExp( mgr1 );

			if ( re.test( mutatedWord ) && re2.test( mutatedWord ) ) {
				re = /.$/;
				mutatedWord = mutatedWord.replace( re, '' );
			}

			// and turn initial Y back to y

			if ( startsWithY ) {
				mutatedWord = `${R.toLower( head )}${tail}`;
			}

			return mutatedWord;
		};
	} )();

	// tokenize function
	self.tokenize = function ( text, keepStopWords = false ) {

		// strip weird characters, separate into words,
		// and run stemmer algorithm on each word
		const sanitizedText = text
			.toLowerCase()
			.replace( /\W/g, ' ' )
			.replace( /\s+/g, ' ' )
			.trim()
			.split( ' ' )
			.map( a => self.stemmer( a ) );

		const out = [];

		for ( let i = 0; i < sanitizedText.length; i += 1 ) {
			if ( keepStopWords || stopWords.indexOf( sanitizedText[i] ) === -1 ) {
				out.push( sanitizedText[i] );
			}
		}

		return out;

	};

	/*
		* used in later calculations
		*/
	self.totalDocuments          = 0;
	self.totalDocumentTermLength = 0;
	self.averageDocumentLength   = 0;

	self.addDocument = function ( doc, id ) {
		if ( !doc.hasOwnProperty( 'body' ) ) {
			switch ( typeof doc ) {
				case 'string':
					doc = { body : doc };
					break;

				case 'object':
					const newDoc = { body : '' };
					for ( let i in doc ) {
						if ( typeof doc[i] == 'string' ) {
							newDoc.body += ` ${doc[i]}`;
						}
					}

					doc = newDoc;
					break;

				default:
					throw new Error( 1002, 'No indexable document body supplied or inferred. Documents must be of type String, or Object' );

			}

		}

		if ( typeof id === 'undefined' ) {
			throw new Error( 1000, 'ID is a required property of documents.' );
		}

		if ( typeof doc.body === 'undefined' ) {
			throw new Error( 1001, 'Body is a required property of documents.' );
		}

		// Raw tokenized list of words
		const tokens = self.tokenize( doc.body );

		// Will hold unique terms and their counts and frequencies
		const _terms = {};

		// docObj will eventually be added to the documents database
		const { body } = doc;
		const docObj = { id, tokens, body };

		// Count number of terms
		docObj.termCount = tokens.length;

		// Increment totalDocuments
		self.totalDocuments += 1;

		// Readjust averageDocumentLength
		self.totalDocumentTermLength += docObj.termCount;
		self.averageDocumentLength = self.totalDocumentTermLength / self.totalDocuments;

		// Calculate term frequency
		// First get terms count
		for ( let i = 0, len = tokens.length; i < len; i += 1 ) {
			const term = tokens[i];
			if ( !_terms[term] ) {
				_terms[term] = {
					count : 0,
					freq  : 0
				};
			}

			_terms[term].count += 1;
		}

		// Then re-loop to calculate term frequency.
		// We'll also update inverse document frequencies here.
		const keys = Object.keys( _terms );

		for ( let i = 0, len = keys.length; i < len; i += 1 ) {
			const term = keys[i];

			// Term Frequency for this document.
			_terms[term].freq = _terms[term].count / docObj.termCount;

			// Inverse Document Frequency initialization
			if ( !self.terms[term] ) {
				self.terms[term] = {
					n       : 0, // Number of docs this term appears in, uniquely
					idf     : 0,
					foundIn : []
				};
			}

			self.terms[term].n += 1;
			self.terms[term].foundIn.push( id );
		}

		// Calculate inverse document frequencies
		// This is SLOWish so if you want to index a big batch of documents,
		// comment this out and run it once at the end of your addDocuments run
		// If you're only indexing a document or two at a time you can leave this in.
		// this.updateIdf();

		// Add docObj to docs db
		docObj.terms = _terms;
		self.documents[docObj.id] = docObj;

	};

	return self;

} );


module.exports = BM25;
