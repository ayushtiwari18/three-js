let scene, camera, renderer, submarine, ship;
let moveForward = false,
  moveBackward = false,
  moveLeft = false,
  moveRight = false,
  moveUp = false,
  moveDown = false;
let marineLife = [];
let waterParticles;
let exploring = false;
let modelsLoaded = false;
let oxygen = 100;
let isImploding = false;
let implosionStartTime;
let flashCardShown = false;

const MAX_DEPTH = -3850;
const MIN_DEPTH = -10;
const DARK_DEPTH = -3500;
const TITANIC_DEPTH = -3750;
const FLASH_CARD_DEPTH = -3600;
const READ_INFO_DEPTH = -3500;

const loader = new THREE.GLTFLoader();

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
  );
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Create sky
  const skyGeometry = new THREE.SphereGeometry(5000, 32, 32);
  const skyMaterial = new THREE.MeshBasicMaterial({
    color: 0x87ceeb,
    side: THREE.BackSide,
  });
  const sky = new THREE.Mesh(skyGeometry, skyMaterial);
  scene.add(sky);

  // Create ocean surface
  const oceanGeometry = new THREE.PlaneGeometry(10000, 10000);
  const oceanMaterial = new THREE.MeshPhongMaterial({
    color: 0x006994,
    transparent: true,
    opacity: 0.8,
  });
  const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
  ocean.rotation.x = -Math.PI / 2;
  scene.add(ocean);

  // Create ocean floor
  const floorGeometry = new THREE.PlaneGeometry(10000, 10000);
  const floorMaterial = new THREE.MeshPhongMaterial({
    color: 0x00000,
    side: THREE.DoubleSide,
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = MAX_DEPTH;
  scene.add(floor);

  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  // Add directional light
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(0, 1, 0);
  scene.add(directionalLight);

  loadModels();
  addWaterParticles();
  addCorals();
  addSharks();
  addWhales();
  addFishSchools();

  window.addEventListener("resize", onWindowResize, false);
  document.addEventListener("keydown", onKeyDown, false);
  document.addEventListener("keyup", onKeyUp, false);
  document.addEventListener("wheel", onScroll, false);
  document.addEventListener("mousedown", onMouseDown, false);
  document.addEventListener("mouseup", onMouseUp, false);
  document.addEventListener("mousemove", onMouseMove, false);

  document
    .getElementById("lets-go-button")
    .addEventListener("click", startExploration);
  document
    .getElementById("read-info-button")
    .addEventListener("click", showTitanicInfo);

  // Show info for 30 seconds
  const infoElement = document.getElementById("info");
  setTimeout(() => {
    infoElement.innerHTML = `Depth: <span id="depth">0</span> m`;
  }, 30000);
  document
    .getElementById("returnToMapButton")
    .addEventListener("click", returnToMap);
}

// ... (previous functions remain the same)

function loadModels() {
  let loadedCount = 0;
  const totalModels = 6;

  function onModelLoad() {
    loadedCount++;
    if (loadedCount === totalModels) {
      modelsLoaded = true;
      console.log("All models loaded");
    }
  }

  function loadModel(path, onLoad, name) {
    loader.load(
      path,
      onLoad,
      (xhr) => {
        console.log(`${name} ${(xhr.loaded / xhr.total) * 100}% loaded`);
      },
      (error) => {
        console.error(`An error occurred loading the ${name} model:`, error);
        onModelLoad();
      }
    );
  }

  loadModel(
    "models/submarine/scene.gltf",
    (gltf) => {
      submarine = gltf.scene;
      submarine.scale.set(5, 5, 5);
      submarine.position.set(0, -10, 0);
      submarine.visible = false;
      scene.add(submarine);
      addSpotlightsToSubmarine();
      onModelLoad();
    },
    "submarine"
  );

  loadModel(
    "models/cruise_ship/scene.gltf",
    (gltf) => {
      ship = gltf.scene;
      ship.scale.set(0.0025, 0.0025, 0.002);
      ship.position.set(0, -1.5, -15);
      ship.rotation.set(0, Math.PI / 2, 0);
      scene.add(ship);
      camera.position.set(0, 7, 15);
      camera.lookAt(0, -5, 0);
      onModelLoad();
    },
    "ship"
  );

  loadModel(
    "models/titanic__wreck/scene.gltf",
    (gltf) => {
      const titanicWreck = gltf.scene;
      titanicWreck.scale.set(20, 20, 20);
      titanicWreck.position.set(0, -3800, -100);
      scene.add(titanicWreck);
      onModelLoad();
    },
    "Titanic wreck"
  );

  loadModel("models/coral/scene.gltf", onModelLoad, "Coral");
  //   loadModel("models/shark/scene.gltf", onModelLoad, "Shark");
  loadModel("models/whale/scene.gltf", onModelLoad, "Whale");
  //   loadModel("models/fish/scene.gltf", onModelLoad, "Fish");
}

function addCorals() {
  loader.load("models/coral/scene.gltf", (gltf) => {
    const coralModel = gltf.scene;
    for (let i = 0; i < 1500; i++) {
      const coral = coralModel.clone();
      coral.position.set(
        Math.random() * 4000 - 2000,
        MAX_DEPTH,
        Math.random() * 4000 - 2000
      );
      coral.scale.set(
        Math.random() * 2 + 1,
        Math.random() * 4 + 2,
        Math.random() * 2 + 1
      );
      scene.add(coral);
    }
  });
}

function addSharks() {
  //   loader.load("models/shark/scene.gltf", (gltf) => {
  //     const sharkModel = gltf.scene;
  //     for (let i = 0; i < 600; i++) {
  //       const shark = sharkModel.clone();
  //       shark.scale.set(0.5, 0.5, 0.5);
  //       shark.position.set(
  //         Math.random() * 8000 - 4000,
  //         Math.random() * (MIN_DEPTH - MAX_DEPTH) + MAX_DEPTH,
  //         Math.random() * 8000 - 4000
  //       );
  //       scene.add(shark);
  //       marineLife.push({
  //         model: shark,
  //         speed: 1,
  //         rotationSpeed: Math.random() * 0.02 - 0.01,
  //         yRange: [MAX_DEPTH, MIN_DEPTH],
  //       });
  //       // Add point light to shark
  //       const light = new THREE.PointLight(0xffffff, 0.5, 50);
  //       shark.add(light);
  //     }
  //   });
}

function addWhales() {
  loader.load("models/whale/scene.gltf", (gltf) => {
    const whaleModel = gltf.scene;
    for (let i = 0; i < 50; i++) {
      const whale = whaleModel.clone();
      whale.scale.set(5, 5, 5);
      whale.position.set(
        Math.random() * 8000 - 4000,
        Math.random() * (MIN_DEPTH - MAX_DEPTH) + MAX_DEPTH,
        Math.random() * 8000 - 4000
      );
      scene.add(whale);
      marineLife.push({
        model: whale,
        speed: 0.8,
        rotationSpeed: Math.random() * 0.01 - 0.005,
        yRange: [MAX_DEPTH, MIN_DEPTH],
      });

      // Add point light to whale
      const light = new THREE.PointLight(0xffffff, 0.5, 100);
      whale.add(light);
    }
  });
}

function addFishSchools() {
  //   loader.load("models/fish/scene.gltf", (gltf) => {
  //     const fishModel = gltf.scene;
  //     for (let i = 0; i < 500; i++) {
  //       const school = new THREE.Group();
  //       for (let j = 0; j < 100; j++) {
  //         const fish = fishModel.clone();
  //         fish.scale.set(1, 1, 1);
  //         fish.position.set(
  //           Math.random() * 100 - 50,
  //           Math.random() * 100 - 50,
  //           Math.random() * 100 - 50
  //         );
  //         school.add(fish);
  //       }
  //       school.position.set(
  //         Math.random() * 8000 - 4000,
  //         Math.random() * (MIN_DEPTH - MAX_DEPTH) + MAX_DEPTH,
  //         Math.random() * 8000 - 4000
  //       );
  //       scene.add(school);
  //       marineLife.push({
  //         model: school,
  //         speed: 2,
  //         rotationSpeed: Math.random() * 0.02 - 0.01,
  //         yRange: [MAX_DEPTH, MIN_DEPTH],
  //       });
  //       // Add point light to school
  //       const light = new THREE.PointLight(0xffffff, 0.5, 100);
  //       school.add(light);
  // }
  //   });
}

function addSpotlightsToSubmarine() {
  const spotlightIntensity = 2;
  const spotlightDistance = 100;
  const spotlightAngle = Math.PI / 4;
  const spotlightPenumbra = 0.5;

  const createSpotlight = (x, y, z) => {
    const spotlight = new THREE.SpotLight(
      0xffffff,
      spotlightIntensity,
      spotlightDistance,
      spotlightAngle,
      spotlightPenumbra
    );
    spotlight.position.set(x, y, z);
    submarine.add(spotlight);
    submarine.add(spotlight.target);
    spotlight.target.position.set(x * 2, y * 2, z * 2);
    return spotlight;
  };

  submarine.spotlights = [
    createSpotlight(0, 0, 5), // Front
    createSpotlight(0, 0, -5), // Back
    createSpotlight(5, 0, 0), // Right
    createSpotlight(-5, 0, 0), // Left
  ];
}

function addWaterParticles() {
  const particleGeometry = new THREE.BufferGeometry();
  const particleCount = 20000;
  const posArray = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 2000;
  }

  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(posArray, 3)
  );
  const particleMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.1,
  });
  waterParticles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(waterParticles);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onKeyDown(event) {
  switch (event.keyCode) {
    case 38: // Arrow Up
      moveForward = true;
      break;
    case 40: // Arrow Down
      moveBackward = true;
      break;
    case 37: // Arrow Left
      moveLeft = true;
      break;
    case 39: // Arrow Right
      moveRight = true;
      break;
    case 32: // Space
      moveDown = true;
      break;
    case 9: // Tab
      moveUp = true;
      event.preventDefault();
      break;
  }
}

