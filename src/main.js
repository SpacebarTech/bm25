const HasProperty = ( a, b ) => Object.prototype.hasOwnProperty.call( a, b );
const ToString = ( val ) => {

	if ( typeof val === 'object' ) {
		return Object.keys( val ).reduce( ( str, a ) => `${str} ${ToString( val[a] )}`, '' );
	}

	if ( typeof val !== 'string' ) {
		throw new Error( `Object contains property with value: ${val} (type: ${typeof val})` );
	}

	return val;

};

const findMatch = ( a, b, errorsAllowed = 2 ) => {

	const longest  = a.length > b.length ? a : b;
	const shortest = longest === a ? b : a;

	let shortestIndex = 0;
	let errorsSoFar   = 0;
	let lastError     = null;

	for ( let i = 0; i < longest.length; i += 1 ) {

		const lettersMatch = ( longest[i] === shortest[shortestIndex] );

		// if these letters match, look
		// at the next set of letters
		if ( lettersMatch ) {

			shortestIndex += 1;

			// unless of course, that was the last letter, in which
			// case, we found a match!
			if ( shortestIndex === shortest.length ) {
				return i - ( shortest.length - 1 );
			}

		}

		// if they don't match
		else {

			// it's okay if we're still looking for
			// the start of the string
			if ( shortestIndex === 0 ) {

				// unless of course, the remainder of the long string is
				// shorter than the short string
				if ( longest.length - i < shortest.length ) {
					return -1; // in that case, we know this isn't a match
				}

				continue; // eslint-disable-line

			}

			// if we're mid-string, record the error
			errorsSoFar += 1;

			// check if this and the last letter were flipped around
			// like this: something -> somtehing
			const twoLettersFlippedAround = ( shortest[shortestIndex] === longest[i - 1] && shortest[shortestIndex - 1] === longest[i] ); // eslint-disable-line

			// if that's too many errors or it's a consecutive error that
			// wasn't caused by two letters being switched around
			const tooManyErrors     = ( errorsSoFar > errorsAllowed );
			const consecutiveErrors = ( lastError === ( i - 1 ) && !twoLettersFlippedAround );
			if ( tooManyErrors || consecutiveErrors ) {

				// restart looking for the beginning of the short string
				// within the long string from this point
				shortestIndex = 0;
				errorsSoFar   = 0;

				// unless of course, the remainder of the long string is
				// shorter than the short string
				if ( longest.length - i < shortest.length ) {
					return -1; // in that case, we know this isn't a match
				}

				continue; // eslint-disable-line

			}

			// if that wasn't too many errors, just move on
			// to the next letter, but record when our last
			// error was
			shortestIndex++; // eslint-disable-line
			lastError = i;

			// unless that was the last letter in which case,
			// that's a match!
			if ( shortestIndex === shortest.length ) {
				return i - ( shortest.length - 1 );
			}

		}

	}

	// if we made it here somehow, it's not a match
	return -1;

};

export default class BM25 {

