/*
 * Copyright (c) 2018-2020 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

const assert = require('assert');
const Z85 = require('..');

describe('Z85', () => {
    it('encodes/decodes', done => {
        const bytes = [0xC, 0x0, 0xF, 0xF, 0xE, 0xE];
        const buffer = new ArrayBuffer(bytes.length);
        const view = new DataView(buffer);
        for (let i = 0; i < bytes.length; ++i) {
            view.setUint8(i, bytes[i]);
        }

        const encoded1 = Z85.encode(bytes);
        const encoded2 = Z85.encode(buffer);
        const encoded3 = Z85.encode(view);

        assert.strictEqual(encoded1, encoded2);
        assert.strictEqual(encoded2, encoded3);

        const decoded1 = Z85.decode(encoded1);
        const decoded2 = Z85.decode(encoded2);
        const decoded3 = Z85.decode(encoded3);

        assert.strictEqual(decoded1 instanceof ArrayBuffer, true);
        assert.strictEqual(decoded2 instanceof ArrayBuffer, true);
        assert.strictEqual(decoded3 instanceof ArrayBuffer, true);

        assert.strictEqual(decoded1.byteLength, bytes.length);
        assert.strictEqual(decoded2.byteLength, bytes.length);
        assert.strictEqual(decoded3.byteLength, bytes.length);

        const result1 = new DataView(decoded1);
        const result2 = new DataView(decoded2);
        const result3 = new DataView(decoded3);
        for (let i = 0; i < bytes.length; ++i) {
            assert.strictEqual(bytes[i], result1.getUint8(i));
            assert.strictEqual(bytes[i], result2.getUint8(i));
            assert.strictEqual(bytes[i], result3.getUint8(i));
        }

        done();
    });
    it('encodes subarrays', done => {
        const expected = '3&*!G4H@';
        const bytes = [0, 0, 0, 0xC, 0x0, 0xF, 0xF, 0xE, 0xE, 0, 0, 0, 0];
        const uint1 = Uint8Array.from(bytes).slice(3, -4);
        const uint2 = Uint8Array.from(bytes).subarray(3, -4);

        const encoded1 = Z85.encode(uint1);
        const encoded2 = Z85.encode(uint2);

        assert.strictEqual(encoded1.length, expected.length);
        assert.strictEqual(encoded2.length, expected.length);
        assert.strictEqual(encoded1, expected);
        assert.strictEqual(encoded2, expected);

        done();
    });
    [
        { name: 'invalid ASCII',    encoded: 'a_b', expected: "Character '_' in position 2 is not valid Z85" },
        { name: 'invalid Uniucode', encoded: '12Ø', expected: "Character 'Ø' in position 3 is not valid Z85" },
    ].forEach(test => {
        it('properly chokes on ' + test.name, done => {
            let err = null;
            try {
                Z85.decode(test.encoded);
            } catch (e) {
                err = e;
            }
            assert.strictEqual(err.message, test.expected);
            done();
        });
    });
});
