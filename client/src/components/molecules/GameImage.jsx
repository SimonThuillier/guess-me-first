import { useEffect, useState } from "react";
import {koala} from '../../koala.js';
import {BACKEND_URL} from '../../sio-client.js';


function GameImage({url, started}) {
  
    useEffect(() => {

      console.log('execute gameimage effect', url);

      const cleanup ={func: ()=>{}};
      

      const loadImage = () => {
        console.log('on loading script');
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = function() {
        console.log(`on loading image ${url}`);
        
        const makeCircles = (img) => {
          var colorData;
          try {
            colorData = koala.loadImage(img);
          } catch (e) {
            //alert(e);
            return false;
          }
          if (!colorData) {return false;}
          console.log("koala make circles");
          const koalaCleanup = koala.makeCircles("#game-dots", colorData, () => {});
          cleanup.func = () => {
            koalaCleanup();
            this.remove();
          };
          return true;
          }
          if(!makeCircles(this)){
            setTimeout(() => {makeCircles(this)}, 1000);
          }
        }.bind(img);
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
        console.log(cleanup.func);
        cleanup.func();
      }


  }, [url]);


    return (<div id="game-dots"></div>)
}

export default GameImage