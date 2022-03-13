import {select, pointer, pointers} from 'd3';

import {getDims, array2d, avgColor, breakInterval, debounce} from './utils';
import LoadingCircle from './loadingCircle';
import Circle from './circle';

const {floor} = Math;


/*
* Thank you Vadim Ogievetsky from Simon Thuillier
* I'll do what I can to pursue your labor of love with these koalas
*
* This package is a rewriting and update to recent Mike Bostock's D3 version of the koala script
* Made with love by Vadim Ogievetsky for Annie Albagli (Valentine's Day 2011)
* You can find links to the original script here:
* For me on GitHub:  https://github.com/vogievetsky/KoalasToTheMax
* License: MIT  [ http://koalastothemax.com/LICENSE ]
*
*/

export const koala = {
    version: '2.0.0'
};

(function() {

    koala.supportsCanvas = function() {
      var elem = document.createElement('canvas');
      return !!(elem.getContext && elem.getContext('2d'));
    };
    koala.supportsSVG = function() {
      return !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', "svg").createSVGRect;
    };
    koala.clear = function(){
        if(!koala.current) return;
    }
  
    // vis is the DOM element to append the svg to
    let vis;
  
    koala.loadImage = function(imageData) {
  
      const {maxSize, minSize, dim} = getDims();
      // Create a canvas for image data resizing and extraction
      var canvas = document.createElement('canvas').getContext('2d');
      // Draw the image into the corner, resizing it to dim x dim
      canvas.drawImage(imageData, 0, 0, dim, dim);
      // Extract the pixel data from the same area of canvas
      // Note: This call will throw a security exception if imageData
      // was loaded from a different domain than the script.
      return canvas.getImageData(0, 0, dim, dim).data;
    };
  
    koala.makeLoadingCircle = function(selector, startAt, onTerminate= () => {}) {
      const {maxSize, minSize, dim} = getDims();
      select(selector).selectAll("*").remove();
      const loadingCircle = new LoadingCircle(selector, maxSize, startAt, onTerminate);      
    }
  
    koala.makeCircles = function(selector, colorData) {
  
      let {maxSize, minSize, dim} = getDims();

      // Make sure that the SVG exists and is empty
      if (!vis) {
        //console.log("not vis");
        // Create the SVG ellement
        vis = select(selector)
            .append("svg")
            .attr("width", maxSize)
            .attr("height", maxSize);
      } else {
        //console.log("vis");
        vis.selectAll('circle')
          .remove();
      }
  
      // build the data tree
      let finestLayer = array2d(dim, dim);
      // console.log(finestLayer);
      let size = minSize;
      
      // Start off by populating the base (leaf) layer
      let xi, yi, t = 0, color;
      for (yi = 0; yi < dim; yi++) {
        for (xi = 0; xi < dim; xi++) {
          color = [colorData[t], colorData[t+1], colorData[t+2]];
          finestLayer(xi, yi, new Circle(vis, xi, yi, size, color));
          t += 4;
        }
      }
  
      // Build up successive nodes by grouping
      let layer, prevLayer = finestLayer;
      let c1, c2, c3, c4, currentLayer = 0;
      while (size < maxSize) {
        dim /= 2;
        size = size * 2;
        layer = array2d(dim, dim);
        for (yi = 0; yi < dim; yi++) {
          for (xi = 0; xi < dim; xi++) {
            c1 = prevLayer(2 * xi    , 2 * yi    );
            c2 = prevLayer(2 * xi + 1, 2 * yi    );
            c3 = prevLayer(2 * xi    , 2 * yi + 1);
            c4 = prevLayer(2 * xi + 1, 2 * yi + 1);
            color = avgColor(c1.color, c2.color, c3.color, c4.color);
            c1.parent = c2.parent = c3.parent = c4.parent = layer(xi, yi,
              new Circle(vis, xi, yi, size, color, [c1, c2, c3, c4], currentLayer)
            );
          }
        }
        currentLayer++;
        prevLayer = layer;
      }
  
      // Create the initial circle
      Circle.addToVis(vis, [layer(0, 0)], true);
  
      // Interaction helper functions
      function splitableCircleAt(pos) {
        let xi = floor(pos[0] / minSize),
            yi = floor(pos[1] / minSize),
            circle = finestLayer(xi, yi);
        if (!circle) return null;
        while (circle && !circle.isSplitable()) circle = circle.parent;
        return circle || null;
      }

      const splitIds = new Set();
  
      function find(startPoint, endPoint) {
        let breaks = breakInterval(startPoint, endPoint, minSize/2);
        const ids = new Set();
        const circles = [];
  
        for (let i = 0; i < breaks.length - 1; i++) {
          let sp = breaks[i],
              ep = breaks[i+1];
  
          let circle = splitableCircleAt(ep);
          if (circle && !ids.has(circle.id) && !splitIds.has(circle.id)) {
            ids.add(circle.id);  
            if(circle.isSplitable() && (circle.size <= (maxSize * 2) || circle.checkIntersection(sp, ep))){
                splitIds.add(circle.id);
                circles.push(circle);
            }
          }
        }
        return circles;
      }
  
      // Handle mouse events
      let prevMousePosition = null;
      function onMouseMove(event) { 
        let mousePosition = pointer(event, vis.node());
        event.preventDefault();
        event.stopPropagation();
        // Do nothing if the mouse point is not valid
        if (isNaN(mousePosition[0])) {
          prevMousePosition = null;
          return;
        }
  
        if (prevMousePosition) {
          const circles = find(prevMousePosition, mousePosition);
          if(circles.length > 0){
            // let's try to do the split asynchronously not to block next mouseMove event
            setTimeout(() => {circles.forEach((_circle) => {_circle.split();}) }, 0);
          }
        }
        prevMousePosition = mousePosition;
      }
  
      // Handle touch events
      let prevTouchPositions = {};
      function onTouchMove(event) {
        let touchPositions = pointers(event, vis.node());
        event.preventDefault();
        event.stopPropagation();
        for (let touchIndex = 0; touchIndex < touchPositions.length; touchIndex++) {
          let touchPosition = touchPositions[touchIndex];
          if (isNaN(touchPosition[0])) {
              continue;
          }
          let prevTouchPosition = prevTouchPositions[touchPosition.identifier]
          if (prevTouchPosition) {
            const circles = find(prevTouchPosition, touchPosition);
            if(circles.length > 0){
                // let's try to do the split asynchronously not to block next mouseMove event
                setTimeout(() => {circles.forEach((_circle) => {_circle.split();}) }, 0);
            }
          }
          prevTouchPositions[touchPosition.identifier] = touchPosition;
        }
        
      }
  
      function onTouchEnd(event) {
        var touches = event.changedTouches;
        for (var touchIndex = 0; touchIndex < touches.length; touchIndex++) {
          var touch = touches.item(touchIndex);
          prevTouchPositions[touch.identifier] = null;
        }
        event.preventDefault();
        event.stopPropagation();
      }
  
      // Initialize interaction
      select("#game-panel-container")
        .on('mousemove.koala', debounce(onMouseMove, 40))
        .on('touchmove.koala', debounce(onTouchMove, 40))
        .on('touchend.koala', onTouchEnd)
        .on('touchcancel.koala', onTouchEnd);
  
        return function cleanup(){
          select("#game-panel-container")
            .on('mousemove.koala', null)
            .on('touchmove.koala', null)
            .on('touchend.koala', null)
            .on('touchcancel.koala', null);
      
            select(selector).selectAll("*").remove();
            vis = null;
        }
    };
})();