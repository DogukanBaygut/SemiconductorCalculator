class BandDiagram3D {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.init();
    }

    init() {
        // Temel ayarlar
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.container.appendChild(this.renderer.domElement);
        this.scene.background = new THREE.Color(0xeeeeee);

        // Kamera pozisyonu
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(0, 0, 0);

        // Kontroller
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);

        // Işıklandırma
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(0, 5, 5);
        this.scene.add(light);
        this.scene.add(new THREE.AmbientLight(0x404040));

        // İlk band yapısını oluştur
        this.createSimpleBands();

        // Animasyon döngüsü
        this.animate();
    }

    createSimpleBands() {
        // İletim bandı (üst yüzey)
        const conductionGeometry = new THREE.PlaneGeometry(5, 5, 32, 32);
        const conductionMaterial = new THREE.MeshPhongMaterial({
            color: 0x4CAF50,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7
        });
        const conductionBand = new THREE.Mesh(conductionGeometry, conductionMaterial);
        conductionBand.position.y = 2;
        conductionBand.rotation.x = -Math.PI / 2;

        // Valans bandı (alt yüzey)
        const valenceGeometry = new THREE.PlaneGeometry(5, 5, 32, 32);
        const valenceMaterial = new THREE.MeshPhongMaterial({
            color: 0x2196F3,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7
        });
        const valenceBand = new THREE.Mesh(valenceGeometry, valenceMaterial);
        valenceBand.position.y = -2;
        valenceBand.rotation.x = -Math.PI / 2;

        // Band bending efekti
        this.applyBandBending(conductionBand.geometry);
        this.applyBandBending(valenceBand.geometry);

        // Grid lines
        const gridHelper = new THREE.GridHelper(5, 10);
        gridHelper.position.y = -2;

        this.scene.add(conductionBand);
        this.scene.add(valenceBand);
        this.scene.add(gridHelper);
    }

    applyBandBending(geometry) {
        const positions = geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const distanceFromCenter = Math.sqrt(x * x);
            positions[i + 2] = Math.exp(-distanceFromCenter * 0.5) * 1.5;
        }
        geometry.attributes.position.needsUpdate = true;
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    updateTheme(isDark) {
        this.scene.background = new THREE.Color(isDark ? 0x222222 : 0xeeeeee);
    }
} 