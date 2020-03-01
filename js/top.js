// Move your mouse around :)
// The smoke is a modification of: https://codepen.io/teolitto/pen/KwOVvL
// Attractor inspired by Mike Bostock's work (de Jong Attractor II)
// I2Djs framework for 2d webgl & attractor: github.com/I2Djs/I2Djs, thanks Narayana Swamy

let camera, scene, renderer, gltfModel, globe;
let webglRenderer;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

let mouseX, mouseY, targetX, targetY = 0;

let isMouseMoved = false;
let deformTL = null;
let isIntroAnimFinished = false;

const container3D = document.querySelector( '.container_3d' );

let gltfURL = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/911157/eyeHalloween.gltf';
let smokeURL = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/911157/smoke-texture-min.png';

init();
animate();

function init() {

  const sceneContainer = document.querySelector( '.container_3d' );

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize( window.innerWidth, window.innerHeight );

  clock = new THREE.Clock();

  scene = new THREE.Scene();

  createCamera();
  createLight();
  createSmoke();
  createMeshes();
  loadGLTFModel( gltfURL );

  sceneContainer.appendChild( renderer.domElement );

}

function createCamera() {

  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
  camera.position.set( 0, 100, 1100 );
  scene.add( camera );

}

function createLight() {

  const light = new THREE.DirectionalLight( 0xffffff, 0.85 );
  light.position.set( -1, 0, 1 );

  const mainLight = new THREE.DirectionalLight( 0x8A0A8A, 1.0 );
  mainLight.position.set( -1, 40, 7 );

  scene.add( light, mainLight );

}

function createSmoke() {

  const smokeTexture = new THREE.TextureLoader().load( smokeURL );
  const smokeMaterial = new THREE.MeshLambertMaterial({ color: 0xe70ce7, map: smokeTexture, transparent: true });
  const smokeGeo = new THREE.PlaneGeometry( 300, 300 );
  smokeParticles = [];

  let numParticles = 200;

  for ( let p = 0; p < numParticles; p++ ) {

    let particle = new THREE.Mesh( smokeGeo, smokeMaterial );

    particle.position.set(  Math.random() * windowHalfX - windowHalfX / 2,
                            Math.random() * 150 - 250,
                            Math.random() * 900 - 100 );

    particle.rotation.z = Math.random() * 360;

    scene.add( particle );
    smokeParticles.push( particle );

  }

}

function createMeshes() {

  let zPos = 400;

  const torusGeom = new THREE.TorusGeometry( 300, 22, 16, 100, Math.PI / 0.85 );
  const material = new THREE.MeshLambertMaterial( { color: 0x5a009c, opacity: 0.0, transparent: true } );
  const torus = new THREE.Mesh( torusGeom, material );
  torus.rotation.set( 0, 0, Math.PI / 1.525 );
  torus.position.set( 0, 320, zPos );

  const cylinderGeom = new THREE.CylinderGeometry( 18, 18, 600, 32 );
  const cylinder = new THREE.Mesh( cylinderGeom, material );
  cylinder.position.set( 0, 320, zPos );
  cylinder.rotation.set( 0, 0, Math.PI / 4  );

  const cylinderSmallGeom = new THREE.CylinderGeometry( 22, 22, 80, 32 );
  const cylinderSmall = new THREE.Mesh( cylinderSmallGeom, material );
  cylinderSmall.position.set( 0, -30, zPos );

  const cylinderFlatGeom = new THREE.CylinderGeometry( 130, 130, 20, 32 );
  const cylinderFlat = new THREE.Mesh( cylinderFlatGeom, material );
  cylinderFlat.position.set( 0, -70, zPos );

  globe = new THREE.Group();
  globe.add( torus, cylinder, cylinderSmall, cylinderFlat );
  globe.scale.set( 0.85, 0.85, 0.85 );
  // globe.position.y = 75;
  globe.position.y = -500;
  scene.add( globe );

}

function loadGLTFModel( url ) {

  let loader = new THREE.GLTFLoader();

  loader.load(

      url,

      // callback function after model is loaded
      function ( gltf ) {

          gltf.scene.traverse( function ( child ) {
                if ( child.isMesh ) {
                    child.geometry.center();
                }
          });

          gltfModel = gltf.scene;
          gltfModel.scale.set( 190, 190, 190 );
          gltfModel.rotation.x = Math.PI / 1.05;
          gltfModel.rotation.y = Math.PI / 1.8;
          gltfModel.position.z = 200;
          gltfModel.position.y = 300;

          scene.add( gltfModel );

          // animate model after it is loaded
          createAnimation();
          deformationTimeline();

      },

      function ( xhr ) {

          console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

      },

      function ( error ) {

          console.log( 'An error happened' );

      });

}

