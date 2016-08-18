document.body.className = 'js';

(function(){
  'use strict';

  var canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = "black"; // this is default anyway
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  document.body.appendChild(canvas);
  var noise = generatePerlinNoise(512, 512);
  var imgData = ctx.createImageData(512, 512);
  var counter = 0;

  for (var i = 0; i < noise.length; i++) {
    imgData.data[counter] = noise[i] * 255;
    imgData.data[counter+1] = 0;
    imgData.data[counter+2] = 0;
    imgData.data[counter+3] = 255;
    counter+=4;
  }

  ctx.putImageData(imgData, 0, 0);

  if (isWebGlSupported()) {
    // Do webGL
    console.info('WebGL');
    return;
  }

  if (isCanvasSupported()) {
    // Do svg/css magic
    console.info('canvas');
    return;
  }

  if (isSvgSupported()) {
    // Do SVG magic
    console.info('svg');
    return;
  }

  //if () {

  //}


  function isCanvasSupported() {
    return !!window.CanvasRenderingContext2D;
  }

  function isWebGlSupported() {
    var elem = document.createElement('canvas');
    return !!((elem.getContext) && ((elem.getContext('webgl') || elem.getContext('experimental-webgl'))));
  }

  function isSvgSupported() {
    return !!(document.createElementNS && document.createElementNS('http://www.w3.org/2000/svg','svg').createSVGRect);
  }

  function generatePerlinNoise(width, height, options) {
    options = options || {};
    var octaveCount = options.octaveCount || 4;
    var amplitude = options.amplitude || 0.1;
    var persistence = options.persistence || 0.2;
    var whiteNoise = generateWhiteNoise(width, height);

    var smoothNoiseList = new Array(octaveCount);
    var i;
    for (i = 0; i < octaveCount; ++i) {
      smoothNoiseList[i] = generateSmoothNoise(i);
    }
    var perlinNoise = new Float32Array(width * height);
    var totalAmplitude = 0;
    // blend noise together
    for (i = octaveCount - 1; i >= 0; --i) {
      amplitude *= persistence;
      totalAmplitude += amplitude;

      for (var j = 0; j < perlinNoise.length; ++j) {
        perlinNoise[j] = perlinNoise[j] || 0;
        perlinNoise[j] += smoothNoiseList[i][j] * amplitude;
      }
    }
    // normalization
    for (i = 0; i < perlinNoise.length; ++i) {
      perlinNoise[i] /= totalAmplitude;
    }

    return perlinNoise;

    function generateSmoothNoise(octave) {
      var noise = new Array(width * height);
      var samplePeriod = Math.pow(2, octave);
      var sampleFrequency = 1 / samplePeriod;
      var noiseIndex = 0;
      for (var y = 0; y < height; ++y) {
        var sampleY0 = Math.floor(y / samplePeriod) * samplePeriod;
        var sampleY1 = (sampleY0 + samplePeriod) % height;
        var vertBlend = (y - sampleY0) * sampleFrequency;
        for (var x = 0; x < width; ++x) {
          var sampleX0 = Math.floor(x / samplePeriod) * samplePeriod;
          var sampleX1 = (sampleX0 + samplePeriod) % width;
          var horizBlend = (x - sampleX0) * sampleFrequency;

          // blend top two corners
          var top = interpolate(whiteNoise[sampleY0 * width + sampleX0], whiteNoise[sampleY1 * width + sampleX0], vertBlend);
          // blend bottom two corners
          var bottom = interpolate(whiteNoise[sampleY0 * width + sampleX1], whiteNoise[sampleY1 * width + sampleX1], vertBlend);
          // final blend
          noise[noiseIndex] = interpolate(top, bottom, horizBlend);
          noiseIndex += 1;
        }
      }
      return noise;
    }

    function generateWhiteNoise(width, height) {
      var noise = new Array(width * height);
      for (var i = 0; i < noise.length; ++i) {
        noise[i] = Math.random();
      }
      return noise;
    }
  }

  function interpolate(x0, x1, alpha) {
    return x0 * (1 - alpha) + alpha * x1;
  }
}());
