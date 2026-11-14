import {prepareRouteScript,buildCleanRoutes} from '../../scripts/clean-routes.mjs';
import {buildExperience} from '../../scripts/build-experience.mjs';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {collectBuildAssets,restoreBuildAssets,writeBuildManifest} from './retain-build-assets.mjs';
const project=fileURLToPath(new URL('../',import.meta.url)),repo=fileURLToPath(new URL('../../',import.meta.url)),output=fileURLToPath(new URL('../../campus/',import.meta.url));
prepareRouteScript();
buildExperience();
const retained=collectBuildAssets(repo,output);
const build=spawnSync(process.execPath,[fileURLToPath(new URL('../node_modules/vite/bin/vite.js',import.meta.url)),'build'],{cwd:project,stdio:'inherit'});
if(build.error)throw build.error;if(build.status!==0)process.exit(build.status||1);
const schoolPage=fs.readFileSync(output+'servicios.escolares.html','utf8').replace(/(src|href)="(?:\.\/)?assets\//g,'$1="/campus/assets/');
fs.writeFileSync(repo+'servicios.escolares.html',schoolPage);
writeBuildManifest(output);
const restored=restoreBuildAssets(output,retained);console.log('Retained '+restored+' public asset files for open campus tabs.');

buildCleanRoutes();
