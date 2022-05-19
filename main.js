import './style.css'


import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Water } from 'three/examples/jsm/objects/Water.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

let camera, scene, renderer;
let controls, water, sun;

const loader = new GLTFLoader();

function random(min, max) {
  return Math.random() * (max - min) + min;
}

let cameraFlag = 0
let treasureAmount = 0
let chestLeft = 0
let timeSpend = 0
let CANON_COUNT = 20
let kills = 0
let BoatDamage = 0

var myfunc = setInterval(function () {
  timeSpend += 1
}, 1000)

var Health = 5
var HealthStr = "❤️❤️❤️❤️❤️"
function HealthCounter() {
  switch (Health) {
    case 0:
      HealthStr = " ";
      break;
    case 1:
      HealthStr = "❤️";
      break;
    case 2:
      HealthStr = "❤️❤️";
      break;
    case 3:
      HealthStr = "❤️❤️❤️";
      break;
    case 4:
      HealthStr = "❤️❤️❤️❤️";
      break;
    case 5:
      HealthStr = "❤️❤️❤️❤️❤️";
      break;
  }
}
//-------------------------------
function Display() {
  document.getElementById("score").innerHTML = "Score: " + cameraFlag
  document.getElementById("treasure").innerHTML = "Treasure: " + treasureAmount
  document.getElementById("chest").innerHTML = "Treasure Chest Left: " + chestLeft
  document.getElementById("health").innerHTML = "Health: " + HealthStr
  document.getElementById("canon").innerHTML = "🔥: " + CANON_COUNT
  document.getElementById("kills").innerHTML = "Kills: " + kills
  document.getElementById("time").innerHTML = "Time: " + timeSpend
  document.getElementById("message").innerHTML = "Message: "
}

document.getElementById("buy").onclick = function () { BuyHealth() }
function BuyHealth() {
  if (Health < 5 && treasureAmount >= 2000) {
    treasureAmount -= 2000;
    Health += 1
  }
}

document.getElementById("buyCanon").onclick = function () { BuyCanon() }
function BuyCanon() {
  if (treasureAmount >= 200) {
    treasureAmount -= 200;
    CANON_COUNT += 1
  }
}

//------------------------------------------------------------------------------------------------------------------------------------
class Boat {
  constructor() {
    loader.load("textures/boat/scene.gltf", (gltf) => {
      scene.add(gltf.scene)
      gltf.scene.scale.set(15, 15, 15)
      gltf.scene.position.set(5, -4, 50)

      this.boat = gltf.scene
      this.speed = {
        vel: 0,
        rot: 0
      }
    })
  }

  stop() {
    this.speed.vel = 0
    this.speed.rot = 0
  }

  update() {
    if (this.boat) {
      this.boat.rotation.y += this.speed.rot
      this.boat.translateZ(this.speed.vel)
    }
  }
}

const boat = new Boat()

//pirate boat-------------------------------------------------------------------------------------------------------------------------

class Pirates {
  constructor(_scene) {
    scene.add(_scene)
    _scene.scale.set(0.05, 0.05, 0.05)
    _scene.position.set(random(-500, 500), 10, random(-2000, -500))
    // _scene.position.set(5, 10, -50)

    this.pirate = _scene
    this.speed = {
      vel: -3,
      rot: 0
    }
  }

  update(rotAngle) {
    if (this.pirate) {
      this.pirate.translateZ(this.speed.vel)
      this.pirate.rotation.y = -1 * rotAngle
    }
  }
}

async function loadPirate(url) {
  return new Promise((resolve, reject) => {
    loader.load(url, (gltf) => {
      resolve(gltf.scene)
    })
  })
}

let pirateModel = null
async function createPirate() {
  if (!pirateModel) {
    pirateModel = await loadPirate("textures/pirates/scene.gltf")
  }
  return new Pirates(pirateModel.clone())
}

let pirates = []
let Damage = []
const PIRATE_COUNT = 3


//Treasures--------------------------------------------------------------------------------------------------------------------------

class Treasures {
  constructor(_scene) {
    scene.add(_scene)
    _scene.scale.set(0.5, 0.5, 0.5)
    _scene.position.set(random(-1000, 1000), -1.5, random(-2000, 50))

    this.treasure = _scene
    this.treasureCollected = 0
  }
}

async function loadModel(url) {
  return new Promise((resolve, reject) => {
    loader.load(url, (gltf) => {
      resolve(gltf.scene)
    })
  })
}

let boatModel = null
async function createTreasure() {
  if (!boatModel) {
    boatModel = await loadModel("textures/chest/scene.gltf")
  }
  return new Treasures(boatModel.clone())
}

let treasures = []
const TREASURE_COUNT = 200
chestLeft = TREASURE_COUNT

//Canon balls-----------------------------------------------------------------------------------------------------------------------
let fireFlag = 0
class Canon {
  constructor(_scene) {
    scene.add(_scene)
    _scene.scale.set(0.2, 0.2, 0.2)
    _scene.position.set(boat.boat.position.x, -3, boat.boat.position.z)

    this.canon = _scene
    this.speed = 20
    this.elev = (Math.PI * (45 / 180))
    this.speed_x = (this.speed) * Math.cos(this.elev)
    this.speed_y = (this.speed) * Math.sin(this.elev)
  }

