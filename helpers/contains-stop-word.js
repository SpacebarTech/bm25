const { contains } = require( 'ramda' );

const stopWords    = require( '../lib/stopwords' );

const containsStopWord = n => contains( n, stopWords );

module.exports = containsStopWord;
