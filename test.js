const imagemin = require('imagemin');
const imageminJpegRecompress = require('imagemin-jpeg-recompress');

imagemin(['uploads/test.jpg'], 'build/images', {
  plugins: [
    imageminJpegRecompress({quality: "low", min: 80, max: 80})
  ]
}).then(() => {
  console.log('Images optimized');
});