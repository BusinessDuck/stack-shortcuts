/* eslint-disable */
import { initDOM, destroyDOM } from './utils/dom';
import { KeyCode } from '../src/utils/KeyCode';
import assert from 'assert';
import { shortcuts, getHash } from '../lib/shortcuts.cjs';

describe('shortcuts', () => {

    before(() => {
        initDOM();
    });

    after(() => {
       destroyDOM();
    });

    describe(':public api', () => {
        const KeyMap = Object.assign({}, KeyCode);
        const noop = () => null;
        let layerOne;
        let keys;
        const keyGettersUnique = [
            (key) => ['CTRL', key],
            (key) => ['CTRL', 'ALT', key],
            (key) => ['CTRL', 'ALT', 'SHIFT', key],
            (key) => ['SHIFT', key],
            (key) => ['SHIFT', 'ALT', key],
            (key) => ['ALT', key]
        ];
        const keyGettersDuplicate = [
            (key) => [key, 'CTRL'],
            (key) => ['ALT', 'CTRL', key],
            (key) => ['SHIFT', 'CTRL', 'ALT', key],
            (key) => [key, 'SHIFT'],
            (key) => ['ALT', key, 'SHIFT'],
            (key) => [key, 'ALT']
        ];

        before(() => {
            // Удаляем клавиши модификаторов из таблицы кодов клавиш
            ['CTRL', 'CMD', 'ALT', 'SHIFT', 'ALL'].forEach(item => delete KeyMap[item]);
            keys = Object.keys(KeyMap);
            layerOne = shortcuts({});
        });

        after(() => {
            layerOne.destroy();
        });

        it('create new layer', () => {
            assert.equal(typeof layerOne === 'object', true);
        });

        it('hash should be unique', () => {
            for (const key of keys) {
                keyGettersUnique.forEach(keyFn => {
                    const keys = keyFn(key);
                    const hash = getHash(keys);
                    assert.equal(layerOne.manager.hasHandler(hash), false);
                    layerOne.manager.add(keys.join('+'), noop);
                    assert.equal(layerOne.manager.hasHandler(hash), true);
                })
            }
        });

        it('shortcuts should be independent from order in add function', () => {
            for (const [key] of keys) {
                keyGettersDuplicate.forEach(keyFn => {
                    const keys = keyFn(key);
                    const hash = getHash(keys);
                    assert.equal(layerOne.manager.hasHandler(hash), true);
                })
            }
        });

        it('all hotkeys should be registered in manager', () => {
            assert.equal(Object.keys(KeyMap).length * keyGettersUnique.length, Object.keys(layerOne.manager._shortcuts).length);
        });
    });

    describe('client side behaviour', () => {

        it('shortcuts add multimple layers, handle last only', () => {
            let value = null;
            const event = new window.KeyboardEvent('keydown', {
                keyCode: KeyCode.V, ctrlKey: true
            });
            const layer1 = new shortcuts({ 'CTRL+V': () => value = 'layer1' });
            const layer2 = new shortcuts({ 'CTRL+V': () => value = 'layer2' });
            document.dispatchEvent(event);
            layer1.destroy();
            layer2.destroy();
            assert.equal(value, 'layer2');

        });

        it('shortcuts add multimple layers, skip last, handle in first', () => {
            let value = null;
            const event = new window.KeyboardEvent('keydown', {
                keyCode: KeyCode.V, ctrlKey: true
            });
            const layer1 = new shortcuts({ 'CTRL+V': () => value = 'layer1' });
            const layer2 = new shortcuts({ 'CTRL+V': (event, next) => next() });
            document.dispatchEvent(event);
            layer1.destroy();
            layer2.destroy();
            assert.equal(value, 'layer1');

        });

        it('shortcuts destroy id should be correctly in destroy function', () => {
            let value = null;
            const event = new window.KeyboardEvent('keydown', {
                keyCode: KeyCode.V, ctrlKey: true
            });
            const layer1 = new shortcuts({ 'CTRL+V': () => value = 'layer1' });
            const layer2 = new shortcuts({ 'CTRL+V': () => value = 'layer2' });
            const layer3 = new shortcuts({ 'CTRL+V': (event, next) => next() });
            const layer4 = new shortcuts({ 'CTRL+V': (event, next) => next() });

            // Удаление слоя 2, должно отработать, и во время обработки ивента, должен быть пойман в layer1
            layer2.destroy();
            document.dispatchEvent(event);
            layer1.destroy();
            layer3.destroy();
            layer4.destroy();

            assert.equal(value, 'layer1');

        });

        it('shortcuts destroy index should be correctly closured in destroy function', () => {
            let value = null;
            const event = new window.KeyboardEvent('keydown', { keyCode: KeyCode.V, ctrlKey: true });
            const layer1 = new shortcuts({ 'CTRL+V': () => value = 'layer1' });
            const layer2 = new shortcuts({ 'CTRL+V': () => value = 'layer2' });
            const layer3 = new shortcuts({ 'CTRL+V': () => value = 'layer3' });
            const layer4 = new shortcuts({ 'CTRL+V': (event, next) => next() });
            const layer5 = new shortcuts({ 'CTRL+V': (event, next) => next() });

            // Удаление слоя 2, должно отработать, и во время обработки ивента, должен быть пойман в layer1
            layer2.destroy();
            layer5.destroy();
            layer3.destroy();
            document.dispatchEvent(event);
            layer1.destroy();
            layer4.destroy();

            assert.equal(value, 'layer1');

        });


        it('Double and triple keys handlers', () => {
            let value = null;
            const event = new window.KeyboardEvent('keydown', { keyCode: KeyCode.V, ctrlKey: true, shiftKey: true });
            const layer1 = new shortcuts({ 'CTRL+V': () => value = 'layer1' });
            const layer2 = new shortcuts({ 'CTRL+SHIFT+V': () => value = 'layer2' });

            document.dispatchEvent(event);
            layer1.destroy();
            layer2.destroy();
            assert.equal(value, 'layer2');

            // check it after desctructions
            value = '';
            document.dispatchEvent(event);
            assert.equal(value, '');

        });

        it('Double and triple keys handlers should not crossing if next called', () => {
            let value = '';
            const event = new window.KeyboardEvent('keydown', {
                keyCode: KeyCode.V, ctrlKey: true, shiftKey: true
            });
            const layer1 = new shortcuts({ 'CTRL+V': () => value = 'layer1' });
            const layer2 = new shortcuts({ 'CTRL+SHIFT+V': (event, next) => next() });

            // CTRL + SHIFT + V
            document.dispatchEvent(event);
            assert.equal(value, '');

            // CTRL + V
            const event2 = new window.KeyboardEvent('keydown', {
                keyCode: KeyCode.V, ctrlKey: true
            });

            document.dispatchEvent(event2);
            assert.equal(value, 'layer1');
            layer1.destroy();
            layer2.destroy();

        });

        it('Single keyhandler in layer', () => {
            let value = null;
            const event = new window.KeyboardEvent('keydown', {
                keyCode: KeyCode.V
            });
            const layer1 = new shortcuts({ 'V': () => value = 'layer1' });

            document.dispatchEvent(event);

            assert.equal(value, 'layer1');
            layer1.destroy();
        });


        it('CMD replace to CTRL on non mac systems', () => {
            let value = null;
            const event = new window.KeyboardEvent('keydown', { keyCode: KeyCode.V, ctrlKey: true });
            const layer1 = new shortcuts({ 'CMD+V': () => value = 'layer1' });

            document.dispatchEvent(event);

            assert.equal(value, 'layer1');
            layer1.destroy();
        })


    });

});
