export function canScroll(element: Element, rootElement: Element, vertical: boolean, scrollEnd: boolean): boolean {
    return vertical
        ? canScrollVertical(element, rootElement, scrollEnd)
        : canScrollHorizontal(element, rootElement, scrollEnd);
}

/**
 * Just checking can we scroll vertically or not by finding parent element recursively.
 *
 * @param {Element} element
 * @param {Element} rootElement
 * @param {boolean} scrollEnd
 * @returns
 */
function canScrollVertical(element: Element, rootElement: Element, scrollEnd: boolean): boolean {
    let currentElement = element;

    while (currentElement !== rootElement.parentElement) {
        if (
            (Math.floor(currentElement.scrollTop) > 0 && !scrollEnd) ||
            (Math.ceil(currentElement.scrollTop + currentElement.clientHeight) < currentElement.scrollHeight &&
                scrollEnd)
        ) {
            return true;
        }

        if (currentElement.parentElement) {
            currentElement = currentElement.parentElement;
        } else {
            return false;
        }
    }

    return false;
}

/**
 * Just checking can we scroll horizontal or not by finding parent element recursively.
 *
 * @param {Element} element
 * @param {Element} rootElement
 * @param {boolean} scrollEnd
 * @returns
 */
function canScrollHorizontal(element: Element, rootElement: Element, scrollEnd: boolean): boolean {
    let currentElement = element;

    while (currentElement !== rootElement.parentElement) {
        if (
            (Math.floor(currentElement.scrollLeft) > 0 && !scrollEnd) ||
            (Math.ceil(currentElement.scrollLeft + currentElement.clientWidth) < currentElement.scrollWidth &&
                scrollEnd)
        ) {
            return true;
        }

        if (currentElement.parentElement) {
            currentElement = currentElement.parentElement;
        } else {
            return false;
        }
    }

    return false;
}
