const { compose, join, juxt, toUpper, head, tail } = require( 'ramda' );

const capitalize = compose(
  join( '' ),
  juxt( [compose( toUpper, head ), tail] )
);

module.exports = capitalize;
