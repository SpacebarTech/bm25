const { compose, join, juxt, toLower, head, tail } = require( 'ramda' );

const capitalize = compose(
  join( '' ),
  juxt( [compose( toLower, head ), tail] )
);

module.exports = capitalize;
