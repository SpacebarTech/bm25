const { cond, identity, replace, T, test } = require( 'ramda' );

const { dollaBillz, pluralS, pluralSS } = require( '../../lib/regex' );

const matchPlurals = cond( [
	[test( pluralSS ), replace( pluralSS, dollaBillz )],
	[test( pluralS ), replace( pluralS, dollaBillz )],
	[T, identity],
] );

module.exports = matchPlurals;
