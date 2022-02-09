import { Manager } from "socket.io-client"

// console.log(import.meta.env);
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
const CUSTOM_HEADER_KEY = import.meta.env.VITE_CUSTOM_HEADER_KEY || 'my-custom-header';


// socket-io client is defined using the singleton pattern
// with an Immediately Invoked Function Expression (IIFE)
// this singletonObject must be called for retrieving a new or existing socket.io-client using its namespace
// ex : sioSingleton.getSocket('/game')
export let sioSingleton = (() => {
    // private value of the singleton initialized only once
    let manager;
    const sockets = {};
 
    // see https://socket.io/get-started/chat for basic configuration
    // see https://socket.io/docs/v4/client-api/ for advanced client configuration
    // see https://socket.io/docs/v3/handling-cors/ for dealing with CORS (remember its purpose isn't to bother you but to make the web safer :))
    // here "pseudo authentication" with a custom header key is used
    const initializeManager = () => {
        manager = new Manager(BACKEND_URL, {
            withCredentials: true,
            extraHeaders: {
              [CUSTOM_HEADER_KEY]: "abcd"
            }
          });
        manager.reconnection = true;
    }
 
    // We export the centralized method to return
    // the singleton's value
    return {
        getSocket: (nsp) => {
            // initialize the singleton only once
            if (manager === undefined) {
                initializeManager();
                manager.open((err) => {
                    if (err) {
                      console.warn(`Sio failed to connect to ${BACKEND_URL} : ${err.message}`);
                    } else {
                        console.warn(`Sio successfuly connected to ${BACKEND_URL}`);
                    }
                  });
                // create a socket for the default namespace - useless, sio already does it
                sockets["/"] = manager.socket("/");  
            }

            if(!sockets[nsp]){
                sockets[nsp] = manager.socket(nsp);
                //sockets[nsp].connect();
            }
            return sockets[nsp];
        }
    };
})();