function animate() {

    delta = clock.getDelta();
    requestAnimationFrame( animate );
    evolveSmoke();

    if ( gltfModel ) {

      if ( isMouseMoved ) {

        gltfModel.rotation.x = Math.PI / 2;
        gltfModel.rotation.y = Math.PI / 4;
        gltfModel.rotation.z = mouseX * 0.14;

      }

    }

    render();

}

function evolveSmoke() {

  let sp = smokeParticles.length;

  while( sp-- ) {

    smokeParticles[sp].rotation.z += (delta * 0.2);

  }

}

function render() {

  renderer.render( scene, camera );

}

function createAnimation() {

  let introTL = gsap.timeline({

    onComplete: function() {
      isIntroAnimFinished = true;
      textAnimation();
    }

  });

  introTL
    .add("globestart")
    .to(gltfModel.position, { duration: 1.25, z: 400, ease: "power2.Out" }, "globestart")
    .to(gltfModel.position, { duration: 3, y: 0, ease: "elastic" }, "globestart+=0.5")
    .to(globe.position, { duration: 1.75, y: -290, ease: "elastic" }, "globestart+=1.5")
    .to(globe.children[0].material, { duration: 0.5, opacity: 1, ease: "linear" }, "globestart+=1")

    .add("up")
    .to(globe.position, { duration: 3.5, y: 0, ease: "elastic" }, "up")
    .to(gltfModel.position, { duration: 3.5, y: 250, ease: "elastic" }, "up")
    .to(gltfModel.scale, { duration: 1.25, x: 50, ease: "elastic(1, 0.5)" }, "up+=2.5")
    .to(gltfModel.scale, { duration: 1.25, x: 190, ease: "elastic(1, 0.5)" })
  ;

  introTL.timeScale( 1.35 );
  return introTL;

}

function textAnimation() {

  let split = new SplitText("#split", { type: "chars" });
  let splitGroup = document.querySelector("#split");

  let revealTL = gsap.timeline({ repeat: 2, repeatDelay: 1 });
  let fadeTL = gsap.timeline();
  let textTL = gsap.timeline();

  gsap.set("#split", { opacity: 1 });

  revealTL
    .from(split.chars, { duration: 2.5, stagger: 0.075, y: 30, rotation: 45, opacity: 0, ease: "elastic" })
  ;

  fadeTL
    .to(splitGroup, { duration: 4, opacity: 0, ease: "linear" })
  ;

  textTL
    .add("textstart")
    .add(revealTL, "textstart")
    .add(fadeTL, "textstart+=12.5")
  ;

  return textTL;

}

// De Jong Attractor
webglRenderer = i2d.WebglLayer( '.container_2d', { events: false, selectiveClear: false } );

let fragmentShader =

       `
          precision highp float;
          varying float v_t;
          const float PI = 3.14159265359;
          vec3 cubehelix(float x, float y, float z) {
            float a = y * z * (1.0 - z);
            float c = cos(x + PI / 2.0);
            float s = sin(x + PI / 2.0);
            return vec3(
                z + a * (2.8 * s - 0.14861 * c),
                z - a * (0.29227 * c + 0.90649 * s),
                z + a * (1.97294 * c)
            );
          }

          vec3 rainbow(float t) {
          if (t < 0.0 || t > 1.0) t -= floor(t);
          float ts = abs(t - 0.65);
          return cubehelix(
              (360.0 * t - 100.0) / 180.0 * PI,
              1.5 - 1.5 * ts,
              0.8 - 0.9 * ts
          );
          }

          void main() {
          gl_FragColor = vec4(rainbow(v_t / 5.0 + 0.2), 1);
          }
      `

let vertexShader =

      `
          precision highp float;
          const float PI = 3.14159265359;
          uniform float u_a;
          uniform float u_b;
          uniform float u_c;
          uniform float u_d;
          attribute vec2 a_position;
          varying float v_t;
          void main() {
          float x1, x2 = a_position.x;
          float y1, y2 = a_position.y;
          for (int i = 0; i < 4; i++) {
              x1 = x2, y1 = y2;
              x2 = sin(u_a * y1) - cos(u_b * x1);
              y2 = sin(u_c * x1) - cos(u_d * y1);
          }
          v_t = atan(a_position.y, a_position.x) / PI;
          gl_Position = vec4(x2 / 2.0, y2 / 2.0, 0.0, 1.0);
          gl_PointSize = 1.8;
          }
      `

