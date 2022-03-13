import {select} from 'd3';
import { getCurrentTimestamp } from "../utils.js";


function LoadingCircle(selector, size, startAt, onTerminate) {

    this.container = select(selector);
    this.vis = this.container.append("svg")
    .attr("width", size)
    .attr("height", size);
    this.size = size;
    this.startAt = startAt;
    this.changeIntervalId = null;
    this._text = null;

    this.vis.append('circle').attr('cx', size/2)
    .attr('cy', size/2)
    .attr('r',`${size/2}px`)
    .style('fill', '#6c757d')
    .style("opacity", "0")
    .transition()
    .duration(800)
    .style("opacity", "1"); 

    const delta = this.startAt - getCurrentTimestamp();
    const message = delta > 0 ? `${delta}` : '0';

    this._text = this.vis.append('text')
    .attr('x', size/2)
    .attr('y', size/2)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'central')
    .text(message)
    .style('font-size', size>=512 ? '20em' : '10em')
    .style('font-weight', 'normal')
    .style('fill', '#eee');

    this._text
    .style("opacity", "0")
    .transition()
    .duration(800)
    .style("opacity", "1");

    function load(){
      if(!this._text) return;
      const delta = this.startAt - getCurrentTimestamp();
      if(delta <= 0){
        this._text.text("0");
        if(!!this.changeIntervalId){
          clearInterval(this.changeIntervalId);
          this.changeIntervalId = null;
          this._text = null;
        }
        this.container.selectAll("*").remove();
        onTerminate();
        return;
      }
      const message = `${delta}`;
      this._text.text(message);
    }

    this.changeIntervalId = setInterval(load.bind(this), 100);
}

export default LoadingCircle;