function onKeyUp(event) {
  switch (event.keyCode) {
    case 38: // Arrow Up
      moveForward = false;
      break;
    case 40: // Arrow Down
      moveBackward = false;
      break;
    case 37: // Arrow Left
      moveLeft = false;
      break;
    case 39: // Arrow Right
      moveRight = false;
      break;
    case 32: // Space
      moveDown = false;
      break;
    case 9: // Tab
      moveUp = false;
      break;
  }
}

function onScroll(event) {
  if (!exploring) return;

  const scrollSpeed = 0.5;
  submarine.position.y -= event.deltaY * scrollSpeed; // Reversed scrolling

  // Clamp depth
  submarine.position.y = Math.max(
    Math.min(submarine.position.y, MIN_DEPTH),
    MAX_DEPTH
  );

  // Update depth display
  const depthElement = document.getElementById("depth");
  depthElement.innerText = (-submarine.position.y).toFixed(2);
}

let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

function onMouseDown(event) {
  isDragging = true;
  previousMousePosition = { x: event.clientX, y: event.clientY };
}

function onMouseUp() {
  isDragging = false;
}

function onMouseMove(event) {
  if (!isDragging || !exploring) return;

  const deltaMove = {
    x: event.clientX - previousMousePosition.x,
    y: event.clientY - previousMousePosition.y,
  };

  const rotationSpeed = 0.03;
  submarine.rotation.y -= deltaMove.x * rotationSpeed;
  submarine.rotation.x -= deltaMove.y * rotationSpeed;

  submarine.rotation.x = Math.max(
    -Math.PI / 2,
    Math.min(Math.PI / 2, submarine.rotation.x)
  );

  previousMousePosition = { x: event.clientX, y: event.clientY };
}

