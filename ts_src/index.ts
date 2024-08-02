'use strict'

import * as tools from 'uint8array-tools'

const checkUInt64 = (n: bigint): void => {
  if (n < 0 || n > 0xffffffffffffffffn) {
    throw new RangeError('value out of range')
  }
}

export function encode (
  n: bigint,
  buffer?: Uint8Array,
  offset?: number
): { buffer: Uint8Array, bytes: number } {
  checkUInt64(n)
  if (offset === undefined) offset = 0

  if (buffer === undefined) {
    buffer = new Uint8Array(encodingLength(n))
  }

  let bytes = 0

  // 8 bit
  if (n < 0xfd) {
    buffer.set([Number(n)], offset)
    bytes = 1

    // 16 bit
  } else if (n <= 0xffff) {
    buffer.set([0xfd], offset)
    tools.writeUInt16(buffer, offset + 1, Number(n), 'LE')

    bytes = 3

    // 32 bit
  } else if (n <= 0xffffffff) {
    buffer.set([0xfe], offset)
    tools.writeUInt32(buffer, offset + 1, Number(n), 'LE')

    bytes = 5

    // 64 bit
  } else {
    buffer.set([0xff], offset)
    tools.writeUInt64(buffer, offset + 1, n, 'LE')

    bytes = 9
  }

  return { buffer, bytes }
}

export function decode (
  buffer: Uint8Array,
  offset?: number
): { value: bigint, bytes: number } {
  if (offset === undefined) offset = 0

  const first = buffer.at(offset)
  if (first === undefined) throw new Error('buffer too small')

  // 8 bit
  if (first < 0xfd) {
    return { value: BigInt(first), bytes: 1 }

    // 16 bit
  } else if (first === 0xfd) {
    return {
      value: BigInt(tools.readUInt16(buffer, offset + 1, 'LE')),
      bytes: 3
    }

    // 32 bit
  } else if (first === 0xfe) {
    return {
      value: BigInt(tools.readUInt32(buffer, offset + 1, 'LE')),
      bytes: 5
    }

    // 64 bit
  } else {
    const number = tools.readUInt64(buffer, offset + 1, 'LE')

    return { value: number, bytes: 9 }
  }
}

export function encodingLength (n: bigint): number {
  checkUInt64(n)
  return n < 0xfd ? 1 : n <= 0xffff ? 3 : n <= 0xffffffff ? 5 : 9
}
