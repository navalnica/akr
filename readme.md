## Fight OCD in your browser!

Fight Obsessive–compulsive disorder through solving simple problems and gaining trust and confidence for yourself.

* The project is in development - new features are to be added in future

## How to build
* The project was built from the Vite+Svelte template
    * To reproduce run: `npm init vite` and select `Svelte` template
    * There is no need in reproducing, you can use the code from this repo to get started
* Install dependencies: `npm install`.<br>
  This will create `node_modules` folder and `package-lock.json`
* To run dev server: `npm run dev`
    * If you run development in docker container, you need to expose port to your host by `npm run dev -- --host`
    * To specify port: `npm run dev -- --port 1234`
* To build static website: `npm run build`. Artifacts will be stored to `dist` folder
* To preview built static website: `npm run preview`
    * Similar to above, you can expose host or change port with: `npm run preview -- <options>`
