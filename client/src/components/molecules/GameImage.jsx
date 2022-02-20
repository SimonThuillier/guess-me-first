import { useEffect } from "react";
import {koala} from '../../koala.js';
import {BACKEND_URL} from '../../sio-client.js';


function GameImage({url, started}) {
  
    useEffect(() => {

      console.log('execute gameimage effect', url);

      const loadImage = () => {
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
            koala.makeCircles("#game-dots", colorData, () => {});
        }
        };
        img.src = url;
      }

      if(!!document.d3){
        loadImage();
      }
      else {
        const script = document.createElement('script');
        const scriptUrl = `${BACKEND_URL}/d3.min.js`
        script.src = scriptUrl;
        script.onload = loadImage;
        document.head.appendChild(script);
      }

      return () => {
        console.log('execute gameimage cleanup', url);
      }


  }, [url]);


    return (<div id="game-dots"></div>)
}

export default GameImage