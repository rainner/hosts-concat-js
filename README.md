[twitter]: http://twitter.com/raintek_
[mit]: http://www.opensource.org/licenses/mit-license.php
[repo]: https://github.com/rainner/syntaxy-js
[demo]: https://rainner.github.io/syntaxy-js

# HOSTS Concatenation Script
This is a node.js script that reads host names from input host files and concatenates all host names
to a final build file without duplicate entries to be used as a hosts file on a system, intended for
blocking network connections, specifically ads on the web.

### Options
These are available options that can be passed to the concat JS module.
```js
{
    // folder to load hosts files from
    scanFrom : "./hosts",
    // final output file path
    saveTo : "./build/hosts.txt",
    // optional file with allowed hostnames
    allowHosts : "./allow.txt",
    // local IP to resolve to
    hostIp : "127.0.0.1",
    // ip/host delimeter space
    lineSpace : "\t",
    // line break
    lineBreak : "\n",
}
```

## NPM Usage
Once you have a few hosts files, or any text files that contain hosts entries similar to the format of a HOSTS file, place them in the `./hosts` folder, then run the script:

```html
npm run concat
```

## Code usage
Using the contcat module manually.
```js
// import module
var concat = require( "./concat" );
// register error event
concat.on( "error", function( error, options ){ /* ... */ } );
// register start event
concat.on( "start", function( options ){ /* ... */ } );
// register build filter event
concat.on( "build", function( data, options ){ return data; } );
// register finish event
concat.on( "finish", function( options ){ /* ... */ } );
// run script
concat.run( { /* options */ } );
```

### Author

Rainner Lins: [@raintek_][twitter]

### License

Licensed under [MIT][mit].