function startExploration() {
  if (!submarine) {
    console.error("Submarine model not loaded. Cannot start exploration.");
    return;
  }
  exploring = true;
  flashCardShown = false; // Reset this variable when starting exploration
  submarine.visible = true;
  if (ship) ship.visible = false;
  submarine.position.set(0, -10, 0);
  camera.position.set(
    submarine.position.x,
    submarine.position.y + 10,
    submarine.position.z + 30
  );
  camera.lookAt(submarine.position);

  scene.fog = new THREE.FogExp2(0x000033, 0.00075);
  document.getElementById("lets-go-button").style.display = "none";
  document.getElementById("oxygen-bar").style.display = "block";
}

function updateEnvironment() {
  const depth = -submarine.position.y;
  let fogDensity, ambientIntensity;

  if (depth > DARK_DEPTH) {
    const t = depth / DARK_DEPTH;
    fogDensity = 0.00075 + t * 0.00125;
    ambientIntensity = 0.1 * (1 - t);
  } else {
    fogDensity = 0.002;
    ambientIntensity = 0;
  }

  scene.fog.density = fogDensity;
  scene.children.find(
    (child) => child instanceof THREE.AmbientLight
  ).intensity = ambientIntensity;

  // Show Read Info button when depth is greater than READ_INFO_DEPTH
  if (depth > READ_INFO_DEPTH) {
    document.getElementById("read-info-button").style.display = "block";
  } else {
    document.getElementById("read-info-button").style.display = "none";
  }

  // Automatically show flash card when depth is greater than FLASH_CARD_DEPTH
  if (depth > FLASH_CARD_DEPTH && !flashCardShown) {
    showTitanicInfo();
    flashCardShown = true;
  }

  // Update depth display
  document.getElementById("depth").innerText = depth.toFixed(2);
}

