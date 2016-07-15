/**
 * HOSTS file concatenator.
 *
 * This script loads files from a folder that each contain host entries
 * and concatenates all host entries to an output file without duplicate
 * entries.
 */
module.exports = {

    // filesystem
    _fs : require( "fs" ),

    // list of registered events
    _events : {},

    // module options
    _opt : {
        scanFrom   : "./hosts",
        saveTo     : "./build/hosts.txt",
        allowHosts : "./allow.txt",
        hostIp     : "127.0.0.1",
        lineSpace  : "\t",
        lineBreak  : "\n",
    },

    // parse data loaded from a hosts file into an object of unique entries
    _parseData : function ( data )
    {
        var hosts = {};

        if( typeof data === "string" )
        {
            data = data.replace( /\#.*?$/gim, "" ); // comments
            data = data.replace( /(255\.255\.255\.255|127\.0\.0\.1|0\.0\.0\.0|::1|fe[\w\:\%]+)/gim, "" ); // ips
            data = data.replace( /(^|[\r\n]+)?\.?(localhost|localdomain|local|broadcasthost)[^\.].*$/gim, "" ); // localhosts
            data = data.replace( /[\r\n\t\s]+/gim, "\n" ).trim(); // empty lines

            data.split( "\n" ).forEach( function( host )
            {
                var key  = host.replace( /[^a-zA-Z0-9]+/gm, "" ),
                    name = host.replace( /[\r\n\t\s\uFEFF\xA0]+/g, "" );

                if( key && name && !/^([\d\.]+)$/.test( name ) )
                {
                    hosts[ key ] = name;
                }
            });
        }
        return hosts;
    },

    // merge two lists of loaded hosts data together
    _mergeData : function ( obj, merge )
    {
        if( typeof obj === "object" && typeof merge === "object" )
        {
            for( var key in merge )
            {
                if( merge.hasOwnProperty( key ) )
                {
                    obj[ key ] = merge[ key ];
                }
            }
        }
        return obj;
    },

    // filter list of scanned folder contents to only include text files
    _filterFiles : function ( files )
    {
        var output = [];

        if( Array.isArray( files ) )
        {
            files.forEach( function( file )
            {
                if( /\.(txt)$/i.test( file ) )
                {
                    output.push( file );
                }
            });
        }
        return output;
    },

    // build final list of processed hosts to string
    _buildOutput : function ( hosts, allow )
    {
        var output = "";

        if( typeof hosts === "object" )
        {
            for( var key in hosts )
            {
                if( hosts.hasOwnProperty( key ) !== true ) continue;
                if( typeof allow === "object" && allow.hasOwnProperty( key ) ) continue;
                output += this._opt.hostIp + this._opt.lineSpace + hosts[ key ] + this._opt.lineBreak;
            }
        }
        return output;
    },

    // trigger all handlers for a registered event
    _trigger : function()
    {
        var event  = ( arguments.length ) ? [].shift.apply( arguments ) : "";

        if( event && this._events.hasOwnProperty( event ) )
        {
            for( var i = 0; i < this._events[ event ].length; i++ )
            {
                this._events[ event ][ i ].apply( this, arguments );
            }
            return true;
        }
        return false;
    },

    // trigger all handlers for a registered event to filter content data
    _filter : function( event, content )
    {
        if( event && this._events.hasOwnProperty( event ) )
        {
            for( var i = 0; i < this._events[ event ].length; i++ )
            {
                content = this._events[ event ][ i ].call( this, content, this._opt );
            }
        }
        return content;
    },

    // register an event handler
    on : function( event, handler )
    {
        if( event && typeof event === "string" && typeof handler === "function" )
        {
            if( Array.isArray( this._events[ event ] ) !== true )
            {
                this._events[ event ] = [];
            }
            this._events[ event ].push( handler );
        }
        return this;
    },

    // run concat operation
    run : function ( options )
    {
        var _fs           = this._fs,
            _trigger      = this._trigger.bind( this ),
            _filter       = this._filter.bind( this ),
            _parseData    = this._parseData.bind( this ),
            _mergeData    = this._mergeData.bind( this ),
            _filterFiles  = this._filterFiles.bind( this ),
            _buildOutput  = this._buildOutput.bind( this ),
            _opt          = this._mergeData( this._opt, options );

        // trigger start event
        _trigger( "start", _opt );

        // load list of allowed hosts
        _fs.readFile( _opt.allowHosts, "utf8", function( e, data )
        {
            if( e ) _trigger( "error", "Falied to load file: "+ _opt.allowHosts );

            var allow = _parseData( data ),
                hosts = {},
                total = 0,
                count = 1,
                data  = "";

            // scan files from input directory
            _fs.readdir( _opt.scanFrom, function( e, files )
            {
                if( e ) _trigger( "error", "Falied scan files from: "+ _opt.scanFrom );

                files = _filterFiles( files );
                total = files.length;

                // process each file
                files.forEach( function( file )
                {
                    // ready file data
                    _fs.readFile( _opt.scanFrom +"/"+ file, "utf8", function( e, data )
                    {
                        if( e ) _trigger( "error", "Falied read file data from: "+ _opt.scanFrom +"/"+ file );

                        hosts = _mergeData( hosts, _parseData( data ) );

                        if( count === total )
                        {
                            // build output data
                            data = _buildOutput( hosts, allow );
                            data = _filter( "build", data );

                            // write final data to file
                            _fs.writeFile( _opt.saveTo, data, function( e )
                            {
                                if( e ) _trigger( "error", "Failed to save output file to: "+ _opt.saveTo );
                                else _trigger( "finish", _opt );
                            });
                        }
                        count++;
                    });
                });
            });
        });
    },

};