function createAttractor() {

  let a = -2;
  let b = -2;
  let c = -1.5;
  let d = 2;
  let n = Math.pow( 2, 15 );

  let shaderRef = webglRenderer.createShaderEl({
                    fragmentShader: fragmentShader,
                    vertexShader: vertexShader,
                    uniforms:{
                        u_a: {
                            type: 'uniform1f',
                            data: a
                        },
                        u_b: {
                            type: 'uniform1f',
                            data: b
                        },
                        u_c: {
                            type: 'uniform1f',
                            data: c
                        },
                        u_d: {
                            type: 'uniform1f',
                            data: d
                        }
                    },
                    attributes:{
                        a_position: {
                            bufferType: 'ARRAY_BUFFER',
                            drawType: 'STATIC_DRAW',
                            valueType: 'FLOAT',
                            size: 2,
                            data: new Float32Array(n * 2).map(() => Math.random() * 2 - 1)
                        }
                    },
                    drawArrays: {
                        a_position: {
                            type: 'POINTS',
                            start:0,
                            end: n
                        }
                    }
            });

  return shaderRef;

}

function initAttractor() {

  let shaderRef = createAttractor();
  i2d.queue.onRequestFrame(function (t) { shaderRef.setUniformData('u_a', -2.0 + Math.sin(t / 100000))
  });

}

initAttractor();

function onDocumentMouseMove( event ) {

	mouseX = ( event.clientX - windowHalfX );
	mouseY = ( event.clientY - windowHalfY );
  isMouseMoved = true;

}

document.addEventListener( 'mousemove', onDocumentMouseMove, false );
window.addEventListener( 'resize', onWindowResize, false );
container3D.addEventListener( 'click', deformAnimation, false );

function deformAnimation() {

  if ( isIntroAnimFinished ) {
    toggleDeformation();
  }

}

function toggleDeformation() {

  deformTL.reversed( !deformTL.reversed() );

}

function deformationTimeline() {

  deformTL = gsap.timeline({ paused: true });

  deformTL
    .to(gltfModel.scale, { duration: 0.9, x: 50, ease: "elastic(1, 0.5)" })
  ;

  deformTL.play();
  deformTL.reversed( true );

  return deformTL;

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );

  webglRenderer.destroy();
  let el = document.querySelector('.container_2d');
  el.remove();
  let containerMain = document.querySelector('.container_main');
  let containerCanvas = document.createElement('div');
  containerCanvas.className = 'container_2d';
  containerMain.prepend( containerCanvas );

  webglRenderer = i2d.WebglLayer('.container_2d',{ events:false, selectiveClear:false });
  webglRenderer.width = '100vw';
  webglRenderer.height = '100vh';
  initAttractor();

}


/* CONFIG HERE */
var chars = ["0", "1"];
var fontsize = 20;
var subreddits = ["worldnews"];
var displayTime = 1000 * 10;
var typeDelay = 25;
/* END OF CONFIG */

function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
}

(function() {
		var lastTime = 0;
		var vendors = ['ms', 'moz', 'webkit', 'o'];
		for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
				window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
				window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
		}

		if (!window.requestAnimationFrame)
				window.requestAnimationFrame = function(callback, element) {
						var currTime = new Date().getTime();
						var timeToCall = Math.max(0, 16 - (currTime - lastTime));
						var id = window.setTimeout(function() {
										callback(currTime + timeToCall);
								},
								timeToCall);
						lastTime = currTime + timeToCall;
						return id;
				};

		if (!window.cancelAnimationFrame)
				window.cancelAnimationFrame = function(id) {
						clearTimeout(id);
				};
}());

var c, c2, cwidth, cheight, ctx, ctx2;
var yPositions = new Array(300).join(0).split('');

