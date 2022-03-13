import {select} from 'd3';
import {rgb as d3rgb} from 'd3-color';

function Circle(vis, xi, yi, size, color, children, layer) {
    this.id = `${size}-${xi}-${yi}`;
    this.vis = vis;
    this.x = size * (xi + 0.5);
    this.y = size * (yi + 0.5);
    this.size = size;
    this.color = color;
    this.rgb = d3rgb(color[0], color[1], color[2]);
    this.children = children;
    this.layer = layer;
}

Circle.prototype.isSplitable = function() {
    return this.node && this.children && this.appearedAt && (Date.now() - this.appearedAt) > 300
}

Circle.prototype.split = function() {
    if (!this.isSplitable()) return;
    
    setTimeout(() => {
        select(this.node).remove();
        delete this.node;
        Circle.addToVis(this.vis, this.children)}, 
        0);
}

Circle.prototype.checkIntersection = function(startPoint, endPoint) {
    let edx = this.x - endPoint[0],
        edy = this.y - endPoint[1],
        sdx = this.x - startPoint[0],
        sdy = this.y - startPoint[1],
        r2  = this.size / 2;

    r2 = r2 * r2; // Radius squared

    // End point is inside the circle and start point is outside
    return edx * edx + edy * edy <= r2 && sdx * sdx + sdy * sdy > r2;
}

Circle.addToVis = function(vis, circles, init) {

    let circle = vis.selectAll('.nope').data(circles)
      .enter().append('circle');

    circle = circle
      .attr('cx',   function(d) { return d.x; })
      .attr('cy',   function(d) { return d.y; })  

    if (init) {
      // Setup the initial state of the initial circle
      circle = circle
        .attr('r', 4)
        .attr('fill', '#ffffff')
        .transition()
        .duration(1000)
        .attr('r',    function(d) { return d.size / 2; })
        .attr('fill', function(d) { return String(d.rgb); })
        .attr('fill-opacity', 1)
        .each(function(d) { 
            d.node = this; 
            d.appearedAt = Date.now() - 1000;
          });
    } else {
      // Setup the initial state of the opened circles
      circle = circle
        .attr('r',    function(d) { return d.parent.size / 2; })
        .attr('fill', function(d) { return String(d.parent.rgb); })
        .attr('fill-opacity', 0.68)
        .transition()
        .duration(200)
        .attr('r',    function(d) { return d.size / 2; })
        .attr('fill', function(d) { return String(d.rgb); })
        .attr('fill-opacity', 1)
        .each(function(d) { 
            d.node = this; 
            d.appearedAt = Date.now();
          });
    }  
}

export default Circle;