	constructor( inputOptions ) {

		// define options
		const defaultOptions = {
			verbose : false,
		};

		const options = Object.assign( defaultOptions, inputOptions );
		const optKeys = Object.keys( options );

		// set all options
		optKeys.forEach( ( key ) => {
			this[key] = options[key];
		} );

		// prepare top level stuff
		this.terms     = {};
		this.documents = {};

		// stop words
		this.stopWords = ['a', 'about', 'above', 'across', 'after', 'afterwards', 'again', 'against', 'all', 'almost', 'alone', 'along', 'already', 'also', 'although', 'always', 'am', 'among', 'amongst', 'amoungst', 'amount', 'an', 'and', 'another', 'any', 'anyhow', 'anyone', 'anything', 'anyway', 'anywhere', 'are', 'around', 'as', 'at', 'back', 'be', 'became', 'because', 'become', 'becomes', 'becoming', 'been', 'before', 'beforehand', 'behind', 'being', 'below', 'beside', 'besides', 'between', 'beyond', 'bill', 'both', 'bottom', 'but', 'by', 'call', 'can', 'cannot', 'cant', 'co', 'computer', 'con', 'could', 'couldnt', 'cry', 'de', 'describe', 'detail', 'do', 'done', 'down', 'due', 'during', 'each', 'eg', 'eight', 'either', 'eleven', 'else', 'elsewhere', 'empty', 'enough', 'etc', 'even', 'ever', 'every', 'everyone', 'everything', 'everywhere', 'except', 'few', 'fifteen', 'fify', 'fill', 'find', 'fire', 'first', 'five', 'for', 'former', 'formerly', 'forty', 'found', 'four', 'from', 'front', 'full', 'further', 'get', 'give', 'go', 'had', 'has', 'hasnt', 'have', 'he', 'hence', 'her', 'here', 'hereafter', 'hereby', 'herein', 'hereupon', 'hers', 'herse', '', 'him', 'himse', '', 'his', 'how', 'however', 'hundred', 'i', 'ie', 'if', 'in', 'inc', 'indeed', 'interest', 'into', 'is', 'it', 'its', 'itse', '', 'keep', 'last', 'latter', 'latterly', 'least', 'less', 'ltd', 'made', 'many', 'may', 'me', 'meanwhile', 'might', 'mill', 'mine', 'more', 'moreover', 'most', 'mostly', 'move', 'much', 'must', 'my', 'myse', '', 'name', 'namely', 'neither', 'never', 'nevertheless', 'next', 'nine', 'no', 'nobody', 'none', 'noone', 'nor', 'not', 'nothing', 'now', 'nowhere', 'of', 'off', 'often', 'on', 'once', 'one', 'only', 'onto', 'or', 'other', 'others', 'otherwise', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'part', 'per', 'perhaps', 'please', 'put', 'rather', 're', 'same', 'see', 'seem', 'seemed', 'seeming', 'seems', 'serious', 'several', 'she', 'should', 'show', 'side', 'since', 'sincere', 'six', 'sixty', 'so', 'some', 'somehow', 'someone', 'something', 'sometime', 'sometimes', 'somewhere', 'still', 'such', 'system', 'take', 'ten', 'than', 'that', 'the', 'their', 'them', 'themselves', 'then', 'thence', 'there', 'thereafter', 'thereby', 'therefore', 'therein', 'thereupon', 'these', 'they', 'thick', 'thin', 'third', 'this', 'those', 'though', 'three', 'through', 'throughout', 'thru', 'thus', 'to', 'together', 'too', 'top', 'toward', 'towards', 'twelve', 'twenty', 'two', 'un', 'under', 'until', 'up', 'upon', 'us', 'very', 'via', 'was', 'we', 'well', 'were', 'what', 'whatever', 'when', 'whence', 'whenever', 'where', 'whereafter', 'whereas', 'whereby', 'wherein', 'whereupon', 'wherever', 'whether', 'which', 'while', 'whither', 'who', 'whoever', 'whole', 'whom', 'whose', 'why', 'will', 'with', 'within', 'without', 'would', 'yet', 'you', 'your', 'yours', 'yourself', 'yourselves'];

		// all following stored here for
		// easier use by stemmer algorithm
		this.step2list = {
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
			'logi'    : 'log'
		};

		this.step3list = {
			'icate' : 'ic',
			'ative' : '',
			'alize' : 'al',
			'iciti' : 'ic',
			'ical'  : 'ic',
			'ful'   : '',
			'ness'  : ''
		};

		/* eslint-disable no-multi-spaces */
		this.c = '[^aeiou]';               // consonant
		this.v = '[aeiouy]';               // vowel
		this.C = `${this.c}[^aeiouy]*`;    // consonant sequence
		this.V = `${this.v}[aeiou]*`;      // vowel sequence

		this.mgr0 = `^(${this.C})?${this.V}${this.C}`;                  // [C]VC... is m>0
		this.meq1 = `^(${this.C})?${this.V}${this.C}(${this.V})?$`;     // [C]VC[V] is m=1
		this.mgr1 = `^(${this.C})?${this.V}${this.C}${this.V}${this.C}`; // [C]VCVC... is m>1
		this.s_v  = `^(${this.C})?${this.v}`;
		/* eslint-enable no-multi-spaces */

	}

