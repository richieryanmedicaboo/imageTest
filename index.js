var express = require('express');
var multer = require('multer');
var bodyParser = require('body-parser');
var path = require('path');
//imagemin (image compressor)
var imagemin = require('imagemin');
var imageminJpegRecompress = require('imagemin-jpeg-recompress');
var imageminPngquant = require('imagemin-pngquant');
//gm (image manipulation)
var gm = require('gm').subClass({ imageMagick: true });
//AWS
var AWS = require('aws-sdk');
var s3 = new AWS.S3();

var myBucket = 'upload-test-v2';



//buffer = image buffer
//filename = image name
//quality = determine compression result (1-100)
//bucket = bucket to upload
//size = thumbnail size (size x size)

//Compress with imagemin
function compressUploadImage(buffer, filename, quality, bucket) {
  imagemin.buffer(buffer, {
    plugins: [
      imageminJpegRecompress({ min: quality, max: quality }),
      imageminPngquant({ quality: quality + "-" + quality, speed: 10 }),
    ]
  }).catch(() => { console.log("imagemin error") }).then(buffer => {
    console.log('Image compressed');
    uploadImage(buffer, Date.now().toString() + "_" + filename, bucket);
  });
}

//Upload to s3
function uploadImage(buffer, filename, bucket) {
  var params = {
    Bucket: bucket,
    Key: filename,
    Body: buffer
  };
  s3.putObject(params, function (err, data) {
    if (err) {
      console.log("Error PUTing file:", err);
    }
    console.log("S3 RESPONSE:", data);
    console.log("Uploaded picture: " + params.Key);
  });
}

//Resize with gm
function uploadThumbnail(buffer, filename, size, bucket) {
  gm(buffer, filename)
    .resize(size, size, "!")
    .toBuffer(function (err, buffer) {
      if (err) return console.log(err)
      uploadImage(buffer, "thumbnail_" + Date.now().toString() + "_" + filename, bucket)
    });
}

var app = new express();


app.use(bodyParser.json());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.get('/', function (req, res) {
  res.render('index');
});

app.post('/', multer({ storage: multer.memoryStorage() }).single('upl'), function (req, res) {
  //console.log(req.body); //form fields
	/* example output:
	{ title: 'abc' }
	 */
  compressUploadImage(req.file.buffer, req.file.originalname, 'low', myBucket);
  uploadThumbnail(req.file.buffer, req.file.originalname, 40, myBucket);



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

var port = 3010;
app.listen(port, function () { console.log('listening on port ' + port); });