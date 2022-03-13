import { useEffect, useState } from "react";
import {koala} from '../../koala';
import {getCurrentTimestamp} from '../../utils.js';

function GameImage({url, startAt}) {
  
    useEffect(() => {

      const cleanup ={func: ()=>{}};
      
      const loadImage = () => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = function() {
        let colorData;
        try {
          colorData = koala.loadImage(img);
        } catch (e) {
          console.warn(e);
          return false;
        }
        if (!colorData) {return false;}

        function drawGame(){
          const koalaCleanup = koala.makeCircles("#game-dots", colorData);
          cleanup.func = () => {
            koalaCleanup();
            if(!!this){
              this.remove();
            }
          };
        }

        if(getCurrentTimestamp() < startAt){
          koala.makeLoadingCircle("#game-dots", startAt, drawGame.bind(this));
          return;
        }
        else{
          drawGame();
        }
        }.bind(img);
        img.src = url;
      }

      loadImage();

      return () => {
        cleanup.func();
        cleanup.func = ()=>{};
      }
  }, [url]);

    return (<div id="game-dots"></div>)
}

export default GameImage