var express = require('express');
var multer = require('multer'),
  bodyParser = require('body-parser'),
  path = require('path');
var fs = require('fs');
const imagemin = require('imagemin');
const imageminJpegRecompress = require('imagemin-jpeg-recompress');
var path = require('path');
var gm = require('gm').subClass({ imageMagick: true });
var dir = __dirname;


var app = new express();

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

app.use(bodyParser.json());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.get('/', function (req, res) {
  res.render('index');
});

app.post('/', multer({ storage: multer.memoryStorage() }).single('upl'), function (req, res) {
  console.log(req.body); //form fields
	/* example output:
	{ title: 'abc' }
	 */
  console.log('imagemin')
  imagemin.buffer(req.file.buffer ,{
    plugins: [
      imageminJpegRecompress({ quality: "low", min: 50, max: 50 })
    ]
  }).catch(()=>{}).then(buffer => {
    console.log('Images optimized')
    gm(buffer, req.file.originalname)
      //.resize(40, 40, "!")
      .write(dir + '/optimized.jpg', function (err) {
        if (err) return console.dir(arguments)
        console.log(this.outname + ' created  :: ' + arguments[ 3 ])
      }
      ) 
  });

  

  console.log(req.file); //form files
	/* example output:
            { fieldname: 'upl',
              originalname: 'grumpy.png',
              encoding: '7bit',
              mimetype: 'image/png',
              destination: './uploads/',
              filename: '436ec561793aa4dc475a88e84776b1b9',
              path: 'uploads/436ec561793aa4dc475a88e84776b1b9',
              size: 277056 }
	 */
  res.status(204).end();
});

var port = 3000;
app.listen(port, function () { console.log('listening on port ' + port); });