  update() {
    if (this.canon) {
      

      // this.speed_y = (this.speed) * Math.sin((Math.PI * (this.elev / 180)))
      this.canon.translateZ(-this.speed_x)
      this.canon.translateY(this.speed_y)
    }
  }

  reset() {
    if (this.canon) {
      this.canon.position.set(boat.boat.position.x, -3, boat.boat.position.z)
      this.speed_y = (this.speed) * Math.sin(this.elev)
      this.canon.scale.set(0.2, 0.2, 0.2)
    }
  }
}

let canonModel = null
async function createCanon() {
  if (!canonModel) {
    canonModel = await loadModel("textures/canon/scene.gltf")
  }
  return new Canon(canonModel.clone())
}

let canons = []
let CANON_CNT = 1

function fireCanon() {
  if (fireFlag == 1) {
    canons.forEach(canon => {
      if (canon.canon) {
        canon.speed_y -= 1
        canon.update()
        if(canon.canon.position.y < 2.5){
          canon.canon.scale.set(0.5,0.5,0.5)
        }
      }
    })
  }
  if (canons[0].canon.position.y < 0) {
    canons[0].reset()
    fireFlag = 0
  }
}

//--------------------------------------------------------------------------------------------------------------------------------

class PirateCanon {
  constructor(_scene) {
    scene.add(_scene)
    _scene.scale.set(0.1, 0.1, 0.1)
    _scene.position.set(pirates[0].pirate.position.x, 0, pirates[0].pirate.position.z)

    this.pcanon = _scene
    this.speed = 15
    this.elev = (Math.PI * (45 / 180))
    this.speed_x = (this.speed) * Math.cos(this.elev)
    this.speed_y = (this.speed) * Math.sin(this.elev)
  }

  update() {
    if (this.pcanon) {
      this.pcanon.translateZ(-this.speed_x)
      this.pcanon.translateY(this.speed_y)
    }
  }

  reset() {
    if (this.pcanon) {
      // this.canon.position.set(pirates[0].pirate.position.x, 0, pirates[0].pirate.position.z)
      this.speed_y = (this.speed) * Math.sin(this.elev)
    }
  }
}

let pcanonModel = null
async function createpCanon() {
  if (!pcanonModel) {
    pcanonModel = await loadModel("textures/canon/scene.gltf")
  }
  return new PirateCanon(pcanonModel.clone())
}

let pcanons = []
let k =-1
function firepCanon() {
    pcanons.forEach(pcanon => {
      k+=1
      if (pcanon.pcanon) {
        pcanon.pcanon.rotation.y = pirates[k].pirate.rotation.y
        pcanon.speed_y -= 1
        pcanon.update()
      }
      if (pcanon.pcanon.position.y < 0) {
        pcanon.pcanon.position.set(pirates[k].pirate.position.x,0,pirates[k].pirate.position.z)
        pcanon.reset()
      }
    })
    k = -1
}

//---------------------------------------------------------------------------------------------------------------------------------

// window.addEventListener('keypress',function (e){
//   if(e.key.toLowerCase() === "s"){
//     document.getElementById("start").innerHTML = ""
//     init();
//     animate();
//   }else{
//     document.getElementById("start").innerHTML = "Press S to start game"
//   }
// })

init();
animate();

async function init() {
  timeSpend = 0
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
  camera.position.set(30, 30, 100);

  sun = new THREE.Vector3();

  // Water

  const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

  water = new Water(
    waterGeometry,
    {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load('textures/waternormals.jpeg', function (texture) {

        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

      }),
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: scene.fog !== undefined
    }
  );

  water.rotation.x = - Math.PI / 2;

  scene.add(water);

  // Skybox

  const sky = new Sky();
  sky.scale.setScalar(10000);
  scene.add(sky);

  const skyUniforms = sky.material.uniforms;

  skyUniforms['turbidity'].value = 10;
  skyUniforms['rayleigh'].value = 2;
  skyUniforms['mieCoefficient'].value = 0.005;
  skyUniforms['mieDirectionalG'].value = 0.8;

  const parameters = {
    elevation: 2,
    azimuth: 180
  };

  const pmremGenerator = new THREE.PMREMGenerator(renderer);

  function updateSun() {

    const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
    const theta = THREE.MathUtils.degToRad(parameters.azimuth);

    sun.setFromSphericalCoords(1, phi, theta);

    sky.material.uniforms['sunPosition'].value.copy(sun);
    water.material.uniforms['sunDirection'].value.copy(sun).normalize();

    scene.environment = pmremGenerator.fromScene(sky).texture;

  }

  updateSun();

  controls = new OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = Math.PI * 0.495;
  controls.target.set(0, 10, 0);
  controls.minDistance = 40.0;
  controls.maxDistance = 200.0;
  // controls.update();

  const waterUniforms = water.material.uniforms;

  for (let i = 0; i < TREASURE_COUNT; i++) {
    const treasure = await createTreasure()
    treasures.push(treasure)
  }

  for (let i = 0; i < PIRATE_COUNT; i++) {
    const pirate = await createPirate()
    pirates.push(pirate)
  }

  for (let i = 0; i < CANON_CNT; i++) {
    const canon = await createCanon()
    canons.push(canon)
  }

  for (let i = 0; i < PIRATE_COUNT; i++) {
    const pcanon = await createpCanon()
    pcanons.push(pcanon)
    Damage.push(0)
  }

  window.addEventListener('resize', onWindowResize);

  window.addEventListener('keydown', function (e) {
    if (e.key == "ArrowUp") {
      boat.speed.vel = -5
    }
    if (e.key == "ArrowDown") {
      boat.speed.vel = +5
    }
    if (e.key == "ArrowRight") {
      boat.speed.rot = -0.1
    }
    if (e.key == "ArrowLeft") {
      boat.speed.rot = 0.1
    }
  })
  window.addEventListener('keyup', function (e) {
    boat.stop()
  })

  window.addEventListener('keypress', function (e) {
    if (e.key.toLowerCase() === "c") {
      if (cameraFlag == 0) {
        cameraFlag = 1
      } else {
        cameraFlag = 0
      }
    }
    if (e.key.toLowerCase() === "m") {
      cameraFlag = 2
      controls.update()
    }
    if (e.key.toLowerCase() === " ") {
      if(CANON_COUNT > 0){
        fireFlag = 1
        CANON_COUNT -= 1
      }
    }
    if (e.key.toLowerCase() === "d") {
      Health -= 1
    }
  })
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}

