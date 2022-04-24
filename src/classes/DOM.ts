export default class DOM {
	private static virtualDynamicMap = new Map<string, HTMLElement>();

	static createElement(name: keyof HTMLElementTagNameMap, options: object, parent: HTMLElement) {
		const element = document.createElement(name);
		Object.assign(element, options);

		parent.appendChild(element);
		return element;
	}

	static createDynamicElement(name: keyof HTMLElementTagNameMap, options: object, parent: HTMLElement, dynamicID: string)  {
		const element = this.createElement(name, options, parent);
		this.virtualDynamicMap.set(dynamicID, element);

		return element;
	}

	static execute(jsx: string, parent: HTMLElement, parameters?: object) {
		const args = jsx.split(';;');

		const element = document.createElement(args[0]);
		Object.assign(element, {
			className: args[1] ?? null,
			innerText: args[2] ?? null
		});
		Object.assign(element, parameters);

		const attributesArr = args.splice(0, 3);
		for (const attribute of attributesArr)
			element.setAttribute(attribute.split('|')[0], attribute.split('|')[1]);

		parent.appendChild(element);

		return element;
	}

	static updateDynamicElement(id: string, newValue: object) {
		const element = this.virtualDynamicMap.get(id);
		Object.assign(element, newValue);
	}
}