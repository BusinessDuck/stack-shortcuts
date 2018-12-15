/**
 * Модуль эмуляции DOM дерева
 * @Warning Импорт модуля должен быть самым первым, если мы тестируем компоненту, которая работает
 * с window или document объектами
 *
 * NB! Здесь может быть та же проблема что и с /lib/shortcuts при разном путе, будут разные объекты
 */

const DEFAULT_DOM_TEMPLATE = '<!DOCTYPE html><html><head></head><body></body></html>';

/**
 * Функция создаст в глобальной области видимости эмулятор DOM дерева
 * @param {String} template - шаблон создаваемого DOM дерева, по умолчанию DEFAULT_DOM_TEMPLATE
 */
export function initDOM(template = DEFAULT_DOM_TEMPLATE) {

    const JSDOM = require('jsdom').JSDOM;
    const dom = new JSDOM(template);

    global.document = dom.window.document;
    global.window = dom.window;
}

/**
 * Удаление созданного DOM дерева
 * NB! Необходимо запускать в конце теста, где используется initDOM
 * @return {boolean}
 */
export function destroyDOM() {
    return delete global.document && delete global.window;
}