function draw() {
		ctx.shadowColor = "rgba(0,0,0,0)";
		ctx.fillStyle = 'rgba(0,0,0,.05)';
		ctx.fillRect(0, 0, cwidth, cheight);

		/*
		    ctx2.clearRect(0,0,c2.width,c2.height);
		    ctx2.drawImage(c, 0,0);
		    ctx.clearRect(0,0,c.width,c.height);
		    ctx.globalAlpha = 0.95;
		    ctx.drawImage(c2,0,0);
		*/

		ctx.fillStyle = '#d3ffd3';
		ctx.shadowColor = "#d3ffd3";
		if ($('body').hasClass('loaded')) {
				ctx.fillStyle = '#00e700';
				ctx.shadowColor = "#00e700";
		}

		if ($('body').hasClass('failure')) {
				ctx.fillStyle = '#29b6cc';
				ctx.shadowColor = "#29b6cc";
		}
		ctx.font = '20pt Source Code Pro';
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 0;
		ctx.shadowBlur = 10;

		yPositions.map(function(y, index) {
				var text = chars[getRandomInt(0, chars.length - 1)];
				var x = (index * fontsize) + fontsize;
				c.getContext('2d').fillText(text, x, y);
				if (y > 100 + Math.random() * 1e4) {
						yPositions[index] = 0;
				} else {
						yPositions[index] = y + fontsize;
				}
		});

}

var fetchAtOnce = 100;
var titles = [];
var lastpost;
var errorthrown = false;
var fetchrunning = false;
var cTitle = "";
var lastType;
var lastNews = 0;
var msgBox;

function renderText() {

		if (Date.now() - lastType < typeDelay) {
				return;
		}
		lastType = new Date();
		if (cTitle.length === 0) { //either we're happily displaying or currently removing old news
				if (msgBox.html().length === 1) { //let's insert a new text!
						cTitle = titles[0];
						if (cTitle.length === 0) {
								errorthrown = true;
								return;
						}
						titles.splice(0, 1);
						lastNews = new Date();
				} else { //remove old text
						if (Date.now() - lastNews > displayTime) {
								var before = msgBox.html();
								msgBox.html(msgBox.html().substring(0, msgBox.html().length - 2) + '_');
								if (before === msgBox.html()) {
										msgBox.html(msgBox.html().substring(0, msgBox.html().length - 5));
								}
						}
				}
		} else { //seems we need to wait OR add to the title
				if (cTitle.length > 0) {
						msgBox.html(msgBox.html().substr(0, msgBox.html().length - 1) + cTitle[0] + '_');
						cTitle = cTitle.slice(1);
				}
		}
}

function getNewPosts() {
		fetchrunning = true;
		var req = 'https://www.reddit.com/r/' + subreddits.join('+') + '/hot/.json?limit=' + fetchAtOnce;
		if (lastpost !== undefined && lastpost.length > 0) {
				req += '&after=t3_' + lastpost;
		}
		$.getJSON(req, function(data) {
				var children = data.data.children;
				$.each(children, function(i, item) {
						titles.push(item.data.title);
				});
				if (children && children.length > 0) {
						lastpost = children[children.length - 1].data.id;
				} else {
						lastpost = undefined;
				}
				fetchrunning = false;
		}).fail(function() {
				errorthrown = true;
		});
}

var fpslock = 30;
var lastloop = 0;
var isLoading = true;
var isActive = false;

function mainLoop() {
		if (Date.now() - lastloop >= 1000 / fpslock) {
				lastloop = Date.now();
				draw();
				if (isActive === true) {
						if (errorthrown !== false) {
								$('.loading, .msgbox').removeClass('flex').css('display', 'none');
								$('.error').addClass('flex');
								$('body').addClass('failure');
						} else {
								if (fetchrunning === false && titles.length < 10) {
										getNewPosts();
								}
								if (isLoading === true) {
										if (fetchrunning === false) {
												isLoading = false;
												$('.loading').removeClass('flex').css('display', 'none');
												$('.msgbox').css('display', 'initial');
												$('body').addClass('loaded');
										}
								} else {
										renderText();
								}
						}
				}
		}

		requestAnimationFrame(mainLoop);
}

$(document).ready(function() {
		c = $('#c').get(0);
		$('#c').css('height', $(window).height());
		$('#c').css('width', $(window).width());
		cwidth = c.width = $('body').width();
		cheight = c.height = $('body').height();
		ctx = c.getContext('2d');
		c2 = document.createElement('canvas');
		c2.width = c.width;
		c2.height = c.height;
		ctx2 = c2.getContext('2d');
		msgBox = $('.msgbox span');

		$('.loading').addClass('flex');
		mainLoop();
		setTimeout(function() {
				isActive = true;
		}, 3000);
});

$('body').one('click', function() {
		errorthrown = true;
});
