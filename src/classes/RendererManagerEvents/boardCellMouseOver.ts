export default async function boardCellMouseOver(event: MouseEvent & { target: HTMLTableCellElement }) {
	await this.renderShipPreview(parseInt(event.target.dataset.x), parseInt(event.target.dataset.y));
}