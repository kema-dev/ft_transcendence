import * as THREE from 'three';
import { CSG } from 'three-csg-ts';

export default class FieldBorders {
	color: number;
	// geometry: THREE.BoxGeometry;
	// material: THREE.MeshBasicMaterial;
	mesh: THREE.Mesh;

	constructor(width: number, height: number, border: number, color: number) {
		this.color = color;

		const geometry1 = new THREE.BoxGeometry(width, height, 1);
		const material1 = new THREE.MeshBasicMaterial({ color: this.color });
		const mesh1 = new THREE.Mesh(geometry1, material1);
		const geometry2 = new THREE.BoxGeometry(width - border * 2, height - border * 2, 1);
		const material2 = new THREE.MeshBasicMaterial({ color: this.color });
		const mesh2 = new THREE.Mesh(geometry2, material2);

		this.mesh = CSG.subtract(mesh1, mesh2);
	}
}