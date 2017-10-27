const R                = require( 'ramda' );

const re               = require( './lib/regex' );
const stopWords        = require( './lib/stopwords' );
const step2suffixes    = require( './lib/step2suffixes' );
const step3suffixes    = require( './lib/step3suffixes' );

const BM25 = ( function () {

	const self = this;

	// what we aim to populate
	self.terms     = {};
	self.documents = {};

	// stemmer algorithm
	self.stemmer = ( function () {
		return function (w) {

			var stem,         //
					suffix,       //
					firstch,      // first character
					re1,           // regular expression
					re2,          // regular expression
					re3,          //
					re4,          //
					origword = w; // cache original word

			// w cannot be condensed
			if (w.length < 3) { return w; }

			firstch = w.substr(0,1);

      // y at beginning of word is always consonant
      if (firstch == "y") {
        w = firstch.toUpperCase() + w.substr(1);
      }

				// Step 1a - match plurals
				re1  = /^(.+?)(ss|i)es$/;
				re2 = /^(.+?)([^s])s$/;

				if (re1.test(w)) { w = w.replace(re1,"$1$2"); }
				else if (re2.test(w)) {	w = w.replace(re2,"$1$2"); }

				// Step 1b - determine tense
				re1  = /^(.+?)eed$/;
				re2 = /^(.+?)(ed|ing)$/;

				// present
				if (re1.test(w)) {
					var fp = re1.exec(w);
					re1 = new RegExp(re.mgr0);// [C]VC
					if (re1.test(fp[1])) {
						re1 = /.$/;
						w = w.replace(re1,"");
					}
				}

				// past or present progressive
				else if (re2.test(w)) {
					var fp = re2.exec(w);
					stem = fp[1];
					re2 = new RegExp(re.vowelStem);
					if (re2.test(stem)) {
						w = stem;
						re2 = /(at|bl|iz)$/;
						re3 = new RegExp("([^aeiouylsz])\\1$");
						re4 = new RegExp("^" + re.consonants + re.vowel + "[^aeiouwxy]$");
						if (re2.test(w)) {	w = w + "e"; }
						else if (re3.test(w)) { re1 = /.$/; w = w.replace(re1,""); }
						else if (re4.test(w)) { w = w + "e"; }
					}
				}

				// Step 1c
				re1 = /^(.+?)y$/;
				if (re1.test(w)) {
					var fp = re1.exec(w);
					stem = fp[1];
					re1 = new RegExp(re.vowelStem);
					if (re1.test(stem)) { w = stem + "i"; }
				}

				// Step 2
				re1 = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;
				if (re1.test(w)) {
					var fp = re1.exec(w);
					stem = fp[1];
					suffix = fp[2];
					re1 = new RegExp(re.mgr0);
					if (re1.test(stem)) {
						w = stem + step2suffixes[suffix];
					}
				}

				// Step 3
				re1 = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;
				if (re1.test(w)) {
					var fp = re1.exec(w);
					stem = fp[1];
					suffix = fp[2];
					re1 = new RegExp(re.mgr0);
					if (re1.test(stem)) {
						w = stem + step3suffixes[suffix];
					}
				}

				// Step 4
				re1 = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;
				re2 = /^(.+?)(s|t)(ion)$/;
				if (re1.test(w)) {
					var fp = re1.exec(w);
					stem = fp[1];
					re1 = new RegExp(re.mgr1);
					if (re1.test(stem)) {
						w = stem;
					}
				} else if (re2.test(w)) {
					var fp = re2.exec(w);
					stem = fp[1] + fp[2];
					re2 = new RegExp(re.mgr1);
					if (re2.test(stem)) {
						w = stem;
					}
				}

				// Step 5
				re1 = /^(.+?)e$/;
				if (re1.test(w)) {
					var fp = re1.exec(w);
					stem = fp[1];
					re1 = new RegExp(re.mgr1);
					re2 = new RegExp(re.meq1);
					re3 = new RegExp("^" + re.consonants + re.vowel + "[^aeiouwxy]$");
					if (re1.test(stem) || (re2.test(stem) && !(re3.test(stem)))) {
						w = stem;
					}
				}

				re1 = /ll$/;
				re2 = new RegExp(re.mgr1);
				if (re1.test(w) && re2.test(w)) {
					re1 = /.$/;
					w = w.replace(re1,"");
				}

				// and turn initial Y back to y

				if (firstch == "y") {
					w = firstch.toLowerCase() + w.substr(1);
				}

				return w;
			}
		})();

		// tokenize function
		self.tokenize = function( text, keepStopWords = false ) {

			// strip weird characters, separate into words,
			// and run stemmer algorithm on each word
			text = text
						.toLowerCase()
						.replace(/\W/g, ' ')
						.replace(/\s+/g, ' ')
						.trim()
						.split(' ')
						.map(function(a) { return self.stemmer(a); });

				let out = [];

				for ( let i = 0; i < text.length; i ++ ) {

					if ( keepStopWords || stopWords.indexOf(text[i]) == -1 )
						out.push( text[i] );

				}

				return out;

		}

		/*
		 * used in later calculations
		 */
		self.totalDocuments          = 0;
		self.totalDocumentTermLength = 0;
		self.averageDocumentLength   = 0;

		self.addDocument = function( doc, id ) {

			if ( !doc.hasOwnProperty("body") ) {

				switch ( typeof doc ) {

					case "string" :

						doc = { body: doc };

						break;

					case "object" :

						let newDoc = { body: "" };

						for ( let i in doc ) {

							if ( typeof doc[i] == "string" )
								newDoc.body += " " + doc[i]

						}

						doc = newDoc;

						break;

					default:

						throw new Error(1002, 'No indexable document body supplied or inferred. Documents must be of type String, or Object')

				}

			}

				if ( typeof id === 'undefined' )
					throw new Error(1000, 'ID is a required property of documents.');

				if ( typeof doc.body === 'undefined' )
					throw new Error(1001, 'Body is a required property of documents.');

				// Raw tokenized list of words
				var tokens = self.tokenize(doc.body);

				// Will hold unique terms and their counts and frequencies
				var _terms = {};

				// docObj will eventually be added to the documents database
				var docObj = {id: id, tokens: tokens, body: doc.body};

				// Count number of terms
				docObj.termCount = tokens.length;

				// Increment totalDocuments
				self.totalDocuments++;

				// Readjust averageDocumentLength
				self.totalDocumentTermLength += docObj.termCount;
				self.averageDocumentLength = self.totalDocumentTermLength / self.totalDocuments;

				// Calculate term frequency
				// First get terms count
				for (var i = 0, len = tokens.length; i < len; i++) {
						var term = tokens[i];
						if (!_terms[term]) {
								_terms[term] = {
										count: 0,
										freq: 0
								};
						};
						_terms[term].count++;
				}

				// Then re-loop to calculate term frequency.
				// We'll also update inverse document frequencies here.
				var keys = Object.keys(_terms);
				for (var i = 0, len = keys.length; i < len; i++) {

						var term = keys[i];
						// Term Frequency for this document.
						_terms[term].freq = _terms[term].count / docObj.termCount;

						// Inverse Document Frequency initialization
						if (!self.terms[term]) {
								self.terms[term] = {
										n       : 0, // Number of docs this term appears in, uniquely
										idf     : 0,
										foundIn : []
								};
						}

						self.terms[term].n++;
						self.terms[term].foundIn.push( id );

				};

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

	});


const myBM25 = new BM25();

console.log(myBM25.tokenize('there are plenty of words to go around', true));
console.log(myBM25.tokenize('hopefully this works!', true));