	log( ...args ) {

		if ( this.verbose ) {
			console.log( ...args );
		}

	}

	stemmer( W ) {

		let w = W.toLowerCase(); // all to lower case (maybe bad)

		this.log( `stemming word: ${W}` );
		// w cannot be condensed
		if ( w.length < 3 ) {
			this.log( `${W} is very short, and cannot be stemmed` );
			return w;
		}

		const firstch = w.charAt( 0 );

		// y at beginning of word is always consonant
		if ( firstch === 'y' ) {
			this.log( ' - Capitalizing first letter "y" so it won\'t be caught by regexes' );
			w = firstch.toUpperCase() + w.substr( 1 );
		}

		// Step 1a - match plurals
		this.log( `Step 1a : ${w}` );
		w = ( ( word ) => {

			const plurals = [
				/^(.+?)(ss|i)es$i/,
				/^(.+?)([^s])s$/
			];

			for ( let i = 0; i < plurals.length; i += 1 ) {

				const regex = plurals[i];

				if ( regex.test( word ) ) {
					return word.replace( regex, '$1$2' );
				}

			}

			return word;

		} )( w );

		// Step 1b - determine tense
		this.log( `Step 1b : ${w}` );
		w = ( ( word ) => {

			const endsInEed     = /^(.+?)eed$/;
			const endsInEdOrIng = /^(.+?)(ed|ing)$/;

			// present tense
			if ( endsInEed.test( word ) ) {

				const fp  = endsInEed.exec( word );
				const cvc = new RegExp( this.mgr0 ); // [C]VC this.mgr0 is from constructor

				if ( cvc.test( fp[1] ) ) {
					return word.replace( /.$/, '' );
				}
			}

			// past or present progressive
			else if ( endsInEdOrIng.test( word ) ) {
				const fp          = endsInEdOrIng.exec( word );
				const stem        = fp[1];
				const vowelInStem = new RegExp( this.s_v );

				if ( vowelInStem.test( stem ) ) {

					const regexes = [
						/(at|bl|iz)$/,
						new RegExp( '([^aeiouylsz])\\1$' ),
						new RegExp( `^${this.C}${this.v}[^aeiouwxy]$` )
					];

					const transformations = [
						( a => `${a}e` ),
						( a => a.replace( /.$/, '' ) ),
						( a => `${a}e` )
					];

					for ( let i = 0; i < regexes.length; i += 1 ) {
						const regex          = regexes[i];
						const transformation = transformations[i];

						if ( regex.test( stem ) ) {
							return transformation( stem );
						}
					}
				}

				return stem;
			}

			return word;
		} )( w );

		// Step 1c - fix words ending in y (I think)
		this.log( `Step 1c : ${w}` );
		w = ( ( word ) => {
			const endsInY = /^(.+?)y$/;
			if ( endsInY.test( word ) ) {
				const fp           = endsInY.exec( word );
				const stem         = fp[1];
				const stemHasVowel = new RegExp( this.s_v );

				if ( stemHasVowel.test( stem ) ) {
					return `${stem}i`;
				}
			}

			return word;
		} )( w );

		// Step 2
		this.log( `Step 2  : ${w}` );
		w = ( ( word ) => {

			const commonSuffixes = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;
			if ( commonSuffixes.test( word ) ) {
				const fp     = commonSuffixes.exec( word );
				const stem   = fp[1];
				const suffix = fp[2];
				const cvc    = new RegExp( this.mgr0 ); // [C]VC

				if ( cvc.test( stem ) ) {
					return `${stem}${this.step2list[suffix]}`;
				}
			}

			return word;

		} )( w );

		// Step 3
		this.log( `Step 3  : ${w}` );
		w = ( ( word ) => {
			const suffixes = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;
			if ( suffixes.test( word ) ) {
				const fp = suffixes.exec( w );

				const stem   = fp[1];
				const suffix = fp[2];
				const cvc    = new RegExp( this.mgr0 );

				if ( cvc.test( stem ) ) {
					return `${stem}${this.step3list[suffix]}`;
				}
			}

			return word;
		} )( w );

		// Step 4
		this.log( `Step 4  : ${w}` );
		w = ( ( word ) => {
			const cvc      = new RegExp( this.mgr1 );
			const suffixes = [
				{
					regex     : /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/,
					transform : ( fp => `${fp[1]}` )
				},
				{
					regex     : /^(.+?)(s|t)(ion)$/,
					transform : ( fp => `${fp[1]}${fp[2]}` )
				}
			];

			for ( let i = 0; i < suffixes.length; i += 1 ) {

				const suffix               = suffixes[i];
				const { regex, transform } = suffix;

				if ( regex.test( word ) ) {
					const fp   = regex.exec( word );
					const stem = transform( fp );

					if ( cvc.test( stem ) ) {
						return stem;
					}
				}

			}

			return word;

		} )( w );

		// Step 5
		this.log( `Step 5  : ${w}` );
		w = ( ( word ) => {
			const endsInE = /^(.+?)e$/;
			const cvcvc   = new RegExp( this.mgr1 ); // [C]VCVC  is m > 1

			if ( endsInE.test( word ) ) {
				const fp   = endsInE.exec( word );
				const stem = fp[1];

				const cvcv  = new RegExp( this.meq1 ); // [C]VC[V] is m = 1
				const cvNn  = new RegExp( `^${this.C}${this.v}[^aeiouqxy]$` ); // CV doesn't end with aeiouqxy

				if ( ( cvcvc.test( stem ) || cvcv.test( stem ) ) && !( cvNn.test( stem ) ) ) {
					return stem;
				}
			}

			const endsInLL = /ll$/;
			if ( endsInLL.test( word ) && cvcvc.test( word ) ) {
				return word.replace( endsInLL, '' );
			}

			return word;
		} )( w );

		this.log( `Step 6  : ${w}` );
		// and turn initial Y back to y
		if ( firstch === 'y' ) {
			w = firstch.toLowerCase() + w.substr( 1 );
		}

		return w;

	}