function isColliding(obj1, obj2) {
  let dist = 15
  return (
    Math.abs(obj1.position.x - obj2.position.x) < dist &&
    Math.abs(obj1.position.z - obj2.position.z) < dist
  )
}

function isCanonColliding(obj1, obj2) {
  let dist = 50
  return (
    Math.abs(obj1.position.x - obj2.position.x) < dist &&
    Math.abs(obj1.position.z - obj2.position.z) < dist
  )
}

function checkCollisions() {
  if (boat.boat) {
    for (let i = 0; i < TREASURE_COUNT; i++) {
      if (treasures[i].treasure) {
        if (isColliding(boat.boat, treasures[i].treasure)) {
          if (treasures[i].treasureCollected == 0) {
            treasureAmount += 100
            chestLeft -= 1
          }
          scene.remove(treasures[i].treasure)
          treasures[i].treasureCollected = 1
        }
      }
    }
  }
}



function canonCollision() {
  let j = -1
  pirates.forEach(pirate => {
    j+=1
    if (pirate.pirate) {
      if(isCanonColliding(pirate.pirate,canons[0].canon)){
        if(Damage[j] == 30){
          scene.remove(pirate.pirate)
          scene.remove(pcanons[j].pcanon)
          kills += 1
        }else{
          Damage[j] += 1
        }
      }
    }
  })
}

function pirateShooting(){
  let j = -1
  pcanons.forEach(pcanon => {
    j+=1
    if(pcanon.pcanon){
      if(isCanonColliding(pcanon.pcanon,boat.boat)){
        if(BoatDamage == 200){
          Health = 0
          scene.remove(boat.boat)
        }else{
          BoatDamage += 1
          if(BoatDamage%40 == 0 && BoatDamage > 0){
            Health -= 1
          }
        }
      }
    }
  })
}

function updatePiratePosition() {
  if (boat.boat) {
    pirates.forEach(pirate => {
      if (pirate.pirate) {
        if ((Math.pow((boat.boat.position.x - pirate.pirate.position.x), 2) + Math.pow((boat.boat.position.z - pirate.pirate.position.z), 2)) > 80000) {
          pirate.update(Math.atan2(
            boat.boat.position.x - pirate.pirate.position.x,
            -(boat.boat.position.z - pirate.pirate.position.z),
          ))
        }
      }
    })
  }
}

function updateCamera() {
  if (cameraFlag == 1) {
    if (boat.boat) {
      camera.position.set(boat.boat.position.x + 30, 30, boat.boat.position.z + 100);
    }
  }
  else if (cameraFlag == 0) {
    camera.position.set(0, 50, 200)
  }
}

function animate() {
  if (Health) {
    requestAnimationFrame(animate);
    render();
    boat.update()
    updatePiratePosition()
    checkCollisions()
    updateCamera()
    Display()
    HealthCounter()
    fireCanon()
    firepCanon()
    canonCollision()
    pirateShooting()
    console.log(BoatDamage,Damage[0],Damage[1],Damage[2])
    if(canons[0].canon.position.y == -3){
      canons[0].canon.rotation.y = boat.boat.rotation.y
      canons[0].canon.position.x = boat.boat.position.x
      canons[0].canon.position.z = boat.boat.position.z
    }
  } else {
    document.getElementById("health").innerHTML = "Health: 0"
    document.getElementById("message").innerHTML = "Message: Game Over"
  }
}

function render() {
  water.material.uniforms['time'].value += 1.0 / 60.0;

  renderer.render(scene, camera);

}