function showTitanicInfo() {
  const flashCard = document.getElementById("flash-card");
  flashCard.innerHTML = `
                <button class="close-button" onclick="closeFlashCard()">×</button>
                <h2>The Titanic</h2>
                <p>The RMS Titanic was a British passenger liner that sank in the North Atlantic Ocean on April 15, 1912, after striking an iceberg during her maiden voyage from Southampton, UK, to New York City.</p>
                <p>Key facts:</p>
                <ul>
                    <li>Over 1,500 people died, making it one of the deadliest maritime disasters in modern history.</li><br>
                    <li>The ship was the largest afloat at the time and was considered "unsinkable".</li><br>
                    <li>The wreck was discovered in 1985 at a depth of about 12,500 feet (3,800 m).</li><br>
                    <li>The Titanic's story has fascinated the public for over a century, inspiring numerous books, films, and exhibitions.</li>
                </ul>
                <p> <br>  LET US EXPLORE IT !</p>
            `;
  flashCard.style.display = "block";
}

function closeFlashCard() {
  document.getElementById("flash-card").style.display = "none";
}

function updateOxygen() {
  if (exploring && submarine.position.y < MIN_DEPTH) {
    oxygen -= 0.05; // Adjusted depletion rate
    if (oxygen <= 0) {
      oxygen = 0;
      exploring = false;
      startImplosion();
    }
  } else if (submarine.position.y >= MIN_DEPTH) {
    oxygen = Math.min(oxygen + 0.1, 100);
  }
  document.getElementById("oxygen-level").style.width = `${oxygen}%`;
}

function startImplosion() {
  isImploding = true;
  implosionStartTime = Date.now();
  document.getElementById("implosion-text").style.display = "block";
  setTimeout(() => {
    document.getElementById("implosion-text").style.display = "none";
    showOceanGateInfo();
  }, 5000);
}

function updateImplosion() {
  if (!isImploding) return;

  const elapsedTime = (Date.now() - implosionStartTime) / 1000; // time in seconds
  const implosionDuration = 2; // total duration of implosion in seconds

  if (elapsedTime < implosionDuration) {
    const t = elapsedTime / implosionDuration;
    const scale = 1 - t;

    submarine.scale.set(scale * 5, scale * 5, scale * 5);
    submarine.rotation.x += 0.1;
    submarine.rotation.y += 0.15;
    submarine.rotation.z += 0.2;

    // Add particle effect
    const particleCount = 50;
    const particleGeometry = new THREE.BufferGeometry();
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
    });

    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = submarine.position.x + (Math.random() - 0.5) * 5;
      positions[i + 1] = submarine.position.y + (Math.random() - 0.5) * 5;
      positions[i + 2] = submarine.position.z + (Math.random() - 0.5) * 5;
    }

    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Remove particles after a short time
    setTimeout(() => {
      scene.remove(particles);
    }, 1000);
  } else {
    // Implosion complete
    scene.remove(submarine);
    isImploding = false;
  }
}

