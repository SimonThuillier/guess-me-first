
const {sqrt, max, ceil} = Math;

/**
 * returns game svg dimensions : 512px square if desktop resolution, 256px square if mobile resolution
 * @returns {Array}
 */
export const getDims = () =>{
    let maxSize = 512;

    let minSize = 4;

    if (window.innerWidth < 550) {
      maxSize=256;
      minSize=2;
    }

    let dim = maxSize / minSize;

    return {maxSize, minSize, dim};
}

/**
 * returns a function allowing to get /set the grid
 * @param {Number} w 
 * @param {Number} h 
 * @returns {Callable}
 */
export function array2d(w, h) {
    let a = [];
    return function(x, y, v) {
      if (x < 0 || y < 0) return void 0;
      if (arguments.length === 3) {
        // set
        return a[w * x + y] = v;
      } else if (arguments.length === 2) {
        // get
        return a[w * x + y];
      } else {
        throw new TypeError("Bad number of arguments");
      }
    }
}

/**
 * returns average color of a given array of colors
 * @param {Number} x 
 * @param {Number} y 
 * @param {Number} z 
 * @param {Number} w 
 * @returns {Array}
 */
export function avgColor(x, y, z, w) {
    return [
      (x[0] + y[0] + z[0] + w[0]) / 4,
      (x[1] + y[1] + z[1] + w[1]) / 4,
      (x[2] + y[2] + z[2] + w[2]) / 4
    ];
}


export function intervalLength(startPoint, endPoint) {
    let dx = endPoint[0] - startPoint[0],
        dy = endPoint[1] - startPoint[1];

    return sqrt(dx * dx + dy * dy);
}

export function breakInterval(startPoint, endPoint, maxLength) {
    let breaks = [],
        length = intervalLength(startPoint, endPoint),
        numSplits = max(ceil(length / maxLength), 1),
        dx = (endPoint[0] - startPoint[0]) / numSplits,
        dy = (endPoint[1] - startPoint[1]) / numSplits,
        startX = startPoint[0],
        startY = startPoint[1];

    for (let i = 0; i <= numSplits; i++) {
      breaks.push([startX + dx * i, startY + dy * i]);
    }
    // console.log(breaks);
    return breaks;
}

/**
 * returns a function that will be spaced of at least wait ms between calls
 * Paramètres :
 *  - func : function to debounce
 *  - wait : minimal number of milliseconds between each call
 *  - context: execution context of the function 
 */
export function debounce(func, wait, context) {
  var result;
  var timeout = null;
  return function() {
      var ctx = context || this, args = arguments;
      var later = function() {
          timeout = null;
      };
      var callNow = !timeout;
      if (callNow){
        if (!! timeout) clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        result = func.apply(ctx, args);
      } 
      return result;
  };
}