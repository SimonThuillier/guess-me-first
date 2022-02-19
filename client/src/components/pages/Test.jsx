import { useEffect } from "react";
import {Row, Col} from "react-bootstrap";

import {koala} from '../../koala.js';
import {BACKEND_URL} from '../../sio-client.js';

import Layout from '../Layout';

function Test(props) {

    useEffect(() => {
        var script = document.createElement('script');
        const scriptUrl = `${BACKEND_URL}/d3.min.js`
        script.src = scriptUrl;
        document.head.appendChild(script);
        script.onload = function() {
            console.log('on loading script');
            var img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = function() {
            console.log('on loading image');
            var colorData;
            try {
                colorData = koala.loadImage(this);
            } catch (e) {
                colorData = null;
                alert(e);
            }
            // console.log(colorData);
            if (colorData) {
                koala.makeCircles("#dots", colorData, () => {});
            }
            };
            const imgUrl = `${BACKEND_URL}/astley.jpg`
            console.log(imgUrl);
            img.src = imgUrl;
        }


        function onEvent(what, value) {

            if (what === 'LayerClear' && value == 0) {
              d3.select('#next')
                .style('display', null)
                .select('input')
                  .on('keydown', function() {
                    d3.select('div.err').remove();
                    if (d3.event.keyCode !== 13) return;
                    var input = d3.select(this).property('value');

                    if (input.match(/^http:\/\/.+\..+/i)) {
                      track('Submit', input);
                      d3.select('#next div.msg').text('Thinking...');
                      d3.select(this).style('display', 'none');
                      setTimeout(function() {
                        goToHidden(location, input);
                      }, 750);
                    } else {
                      d3.select('#next').selectAll('div.err').data([0])
                        .enter().append('div')
                        .attr('class', "err")
                        .text("That doesn't appear to be a valid image URL. [Hint: it should start with 'http://']")
                    }
                  });
            }
        }

        

      });



    return (
        <Layout vcenter>
            <Row>
            <Col md={12}>
                <div id="center">
                    <div id="cont">
                        <div id="dots"></div>
                    </div>
                </div>
            </Col>
        </Row>
        </Layout>
    )
}

export default Test