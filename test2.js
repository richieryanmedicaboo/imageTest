var fs = require('fs');
var gm = require('gm').subClass({imageMagick: true});
var dir = __dirname;

console.log(__dirname);
console.log(dir + '/test.jpg')
// resize and remove EXIF profile data
gm(dir + '/test.jpg')
  .resize(40,40, "!")
  .write(dir + '/resized.jpg', function (err) {
    if (err) return console.dir(arguments)
    console.log(this.outname + ' created  :: ' + arguments[ 3 ])
  }
  ) 