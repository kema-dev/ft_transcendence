import * as THREE from 'three';

export default class PlayerBar {

	player: number;
	color: number;
	geometry: THREE.BoxGeometry;
	material: THREE.MeshBasicMaterial;
	mesh: THREE.Mesh;

	constructor(nPlayer: number, width: number, border: number, color: number) {
		this.player = nPlayer;
		this.color = color;
		this.geometry = new THREE.BoxGeometry(2 * border, 2, 0.5);
		this.material = new THREE.MeshBasicMaterial({ color: color });
		this.mesh = new THREE.Mesh(this.geometry, this.material);
		if (nPlayer == 1) 
			this.mesh.position.x = - width / 2 + 3 * border;
		else
			this.mesh.position.x = width / 2 - 3 * border;
	}
}