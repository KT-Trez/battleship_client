console.log('Loaded: DOM.ts');

export default class DOM {
	private static virtualDynamicMap = new Map<string, HTMLElement>();

	static createElement(name: keyof HTMLElementTagNameMap, options: object, parent: HTMLElement | Element) {
		const element = document.createElement(name);
		Object.assign(element, options);

		parent.appendChild(element);
		return element;
	}

	static createDynamicElement(name: keyof HTMLElementTagNameMap, options: object, parent: HTMLElement, dynamicID: string) {
		const element = this.createElement(name, options, parent);
		this.virtualDynamicMap.set(dynamicID, element);

		return element;
	}

	static newCreateElement(tagName: keyof HTMLElementTagNameMap, className: string | string[], innerText?: string | null, parent?: HTMLElement | Element) {
		const element = document.createElement(tagName);
		if (!Array.isArray(className))
			element.classList.add(className);
		else
			element.classList.add(...className);

		if (innerText)
			element.innerText = innerText;

		if (parent)
			parent.appendChild(element);

		return element;
	}

	static updateDynamicElement(id: string, newValue: object) {
		if (!this.virtualDynamicMap.has(id))
			throw new Error('There is no dynamic element with id: ' + id);

		const element = this.virtualDynamicMap.get(id);
		Object.assign(element, newValue);
	}
}