(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("BM25", [], factory);
	else if(typeof exports === 'object')
		exports["BM25"] = factory();
	else
		root["BM25"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HasProperty = function HasProperty(a, b) {
	return Object.prototype.hasOwnProperty.call(a, b);
};
var ToString = function ToString(val) {

	if ((typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object') {
		return Object.keys(val).reduce(function (str, a) {
			return str + ' ' + ToString(val[a]);
		}, '');
	}

	if (typeof val !== 'string') {
		throw new Error('Object contains property with value: ' + val + ' (type: ' + (typeof val === 'undefined' ? 'undefined' : _typeof(val)) + ')');
	}

	return val;
};

var findMatch = function findMatch(a, b) {
	var errorsAllowed = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2;


	var longest = a.length > b.length ? a : b;
	var shortest = longest === a ? b : a;

	var shortestIndex = 0;
	var errorsSoFar = 0;
	var lastError = null;

	for (var i = 0; i < longest.length; i += 1) {

		var lettersMatch = longest[i] === shortest[shortestIndex];

		// if these letters match, look
		// at the next set of letters
		if (lettersMatch) {

			shortestIndex += 1;

			// unless of course, that was the last letter, in which
			// case, we found a match!
			if (shortestIndex === shortest.length) {
				return i - (shortest.length - 1);
			}
		}

		// if they don't match
		else {

				// it's okay if we're still looking for
				// the start of the string
				if (shortestIndex === 0) {

					// unless of course, the remainder of the long string is
					// shorter than the short string
					if (longest.length - i < shortest.length) {
						return -1; // in that case, we know this isn't a match
					}

					continue; // eslint-disable-line
				}

				// if we're mid-string, record the error
				errorsSoFar += 1;

				// check if this and the last letter were flipped around
				// like this: something -> somtehing
				var twoLettersFlippedAround = shortest[shortestIndex] === longest[i - 1] && shortest[shortestIndex - 1] === longest[i]; // eslint-disable-line

				// if that's too many errors or it's a consecutive error that
				// wasn't caused by two letters being switched around
				var tooManyErrors = errorsSoFar > errorsAllowed;
				var consecutiveErrors = lastError === i - 1 && !twoLettersFlippedAround;
				if (tooManyErrors || consecutiveErrors) {

					// restart looking for the beginning of the short string
					// within the long string from this point
					shortestIndex = 0;
					errorsSoFar = 0;

					// unless of course, the remainder of the long string is
					// shorter than the short string
					if (longest.length - i < shortest.length) {
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
				if (shortestIndex === shortest.length) {
					return i - (shortest.length - 1);
				}
			}
	}

	// if we made it here somehow, it's not a match
	return -1;
};

var BM25 = function () {
	function BM25(inputOptions) {
		var _this = this;

		_classCallCheck(this, BM25);

		// define options
		var defaultOptions = {
			verbose: false
		};

		var options = Object.assign(defaultOptions, inputOptions);
		var optKeys = Object.keys(options);

		// set all options
		optKeys.forEach(function (key) {
			_this[key] = options[key];
		});

		// prepare top level stuff
		this.terms = {};
		this.documents = {};

		// stop words
		this.stopWords = ['a', 'about', 'above', 'across', 'after', 'afterwards', 'again', 'against', 'all', 'almost', 'alone', 'along', 'already', 'also', 'although', 'always', 'am', 'among', 'amongst', 'amoungst', 'amount', 'an', 'and', 'another', 'any', 'anyhow', 'anyone', 'anything', 'anyway', 'anywhere', 'are', 'around', 'as', 'at', 'back', 'be', 'became', 'because', 'become', 'becomes', 'becoming', 'been', 'before', 'beforehand', 'behind', 'being', 'below', 'beside', 'besides', 'between', 'beyond', 'bill', 'both', 'bottom', 'but', 'by', 'call', 'can', 'cannot', 'cant', 'co', 'computer', 'con', 'could', 'couldnt', 'cry', 'de', 'describe', 'detail', 'do', 'done', 'down', 'due', 'during', 'each', 'eg', 'eight', 'either', 'eleven', 'else', 'elsewhere', 'empty', 'enough', 'etc', 'even', 'ever', 'every', 'everyone', 'everything', 'everywhere', 'except', 'few', 'fifteen', 'fify', 'fill', 'find', 'fire', 'first', 'five', 'for', 'former', 'formerly', 'forty', 'found', 'four', 'from', 'front', 'full', 'further', 'get', 'give', 'go', 'had', 'has', 'hasnt', 'have', 'he', 'hence', 'her', 'here', 'hereafter', 'hereby', 'herein', 'hereupon', 'hers', 'herse', '', 'him', 'himse', '', 'his', 'how', 'however', 'hundred', 'i', 'ie', 'if', 'in', 'inc', 'indeed', 'interest', 'into', 'is', 'it', 'its', 'itse', '', 'keep', 'last', 'latter', 'latterly', 'least', 'less', 'ltd', 'made', 'many', 'may', 'me', 'meanwhile', 'might', 'mill', 'mine', 'more', 'moreover', 'most', 'mostly', 'move', 'much', 'must', 'my', 'myse', '', 'name', 'namely', 'neither', 'never', 'nevertheless', 'next', 'nine', 'no', 'nobody', 'none', 'noone', 'nor', 'not', 'nothing', 'now', 'nowhere', 'of', 'off', 'often', 'on', 'once', 'one', 'only', 'onto', 'or', 'other', 'others', 'otherwise', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'part', 'per', 'perhaps', 'please', 'put', 'rather', 're', 'same', 'see', 'seem', 'seemed', 'seeming', 'seems', 'serious', 'several', 'she', 'should', 'show', 'side', 'since', 'sincere', 'six', 'sixty', 'so', 'some', 'somehow', 'someone', 'something', 'sometime', 'sometimes', 'somewhere', 'still', 'such', 'system', 'take', 'ten', 'than', 'that', 'the', 'their', 'them', 'themselves', 'then', 'thence', 'there', 'thereafter', 'thereby', 'therefore', 'therein', 'thereupon', 'these', 'they', 'thick', 'thin', 'third', 'this', 'those', 'though', 'three', 'through', 'throughout', 'thru', 'thus', 'to', 'together', 'too', 'top', 'toward', 'towards', 'twelve', 'twenty', 'two', 'un', 'under', 'until', 'up', 'upon', 'us', 'very', 'via', 'was', 'we', 'well', 'were', 'what', 'whatever', 'when', 'whence', 'whenever', 'where', 'whereafter', 'whereas', 'whereby', 'wherein', 'whereupon', 'wherever', 'whether', 'which', 'while', 'whither', 'who', 'whoever', 'whole', 'whom', 'whose', 'why', 'will', 'with', 'within', 'without', 'would', 'yet', 'you', 'your', 'yours', 'yourself', 'yourselves'];

		// all following stored here for
		// easier use by stemmer algorithm
		this.step2list = {
			'ational': 'ate',
			'tional': 'tion',
			'enci': 'ence',
			'anci': 'ance',
			'izer': 'ize',
			'bli': 'ble',
			'alli': 'al',
			'entli': 'ent',
			'eli': 'e',
			'ousli': 'ous',
			'ization': 'ize',
			'ation': 'ate',
			'ator': 'ate',
			'alism': 'al',
			'iveness': 'ive',
			'fulness': 'ful',
			'ousness': 'ous',
			'aliti': 'al',
			'iviti': 'ive',
			'biliti': 'ble',
			'logi': 'log'
		};

		this.step3list = {
			'icate': 'ic',
			'ative': '',
			'alize': 'al',
			'iciti': 'ic',
			'ical': 'ic',
			'ful': '',
			'ness': ''
		};

		/* eslint-disable no-multi-spaces */
		this.c = '[^aeiou]'; // consonant
		this.v = '[aeiouy]'; // vowel
		this.C = this.c + '[^aeiouy]*'; // consonant sequence
		this.V = this.v + '[aeiou]*'; // vowel sequence

		this.mgr0 = '^(' + this.C + ')?' + this.V + this.C; // [C]VC... is m>0
		this.meq1 = '^(' + this.C + ')?' + this.V + this.C + '(' + this.V + ')?$'; // [C]VC[V] is m=1
		this.mgr1 = '^(' + this.C + ')?' + this.V + this.C + this.V + this.C; // [C]VCVC... is m>1
		this.s_v = '^(' + this.C + ')?' + this.v;
		/* eslint-enable no-multi-spaces */
	}

	_createClass(BM25, [{
		key: 'log',
		value: function log() {

			if (this.verbose) {
				var _console;

				(_console = console).log.apply(_console, arguments);
			}
		}
	}, {
		key: 'stemmer',
		value: function stemmer(W) {
			var _this2 = this;

			var w = W.toLowerCase(); // all to lower case (maybe bad)

			this.log('stemming word: ' + W);
			// w cannot be condensed
			if (w.length < 3) {
				this.log(W + ' is very short, and cannot be stemmed');
				return w;
			}

			var firstch = w.charAt(0);

			// y at beginning of word is always consonant
			if (firstch === 'y') {
				this.log(' - Capitalizing first letter "y" so it won\'t be caught by regexes');
				w = firstch.toUpperCase() + w.substr(1);
			}

			// Step 1a - match plurals
			this.log('Step 1a : ' + w);
			w = function (word) {

				var plurals = [/^(.+?)(ss|i)es$i/, /^(.+?)([^s])s$/];

				for (var i = 0; i < plurals.length; i += 1) {

					var regex = plurals[i];

					if (regex.test(word)) {
						return word.replace(regex, '$1$2');
					}
				}

				return word;
			}(w);

			// Step 1b - determine tense
			this.log('Step 1b : ' + w);
			w = function (word) {

				var endsInEed = /^(.+?)eed$/;
				var endsInEdOrIng = /^(.+?)(ed|ing)$/;

				// present tense
				if (endsInEed.test(word)) {

					var fp = endsInEed.exec(word);
					var cvc = new RegExp(_this2.mgr0); // [C]VC this.mgr0 is from constructor

					if (cvc.test(fp[1])) {
						return word.replace(/.$/, '');
					}
				}

				// past or present progressive
				else if (endsInEdOrIng.test(word)) {
						var _fp = endsInEdOrIng.exec(word);
						var stem = _fp[1];
						var vowelInStem = new RegExp(_this2.s_v);

						if (vowelInStem.test(stem)) {

							var regexes = [/(at|bl|iz)$/, new RegExp('([^aeiouylsz])\\1$'), new RegExp('^' + _this2.C + _this2.v + '[^aeiouwxy]$')];

							var transformations = [function (a) {
								return a + 'e';
							}, function (a) {
								return a.replace(/.$/, '');
							}, function (a) {
								return a + 'e';
							}];

							for (var i = 0; i < regexes.length; i += 1) {
								var regex = regexes[i];
								var transformation = transformations[i];

								if (regex.test(stem)) {
									return transformation(stem);
								}
							}
						}

						return stem;
					}

				return word;
			}(w);

			// Step 1c - fix words ending in y (I think)
			this.log('Step 1c : ' + w);
			w = function (word) {
				var endsInY = /^(.+?)y$/;
				if (endsInY.test(word)) {
					var fp = endsInY.exec(word);
					var stem = fp[1];
					var stemHasVowel = new RegExp(_this2.s_v);

					if (stemHasVowel.test(stem)) {
						return stem + 'i';
					}
				}

				return word;
			}(w);

			// Step 2
			this.log('Step 2  : ' + w);
			w = function (word) {

				var commonSuffixes = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;
				if (commonSuffixes.test(word)) {
					var fp = commonSuffixes.exec(word);
					var stem = fp[1];
					var suffix = fp[2];
					var cvc = new RegExp(_this2.mgr0); // [C]VC

					if (cvc.test(stem)) {
						return '' + stem + _this2.step2list[suffix];
					}
				}

				return word;
			}(w);

			// Step 3
			this.log('Step 3  : ' + w);
			w = function (word) {
				var suffixes = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;
				if (suffixes.test(word)) {
					var fp = suffixes.exec(w);

					var stem = fp[1];
					var suffix = fp[2];
					var cvc = new RegExp(_this2.mgr0);

					if (cvc.test(stem)) {
						return '' + stem + _this2.step3list[suffix];
					}
				}

				return word;
			}(w);

			// Step 4
			this.log('Step 4  : ' + w);
			w = function (word) {
				var cvc = new RegExp(_this2.mgr1);
				var suffixes = [{
					regex: /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/,
					transform: function transform(fp) {
						return '' + fp[1];
					}
				}, {
					regex: /^(.+?)(s|t)(ion)$/,
					transform: function transform(fp) {
						return '' + fp[1] + fp[2];
					}
				}];

				for (var i = 0; i < suffixes.length; i += 1) {

					var suffix = suffixes[i];
					var regex = suffix.regex,
					    transform = suffix.transform;


					if (regex.test(word)) {
						var fp = regex.exec(word);
						var stem = transform(fp);

						if (cvc.test(stem)) {
							return stem;
						}
					}
				}

				return word;
			}(w);

			// Step 5
			this.log('Step 5  : ' + w);
			w = function (word) {
				var endsInE = /^(.+?)e$/;
				var cvcvc = new RegExp(_this2.mgr1); // [C]VCVC  is m > 1

				if (endsInE.test(word)) {
					var fp = endsInE.exec(word);
					var stem = fp[1];

					var cvcv = new RegExp(_this2.meq1); // [C]VC[V] is m = 1
					var cvNn = new RegExp('^' + _this2.C + _this2.v + '[^aeiouqxy]$'); // CV doesn't end with aeiouqxy

					if ((cvcvc.test(stem) || cvcv.test(stem)) && !cvNn.test(stem)) {
						return stem;
					}
				}

				var endsInLL = /ll$/;
				if (endsInLL.test(word) && cvcvc.test(word)) {
					return word.replace(endsInLL, '');
				}

				return word;
			}(w);

			this.log('Step 6  : ' + w);
			// and turn initial Y back to y
			if (firstch === 'y') {
				w = firstch.toLowerCase() + w.substr(1);
			}

			return w;
		}
	}, {
		key: 'tokenize',
		value: function tokenize(text) {
			var _this3 = this;

			var keepStopWords = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;


			var words = text.toLowerCase().replace(/\W/g, ' ').replace(/\s+/g, ' ').trim().split(' ');

			this.log('Tokenizing : ["' + words.join('", "') + '"]');
			this.log((keepStopWords ? 'keeping' : 'removing') + ' stop words');

			if (keepStopWords) {
				return words.map(function (a) {
					return _this3.stemmer(a);
				});
			}

			return words.filter(function (a) {
				return _this3.stopWords.indexOf(a) === -1;
			}).map(function (a) {
				return _this3.stemmer(a);
			});
		}
	}, {
		key: 'index',
		value: function index(collection, inputOptions) {
			var _this4 = this;

			var then = Date.now();

			// set options
			var options = Object.assign({
				uniqueKey: 'key',
				keepStopWords: false, // whether to keep stop words such as prepositions
				indexOn: 'all', // what keys to index on (this does NOT take a not of which tokens belong to which keys, but simplifies the process of creating a more precise index)
				indexKeys: false // what keys to index on (this *does* keep note of which tokens belong to which keys)
			}, inputOptions);

			// ensure options aren't inherently
			// goofed up
			var conflictingIndexOnAndIndexKeys = options.indexOn !== 'all' && options.indexKeys !== false;
			if (conflictingIndexOnAndIndexKeys) {
				console.warning('Using the option "indexKeys" will overwrite any option specified by indexOn');
			}

			// all a user to specify a single key to
			// indexOn as a string
			if (typeof options.indexOn === 'string' && options.indexOn !== 'all') {
				options.indexOn = [options.indexOn]; // ensure array
			}

			// allow options.indexKeys to be a string
			if (typeof options.indexKeys === 'string') {
				options.indexKeys = [options.indexKeys];
			}

			var documents = function () {
				if (Array.isArray(collection)) {
					return collection.map(function (key, i) {
						return Object.assign(collection[i], { key: key });
					});
				}

				if ((typeof collection === 'undefined' ? 'undefined' : _typeof(collection)) !== 'object') {
					throw new Error('INDEXING ERROR: first parameter collection must be array or object');
				}

				return Object.keys(collection).map(function (key) {
					return Object.assign(collection[key], { key: key });
				});
			}();

			if (this.verbose) {
				console.log(then + ': indexing ' + documents.length + ' documents');
			}

			documents.forEach(function (doc) {

				// remove uniqueKey from document
				var key = doc[options.uniqueKey];

				// make sure that the key is a string
				if (typeof key !== 'string') {
					throw new Error('Unique key must be string. Instead found: ' + (typeof key === 'undefined' ? 'undefined' : _typeof(key)));
				}

				// cache the document for later
				_this4.documents[key] = doc;

				// get an object patterned like
				// prop : tokens[]
				var tokens = function () {

					// easy to tokenize a string
					if (typeof doc === 'string') {
						return { all: _this4.tokenize(doc, options.keepStopWords) };
					}

					// determine which properties to
					// tokenize and
					if ((typeof doc === 'undefined' ? 'undefined' : _typeof(doc)) === 'object') {

						// if we're indexing on all keys
						// then we can just make the object
						// into one string and tokenize that
						if (options.indexOn === 'all' && !options.indexKeys) {

							var words = Object.keys(doc).reduce(function (str, a) {
								return '' + str + doc[a] + ' ';
							}, '');

							return { all: _this4.tokenize(words, options.keepStopWords) };
						} else if (Array.isArray(options.indexOn) && !options.indexKeys) {

							var _words = Object.keys(doc).filter(function (a) {
								return options.indexOn.indexOf(a) !== -1;
							}).reduce(function (str, a) {
								return '' + str + doc[a] + ' ';
							}, '');

							return { all: _this4.tokenize(_words, options.keepStopWords) };
						} else if (options.indexKeys !== false) {

							// example:
							//
							// options.indexOn = ['name', 'description'];
							//
							// returns {
							//   name        : ['tokens', 'from', 'name'],
							//   description : ['tokens', 'in', 'description']
							// }
							return options.indexKeys.reduce(function (tokenObj, indexKey) {

								var tokenizedTerms = {};
								var propBody = function () {
									if (typeof doc[indexKey] === 'string') {
										return doc[indexKey];
									}

									if (_typeof(doc[indexKey]) === 'object') {
										return ToString(doc[indexKey]);
									}

									throw new Error('Prop must be string or object');
								}();

								tokenizedTerms[indexKey] = _this4.tokenize(propBody, options.keepStopWords);

								return Object.assign(tokenObj, tokenizedTerms);
							}, {});
						}
					}

					// if the document isn't a string or an
					// object, then that's an error
					throw new Error('First paramater doc must be string or object');
				}();

				// loop through each prop indexed,
				// if no properties have been specified
				// the prop will be 'all'
				var indexedProps = Object.keys(tokens);
				indexedProps.forEach(function (prop) {

					var index = prop === 'all' ? key : key + '/' + prop;

					var tokenList = tokens[prop];
					var termCount = tokenList.length;

					var terms = tokenList.reduce(function (countObj, term) {
						if (!HasProperty(countObj, term)) {
							countObj[term] = 0; // eslint-disable-line
						}

						countObj[term] += 1; // eslint-disable-line

						return countObj;
					}, {});

					Object.keys(terms).forEach(function (term) {

						if (!HasProperty(_this4.terms, term)) {

							_this4.terms[term] = {
								n: 0,
								foundIn: {}
							};
						}

						_this4.terms[term].n += 1;
						_this4.terms[term].foundIn[index] = terms[term] / termCount;
					});
				});
			});

			var now = Date.now();
			// console.log( this.terms );
			if (this.verbose) {
				console.log(now + ': done indexing after ' + (now - then) + 'ms');
			}
		}
	}, {
		key: 'search',
		value: function search(query, inputOptions) {
			var _this5 = this;

			var then = Date.now();
			console.log(then + ': searching for: \'' + query + '\'');

			var options = Object.assign({
				weight: null,
				maxResults: Infinity,
				returnDocumentsOnly: true
			}, inputOptions);

			if (query === '') {

				if (options.maxResults === Infinity) {
					return this.documents;
				}

				return this.documents.splice(0, options.maxResults);
			}

			var stripStopWords = query.split(/ +/).length > 2;
			var tokenizedTerms = this.tokenize(query, stripStopWords);
			var indexedTokens = Object.keys(this.terms);

			// const recordedRelevant = {};
			var relevantTokens = [];
			tokenizedTerms.forEach(function (term) {

				// this is a perfect match
				if (HasProperty(_this5.terms, term)) {

					relevantTokens.push({
						relevance: 1,
						term: term
					});
				}

				// loop to check if this is
				// a partial match
				indexedTokens.forEach(function (token) {

					// don't try to find matches in cases where
					// the token is shorter than the search term
					// or where the token is identical to the term
					if (token.length < term.length || token === term) {
						return;
					}

					// find match
					var match = findMatch(token, term);
					if (match !== -1) {

						// match becomes increasingly less relevant the
						// smaller the term is compared to the token, and
						// also the further into the token the match is found
						var relevance = parseFloat(((term.length / (token.length + match)) ** 2).toFixed(3), 10);
						relevantTokens.push({
							term: token,
							relevance: relevance
						});
					}
				});
			});

			// scales relevance according to
			// prop used

			var scaleRelevance = function scaleRelevance(r, propKey) {
				if (!propKey || options.weight === null) {
					return r;
				}

				if (!HasProperty(options.weight, propKey)) {
					return r;
				}

				return options.weight[propKey] * r;
			};

			// loop through relevant tokens
			// to compile our results set
			var results = [];
			var recorded = {};
			relevantTokens.forEach(function (token) {
				var term = token.term,
				    relevance = token.relevance;
				var foundIn = _this5.terms[term].foundIn;

				// search through all foundIn keys
				// for all matching tokens

				var foundInKeys = Object.keys(foundIn);
				foundInKeys.forEach(function (key) {

					// separate key into document key and property key
					// if there is no field, docKey will be the same
					// and propKey will be null
					var keyParts = key.split('/');
					var docKey = keyParts[0];
					var propKey = keyParts.length > 1 ? keyParts[1] : null;

					// if we already recorded this document as a result
					if (HasProperty(recorded, docKey)) {
						var index = recorded[docKey];
						var addedRelevance = function () {
							var inverseRelevance = relevance - Math.floor(relevance);

							if (inverseRelevance === 0) {
								return 0.5;
							}

							return inverseRelevance ** 2; // eslint-disable-line
						}();

						// increase the relevance of this search result
						results[index].relevance = parseFloat(results[index].relevance, 10) + addedRelevance;
						results[index].scaledRelevance = parseFloat(results[index].scaledRelevance, 10) + scaleRelevance(addedRelevance, propKey);

						// make sure that there is place to put this term
						if (!HasProperty(results[index].foundIn, propKey) && propKey !== null) {
							results[index].foundIn[propKey] = [];
						}

						results[index].foundIn[propKey].push(term);

						return;
					}

					var unweightedRelevance = parseFloat(foundIn[key], 10) + relevance;

					_this5.log('foundIn: ' + foundIn[key] + ' relevance: ' + relevance);

					var foundInProps = {};
					foundInProps[propKey] = [term];

					recorded[docKey] = results.length;
					results.push({
						document: _this5.documents[docKey] || null,
						key: docKey,
						foundIn: foundInProps,
						relevance: unweightedRelevance,
						scaledRelevance: scaleRelevance(unweightedRelevance)
					});
				});
			});

			var now = Date.now();
			console.log(now + ': done searching after ' + (now - then) + 'ms');

			var orderedResults = results.sort(function (a, b) {
				var A = a.scaledRelevance;
				var B = b.scaledRelevance;


				return B - A;
			});

			var limitedResults = function () {

				if (options.maxResults === Infinity) {
					return orderedResults;
				}

				return orderedResults.splice(0, 10);
			}();

			if (options.returnDocumentsOnly) {
				return limitedResults.map(function (a) {
					return a.document;
				});
			}

			return limitedResults;
		}
	}], [{
		key: 'fromIndex',
		value: function fromIndex(idx) {
			var bm25 = new BM25();

			bm25.terms = idx;

			return bm25;
		}
	}]);

	return BM25;
}();

exports.default = BM25;
module.exports = exports['default'];

/***/ })
/******/ ]);
});
//# sourceMappingURL=index.js.map