	tokenize( text, keepStopWords = false ) {

		const words = text
			.toLowerCase()
			.replace( /\W/g, ' ' )
			.replace( /\s+/g, ' ' )
			.trim()
			.split( ' ' );

		this.log( `Tokenizing : ["${words.join( '", "' )}"]` );
		this.log( `${keepStopWords ? 'keeping' : 'removing'} stop words` );

		if ( keepStopWords ) {
			return words.map( a => this.stemmer( a ) );
		}

		return words
			.filter( a => ( this.stopWords.indexOf( a ) === -1 ) )
			.map( a => this.stemmer( a ) );

	}

	index( collection, inputOptions ) {

		const then = Date.now();

		// set options
		const options = Object.assign( {
			uniqueKey     : 'key',
			keepStopWords : false, // whether to keep stop words such as prepositions
			indexOn       : 'all', // what keys to index on (this does NOT take a not of which tokens belong to which keys, but simplifies the process of creating a more precise index)
			indexKeys     : false, // what keys to index on (this *does* keep note of which tokens belong to which keys)
		}, inputOptions );

		// ensure options aren't inherently
		// goofed up
		const conflictingIndexOnAndIndexKeys = ( options.indexOn !== 'all' && ( options.indexKeys !== false ) );
		if ( conflictingIndexOnAndIndexKeys ) {
			console.warning( 'Using the option "indexKeys" will overwrite any option specified by indexOn' );
		}

		// all a user to specify a single key to
		// indexOn as a string
		if ( typeof options.indexOn === 'string' && options.indexOn !== 'all' ) {
			options.indexOn = [options.indexOn]; // ensure array
		}

		// allow options.indexKeys to be a string
		if ( typeof options.indexKeys === 'string' ) {
			options.indexKeys = [options.indexKeys];
		}

		const documents = ( () => {
			if ( Array.isArray( collection ) ) {
				return collection.map( ( key, i ) => Object.assign( collection[i], { key } ) );
			}

			if ( typeof collection !== 'object' ) {
				throw new Error( 'INDEXING ERROR: first parameter collection must be array or object' );
			}

			return Object.keys( collection )
				.map( key => Object.assign( collection[key], { key } ) );
		} )();

		if ( this.verbose ) {
			console.log( `${then}: indexing ${documents.length} documents` );
		}

		documents.forEach( ( doc ) => {

			// remove uniqueKey from document
			const key = doc[options.uniqueKey];

			// make sure that the key is a string
			if ( typeof key !== 'string' ) {
				throw new Error( `Unique key must be string. Instead found: ${typeof key}` );
			}

			// cache the document for later
			this.documents[key] = doc;

			// get an object patterned like
			// prop : tokens[]
			const tokens = ( () => {

				// easy to tokenize a string
				if ( typeof doc === 'string' ) {
					return { all : this.tokenize( doc, options.keepStopWords ) };
				}

				// determine which properties to
				// tokenize and
				if ( typeof doc === 'object' ) {

					// if we're indexing on all keys
					// then we can just make the object
					// into one string and tokenize that
					if ( options.indexOn === 'all' && !options.indexKeys ) {

						const words = Object.keys( doc )
							.reduce( ( str, a ) => `${str}${doc[a]} `, '' );

						return { all : this.tokenize( words, options.keepStopWords ) };

					}

					else if ( Array.isArray( options.indexOn ) && !options.indexKeys ) {

						const words = Object.keys( doc )
							.filter( a => options.indexOn.indexOf( a ) !== -1 )
							.reduce( ( str, a ) => `${str}${doc[a]} `, '' );

						return { all : this.tokenize( words, options.keepStopWords ) };

					}

					else if ( options.indexKeys !== false ) {

						// example:
						//
						// options.indexOn = ['name', 'description'];
						//
						// returns {
						//   name        : ['tokens', 'from', 'name'],
						//   description : ['tokens', 'in', 'description']
						// }
						return options.indexKeys.reduce( ( tokenObj, indexKey ) => {

							const tokenizedTerms = {};
							const propBody       = ( () => {
								if ( typeof doc[indexKey] === 'string' ) {
									return doc[indexKey];
								}

								if ( typeof doc[indexKey] === 'object' ) {
									return ToString( doc[indexKey] );
								}

								throw new Error( 'Prop must be string or object' );
							} )();

							tokenizedTerms[indexKey]  = this.tokenize( propBody, options.keepStopWords );

							return Object.assign( tokenObj, tokenizedTerms );

						}, {} );

					}

				}

				// if the document isn't a string or an
				// object, then that's an error
				throw new Error( 'First paramater doc must be string or object' );

			} )();

			// loop through each prop indexed,
			// if no properties have been specified
			// the prop will be 'all'
			const indexedProps = Object.keys( tokens );
			indexedProps.forEach( ( prop ) => {

				const index = ( prop === 'all' ? key : `${key}/${prop}` );

				const tokenList = tokens[prop];
				const termCount = tokenList.length;

				const terms = tokenList.reduce( ( countObj, term ) => {
					if ( !HasProperty( countObj, term ) ) {
						countObj[term] = 0; // eslint-disable-line
					}

					countObj[term] += 1; // eslint-disable-line

					return countObj;
				}, {} );

				Object.keys( terms ).forEach( ( term ) => {

					if ( !HasProperty( this.terms, term ) ) {

						this.terms[term] = {
							n       : 0,
							foundIn : {},
						};

					}

					this.terms[term].n += 1;
					this.terms[term].foundIn[index] = ( terms[term] / termCount );

				} );

			} );

		} );

		const now = Date.now();
		// console.log( this.terms );
		if ( this.verbose ) {
			console.log( `${now}: done indexing after ${now - then}ms` );
		}

	}

