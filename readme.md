## Fight OCD in your browser!

By solving simple problems you gain trust and confidence in yourself - this should help fighting [Obsessive–compulsive disorder](https://en.wikipedia.org/wiki/Obsessive%E2%80%93compulsive_disorder). 

The main idea is to check how well you remember sequences of numbers and letters - a common task in everyday life, e.g. when filling in documents. OCD makes me recheck phone/passport numbers ridiculous number of times, because of constant doubts. Hope this app will help not only me but also you if you experience something similar 😃

You can try it yourself here: [navalnica.github.io/akr](https://navalnica.github.io/akr/)


## Features to add
The project is in development. You are welcome to help to implement following features!

* Switching between several modes:
  * Phone numbers
  * IBAN
  * passport number
  * random integers. length and digits separator is to be specified by input fields
* translate into Belarusian

## How to build
* The project was built from the Vite+Svelte template
    * To reproduce run: `npm init vite` and select `Svelte` template
    * There is no need in reproducing, you can use the code from this repo to get started
* Install dependencies: `npm install`.<br>
  This will create `node_modules` folder and `package-lock.json`
* To run dev server: `npm run dev`
    * If you run development in docker container,<br>
      you need to expose port to your host by `npm run dev -- --host`
    * To specify port: `npm run dev -- --port 1234`
* To build static website: `npm run build`. Artifacts will be stored to `dist` folder
    * To change output dir: `npm run build -- --outDir <dirname>`
* To preview built static website: `npm run preview`
    * Similar to above, you can specify outDir, change port or expose host:<br>
      `npm run preview -- --outDir docs --port 4000 --host`
