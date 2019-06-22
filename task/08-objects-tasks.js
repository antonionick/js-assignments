'use strict';

/**************************************************************************************************
 *                                                                                                *
 * Plese read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 **************************************************************************************************/


/**
 * Returns the rectagle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    var r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
	this.width = width;
	this.height = height;
}

Rectangle.prototype.getArea = function () {
	return this.width * this.height;
};


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
	return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    var r = fromJSON(Rectangle.prototype, '{"width":10, "height":20}');
 *
 */
function fromJSON(proto, json) {
	return Object.setPrototypeOf(JSON.parse(json), proto);
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurences
 *
 * All types of selectors can be combined using the combinators ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy and implement the functionality
 * to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string repsentation according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple, clear and readable as possible.
 *
 * @example
 *
 *  var builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()  => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()  => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()        =>    'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

class MyCssSelectorBuilder {
	constructor() {
		this._element = [];
		this._id = [];
		this._class = [];
		this._attr = [];
		this._pseudoClass = [];
		this._pseudoElement = [];
		this._lastCall = "";
	}

	element(value) {
		if (this._element.length) {
			throw new Error("Element, id and pseudo-element should not occur more then one time inside the selector");
		}
		this._checkFlow("element");
		this._element.push(value);
		this._lastCall = "element";
		return this;
	}

	id(value) {
		if (this._id.length) {
			throw new Error("Element, id and pseudo-element should not occur more then one time inside the selector");
		}
		this._checkFlow("id");
		this._id.push("#" + value);
		this._lastCall = "id";
		return this;
	}

	class(value) {
		this._checkFlow("class");
		this._class.push("." + value);
		this._lastCall = "class";
		return this;
	}

	attr(value) {
		this._checkFlow("attribute");
		this._attr.push("[" + value + "]");
		this._lastCall = "attribute";
		return this;
	}

	pseudoClass(value) {
		this._checkFlow("pseudo-class");
		this._pseudoClass.push(":" + value);
		this._lastCall = "pseudo-class";
		return this;
	}

	pseudoElement(value) {
		if (this._pseudoElement.length) {
			throw new Error("Element, id and pseudo-element should not occur more then one time inside the selector");
		}
		this._checkFlow("pseudo-element");
		this._pseudoElement.push("::" + value);
		this._lastCall = "pseudo-element";
		return this;
	}

	stringify() {
		const items = [this._element, this._id, this._class, this._attr, this._pseudoClass, this._pseudoElement];
		return items.reduce((result, item) => {
			return result + item.reduce((result, item) => result + item, "");
		}, "");
	}

	_checkFlow(current) {
		if (!this._lastCall) return;
		const flow = ["element", "id", "class", "attribute", "pseudo-class", "pseudo-element"];
		if (flow.indexOf(current) < flow.indexOf(this._lastCall)) {
			throw new Error("Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class," +
				" pseudo-element");
		}
	}
}

class MyCssCombine {
	constructor(selector1, combinator, selector2) {
		this._selector1 = selector1.stringify();
		this._combinator = combinator;
		this._selector2 = selector2.stringify();
		return this;
	}

	stringify() {
		return this._selector1 + " " + this._combinator + " " + this._selector2;
	}
}

const cssSelectorBuilder = {
	element: function (value) {
		return new MyCssSelectorBuilder().element(value);
	},

	id: function (value) {
		return new MyCssSelectorBuilder().id(value);
	},

	class: function (value) {
		return new MyCssSelectorBuilder().class(value);
	},

	attr: function (value) {
		return new MyCssSelectorBuilder().attr(value);
	},

	pseudoClass: function (value) {
		return new MyCssSelectorBuilder().pseudoClass(value);
	},

	pseudoElement: function (value) {
		return new MyCssSelectorBuilder().pseudoElement(value);
	},

	combine: function (selector1, combinator, selector2) {
		return new MyCssCombine(...arguments);
	},
};


module.exports = {
	Rectangle: Rectangle,
	getJSON: getJSON,
	fromJSON: fromJSON,
	cssSelectorBuilder: cssSelectorBuilder
};