	search( query, inputOptions ) {

		const then = Date.now();
		console.log( `${then}: searching for: '${query}'` );

		const options = Object.assign( {
			weight              : null,
			maxResults          : Infinity,
			returnDocumentsOnly : true
		}, inputOptions );

		if ( query === '' ) {

			if ( options.maxResults === Infinity ) {
				return this.documents;
			}

			return this.documents.splice( 0, options.maxResults );

		}

		const stripStopWords = ( query.split( / +/ ).length > 2 );
		const tokenizedTerms = this.tokenize( query, stripStopWords );
		const indexedTokens  = Object.keys( this.terms );

		// const recordedRelevant = {};
		const relevantTokens   = [];
		tokenizedTerms.forEach( ( term ) => {

			// this is a perfect match
			if ( HasProperty( this.terms, term ) ) {

				relevantTokens.push( {
					relevance : 1,
					term,
				} );

			}

			// loop to check if this is
			// a partial match
			indexedTokens.forEach( ( token ) => {

				// don't try to find matches in cases where
				// the token is shorter than the search term
				// or where the token is identical to the term
				if ( token.length < term.length || ( token === term ) ) {
					return;
				}

				// find match
				const match = findMatch( token, term );
				if ( match !== -1 ) {

					// match becomes increasingly less relevant the
					// smaller the term is compared to the token, and
					// also the further into the token the match is found
					const relevance = parseFloat( ( ( term.length / ( token.length + match ) ) ** 2 ).toFixed( 3 ), 10 );
					relevantTokens.push( {
						term : token,
						relevance
					} );

				}

			} );

		} );

		// scales relevance according to
		// prop used

		const scaleRelevance = ( r, propKey ) => {
			if ( !propKey || options.weight === null ) {
				return r;
			}

			if ( !HasProperty( options.weight, propKey ) ) {
				return r;
			}

			return options.weight[propKey] * r;
		};

		// loop through relevant tokens
		// to compile our results set
		const results  = [];
		const recorded = {};
		relevantTokens.forEach( ( token ) => {

			const { term, relevance } = token;
			const { foundIn } = this.terms[term];

			// search through all foundIn keys
			// for all matching tokens
			const foundInKeys = Object.keys( foundIn );
			foundInKeys.forEach( ( key ) => {

				// separate key into document key and property key
				// if there is no field, docKey will be the same
				// and propKey will be null
				const keyParts = key.split( '/' );
				const docKey   = keyParts[0];
				const propKey  = keyParts.length > 1 ? keyParts[1] : null;

				// if we already recorded this document as a result
				if ( HasProperty( recorded, docKey ) ) {
					const index = recorded[docKey];
					const addedRelevance = ( () => {
						const inverseRelevance = ( relevance - Math.floor( relevance ) );

						if ( inverseRelevance === 0 ) {
							return 0.5;
						}

						return ( inverseRelevance ** 2 ); // eslint-disable-line
					} )();

					// increase the relevance of this search result
					results[index].relevance       = parseFloat( results[index].relevance, 10 ) + addedRelevance;
					results[index].scaledRelevance = parseFloat( results[index].scaledRelevance, 10 ) + scaleRelevance( addedRelevance, propKey );

					// make sure that there is place to put this term
					if ( !HasProperty( results[index].foundIn, propKey ) && propKey !== null ) {
						results[index].foundIn[propKey] = [];
					}

					results[index].foundIn[propKey].push( term );

					return;
				}

				const unweightedRelevance = ( parseFloat( foundIn[key], 10 ) + relevance );

				this.log( `foundIn: ${foundIn[key]} relevance: ${relevance}` );

				const foundInProps = {};
				foundInProps[propKey] = [term];

				recorded[docKey] = results.length;
				results.push( {
					document        : this.documents[docKey] || null,
					key             : docKey,
					foundIn         : foundInProps,
					relevance       : unweightedRelevance,
					scaledRelevance : scaleRelevance( unweightedRelevance ),
				} );

			} );

		} );

		const now = Date.now();
		console.log( `${now}: done searching after ${now - then}ms` );

		const orderedResults = results.sort( ( a, b ) => {
			const { scaledRelevance : A } = a;
			const { scaledRelevance : B } = b;

			return B - A;
		} );

		const limitedResults = ( () => {

			if ( options.maxResults === Infinity ) {
				return orderedResults;
			}

			return orderedResults.splice( 0, 10 );

		} )();

		if ( options.returnDocumentsOnly ) {
			return limitedResults.map( a => a.document );
		}

		return limitedResults;

	}

	static fromIndex( idx ) {
		const bm25 = new BM25();

		bm25.terms = idx;

		return bm25;
	}

}
