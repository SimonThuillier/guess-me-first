// minimal image manipulation for now
import { readdirSync } from 'fs';
import {PUBLIC_URL} from './const.js';

const IMAGE_DIR = './public/images';

const imageList = [];

function retrieveImage(f){
    // console.log('image', f);
    const match = f.match(/^([^\.]+)\.[^\.]+$/);
    if(!match){return;}
    imageList.push({url: `${PUBLIC_URL}/images/${f}`, name: match[1]});
}

const shuffleArray = array => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
}

// get N distinct images randomly selected from the list
// for production purposes reload the list from disk, this allows dynamic images gestion
export function getNImages(number){
    while (imageList.length > 0) {imageList.pop();}
    readdirSync(IMAGE_DIR).forEach(retrieveImage);
    if (number >= imageList.length) {
        return shuffleArray([...imageList]);
    }
    return shuffleArray(imageList).slice(0, number);
}

// get N distinct image names randomly selected from the list including a goodOne
export function getNames(goodOne, number){
    if (number == 1) {
        return [goodOne];
    }
    const names = imageList.map(image => image.name).filter(name => name !== goodOne);
    const list = [goodOne, ...shuffleArray(names).slice(0, number - 1)];
    return shuffleArray(list);
}

/*console.log("test 1 item");
console.log(getNImages(1));
console.log("test 3 items");
console.log(getNImages(3));
console.log("test 8 items");
console.log(getNImages(8));
console.log("test 15 items");
console.log(getNImages(15));
console.log("test 15 items - 2");
console.log(getNImages(15));*/