const express = require('express');
const router = express.Router();


const { readdirSync } = require('fs');
const path = require('path');



const getDirectories = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

(() => {
  try{
    const apiVersions =  process.env.APIVERSIONS;
    if(!apiVersions) throw {name: 'configError', message: 'api version env variable not found'};

    const versions = apiVersions.split(',');
    console.log(`Routes: supporting following versions: ${versions}`);

    versions.forEach((v) => {
      const apiVer = 'v' + v;
      console.log(`Routes: adding paths for the following version: ${apiVer}`);

      const directoryPath = path.join(__dirname, apiVer);
      const modules = getDirectories(directoryPath);

      modules.forEach((module) => {
        console.log(`Routes: Adding following routes for the module: ${module}`);
        const moduleRoutePath = `/${apiVer}/${module}`;
        const moduleCodePath = `.${moduleRoutePath}`;

        console.log(`Routes: mouduleRoutePath: ${moduleRoutePath}`);

        const moduelRouter = require(moduleCodePath);
        
        router.use(moduleRoutePath, moduelRouter);
      })
    });

  }
  catch(err){
    console.error(`Routes: err setting up routes:  ${err}`);
    throw err;
  }
})();

module.exports = router;