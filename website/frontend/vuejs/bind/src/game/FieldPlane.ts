import * as THREE from 'three';

export default class FieldPlane {
	color: number;
	geometry: THREE.PlaneGeometry;
	material: THREE.MeshBasicMaterial;
	mesh: THREE.Mesh;

	constructor( width: number, height: number, color: number) {
		this.color = color;
		this.geometry = new THREE.PlaneGeometry( width, height );
		this.material = new THREE.MeshBasicMaterial( {color: this.color, side: THREE.DoubleSide} );
		this.mesh = new THREE.Mesh(this.geometry, this.material);
	}
}