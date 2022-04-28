export default async function boardCellContextMenu(event: MouseEvent & { target: HTMLTableCellElement }) {
	event.preventDefault();
	this.shipsPlacer.horizontal = !this.shipsPlacer.horizontal;

	this.clearShipPreview();
	await this.renderShipPreview(parseInt(event.target.dataset.x), parseInt(event.target.dataset.y));
}