function showOceanGateInfo() {
  const flashCard = document.getElementById("flash-card");
  flashCard.innerHTML = `
                <button class="close-button" onclick="closeFlashCard()">×</button>
                <h2>OceanGate Titan Submersible Incident</h2>
                <p>On June 18, 2023, the Titan, a submersible operated by OceanGate, imploded during a dive to the Titanic wreck site.</p>
                <p>Key facts:</p>
                <ul>
                    <li>The submersible was carrying five people, including OceanGate's CEO.</li>
                    <li>The implosion occurred at a depth of approximately 12,500 feet (3,800 meters).</li>
                    <li>The incident highlighted concerns about the safety of deep-sea exploration vehicles.</li>
                    <li>The implosion was likely due to the immense pressure at that depth, estimated at over 5,600 pounds per square inch.</li>
                </ul>
                <p>This tragic event serves as a stark reminder of the extreme challenges and risks involved in deep-sea exploration.</p>
            `;
  flashCard.style.display = "block";
}

function closeFlashCard() {
  document.getElementById("flash-card").style.display = "none";
  if (!exploring) {
    document.getElementById("dive-again-button").style.display = "block";
  }
}

document.getElementById("dive-again-button").addEventListener("click", () => {
  // Reset submarine position, rotation, and visibility
  submarine.position.set(0, -10, 0); // Reset to the initial position
  submarine.rotation.set(0, 0, 0); // Reset rotation if necessary
  submarine.visible = true; // Ensure it's visible

  // Reset any other necessary variables or states
  exploring = true;
  isImploding = false;
  oxygen = 100;

  // Hide "Dive Again" button and any game-over text
  document.getElementById("dive-again-button").style.display = "none";
  document.getElementById("game-over").style.display = "none";

  // Any other reset logic
});

function animate() {
  requestAnimationFrame(animate);

  if (modelsLoaded) {
    if (exploring && !isImploding) {
      const speed = 1;
      const direction = new THREE.Vector3();
      submarine.getWorldDirection(direction);

      if (moveForward) submarine.position.add(direction.multiplyScalar(speed));
      if (moveBackward)
        submarine.position.add(direction.multiplyScalar(-speed));
      if (moveLeft)
        submarine.position.add(
          new THREE.Vector3(-direction.z, 0, direction.x)
            .normalize()
            .multiplyScalar(speed)
        );
      if (moveRight)
        submarine.position.add(
          new THREE.Vector3(direction.z, 0, -direction.x)
            .normalize()
            .multiplyScalar(speed)
        );
      if (moveUp) submarine.position.y += speed;
      if (moveDown) submarine.position.y -= speed;

      submarine.position.y = Math.max(
        Math.min(submarine.position.y, MIN_DEPTH),
        MAX_DEPTH
      );

      camera.position
        .copy(submarine.position)
        .add(
          new THREE.Vector3(0, 10, 30).applyQuaternion(submarine.quaternion)
        );
      camera.lookAt(submarine.position);

      waterParticles.position.y = submarine.position.y;

      // Animate marine life
      marineLife.forEach((animal) => {
        const direction = new THREE.Vector3(
          Math.sin(Date.now() * 0.001 * animal.rotationSpeed),
          0,
          Math.cos(Date.now() * 0.001 * animal.rotationSpeed)
        );
        animal.model.position.add(direction.multiplyScalar(animal.speed));

        // Wrap around behavior
        animal.model.position.x =
          ((animal.model.position.x + 4000) % 8000) - 4000;
        animal.model.position.z =
          ((animal.model.position.z + 4000) % 8000) - 4000;

        // Keep within vertical range and inside the ocean
        animal.model.position.y = Math.max(
          Math.min(animal.model.position.y, animal.yRange[1]),
          Math.max(animal.yRange[0], MIN_DEPTH)
        );

        animal.model.rotation.y = Math.atan2(direction.x, direction.z);

        // Show marine life that's close to the submarine
        const distance = animal.model.position.distanceTo(submarine.position);
        animal.model.visible = distance < 1000; // Increased visibility range
      });

      const depthElement = document.getElementById("depth");
      depthElement.innerText = (-submarine.position.y).toFixed(2);

      updateEnvironment();
      updateOxygen(); // Make sure this is called in each frame
    } else {
      ship.position.y = 5 + Math.sin(Date.now() * 0.001) * 0.5;
      camera.lookAt(ship.position);
    }
  }

  renderer.render(scene, camera);
}

function returnToMap() {
  const currentLocation = { name: "Titanic Sinking Spot" }; // You may need to adjust this based on your actual location tracking
  window.location.href = `threeD.html?returnedFrom=${encodeURIComponent(
    currentLocation.name
  )}`;
}
// Initialize the scene
init();
// Start the animation loop
animate();
