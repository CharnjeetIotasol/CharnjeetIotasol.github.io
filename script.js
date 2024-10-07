const distance = 50;
const fixedScale = 10;

// Array of locations with their corresponding latitudes and longitudes
let locations = [

    { lat: 30.856915, long: 75.832428 },  // Location 1
    { lat: 30.860020610552958, long: 75.8383320571544 },  // Location 4
    { lat: 30.8605155678369, long: 75.83794762685193 },  // Location 4
    { lat: 30.860009456310056, long: 75.83716666824195 },  // Location 4
    // Add more locations here
];
window.onload = () => {
    let entities = []; // Array to store entities for each location
    const el = document.querySelector("[gps-new-camera]");
    const sceneEl = document.querySelector("a-scene");
    const camera = sceneEl.camera;
    const renderer = sceneEl.renderer;

    // Raycaster and mouse vector for detecting clicks
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const loader = new THREE.GLTFLoader();

    // update camera position
    el.addEventListener("gps-camera-update-position", e => {
        if(entities.length === 0) { 

            alert(`Got first GPS position: lon ${e.detail.position.longitude} lat ${e.detail.position.latitude}`);
            locations.forEach((location, index) => {
                const entity = document.createElement("a-entity");

               console.log("animated model", index)
                loader.load('buy_gift_glb/scene.gltf', function(gltf) {
                    // Create a new entity for the model
                    const model = gltf.scene;

                    // Set position, scale, and shadow properties
                    // model.scale.set(10, 10, 10);
                    // model.position.set(-30, 0, -30);
                    model.scale.set(9, 9, 9);
                    model.position.set(0, 0, 0);
                    model.castShadow = true;

                    // Add the Three.js model to the A-Frame scene
                    entity.object3D.add(model);
                    entity.setAttribute("class", "clickable"); // Add a 'clickable' class for raycasting

                    // Animation
                    const mixer = new THREE.AnimationMixer(model);
                    const action = mixer.clipAction(gltf.animations[0]); // Play the first animation clip
                    action.play();
                    entity.setAttribute('gps-new-entity-place', {
                            latitude: location.lat,
                            longitude: location.long
                        });

                    entity.setAttribute("visible", true);
                    // Attach entity to the scene
                    // sceneEl.appendChild(collider);
                    sceneEl.appendChild(entity);

                    entity.addEventListener('click', function () {
                        alert('Model clicked!');
                    });
                    entity.addEventListener('touchstart', function () {
                        alert('Model touched!');
                    });
                    // Animation loop
                    const clock = new THREE.Clock();
                    function animate() {
                        requestAnimationFrame(animate);
                        const delta = clock.getDelta();
                        if (mixer) mixer.update(delta); // Update the mixer (which handles animation)
                    }
                    animate();
                
                    entities.push(model);

                });
            });
            function onClick(event) {
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
                raycaster.setFromCamera(mouse, camera);
                
                // Flatten all child objects of entities into a single array for better detection
                let allChildren = [];
                entities.forEach(entity => {
                    entity.traverse(child => {
                        if (child.isMesh) {  // Only consider mesh objects for raycasting
                            allChildren.push(child);
                        }
                    });
                });
            
                // Intersect against all mesh components of the entities
                const intersects = raycaster.intersectObjects(allChildren, true);
            
                if (intersects.length > 0) {
                    alert('Model clicked!');
                }
            }
            
            // Touch detection for mobile
            function onTouch(event) {
                const touch = event.touches[0];
                mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;

                raycaster.setFromCamera(mouse, camera);
                let allChildren = [];
                
                entities.forEach(entity => {
                    entity.traverse(child => {
                        if (child.isMesh) {  // Only consider mesh objects for raycasting
                            allChildren.push(child);
                        }
                    });
                });
                const intersects = raycaster.intersectObjects(entities, true);

                if (intersects.length > 0) {
                    alert('Model touched!');
                }
            }
            window.addEventListener('click', onClick, false);
            window.addEventListener('touchstart', onTouch, false);
        }

        // Check the distance for each entity
        entities.forEach((entity, index) => {
            checkDistance(e, entity, locations[index].lat, locations[index].long);
        });
    });
};

// Function to check distance and update visibility of entity
function checkDistance(e, entity, destinationLat, destinationLong) {
    const currentLat = e.detail.position.latitude;
    const currentLong = e.detail.position.longitude;
    const isInRadius = calculateDistance(
      currentLat,
      currentLong,
      destinationLat,
      destinationLong
    );
    if (isInRadius <= distance) {
      entity.visible = true;
    } else {
        entity.visible = false;
        }
}

// Function to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Radius of the Earth in meters
    const radLat1 = (lat1 * Math.PI) / 180;
    const radLat2 = (lat2 * Math.PI) / 180;
    const deltaLat = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(radLat1) *
        Math.cos(radLat2) *
        Math.sin(deltaLon / 2) *
        Math.sin(deltaLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Distance in meters
    return distance;
}
