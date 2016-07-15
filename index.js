/**
 * Main file to run concat operation.
 */
var concat = require( "./concat" );

// add header to build data
concat.on( "build", function( data, options )
{
    return "" +
    "# \n" +
    "# List of advertisement host names built from different sources. \n" +
    "# Build date: " + new Date() + " \n" +
    "# \n" + data;
});

// error handler
concat.on( "error", function( error, options )
{
    console.warn( error );
});

// start handler
concat.on( "start", function( options )
{
    console.log( "# " );
    console.log( "# Hosts concat running on: "+ options.scanFrom + "/*" );
});

// finish handler
concat.on( "finish", function( options )
{
    console.log( "# Output file saved to: "+ options.saveTo );
    console.log( "# " );
});

// run process
concat.run( { /* options */ } );