'use strict'
// Number.MAX_SAFE_INTEGER
const MAX_SAFE_INTEGER = 9007199254740991

function checkUInt53 (n: number): void {
  if (n < 0 || n > MAX_SAFE_INTEGER || n % 1 !== 0) throw new RangeError('value out of range')
}

export function encode (n: number, buffer?: Uint8Array, offset?: number): { buffer: Uint8Array, bytes: number } {
  checkUInt53(n)

  if (offset === undefined) offset = 0

  if (buffer === undefined) {
    buffer = new Uint8Array(encodingLength(n))
  }

  let bytes = 0

  // 8 bit
  if (n < 0xfd) {
    buffer.set([n], offset)
    bytes = 1

  // 16 bit
  } else if (n <= 0xffff) {
    const dataview = new DataView(new ArrayBuffer(2))
    dataview.setUint16(0, n, true)
    buffer.set([0xfd], offset)
    buffer.set(new Uint8Array(dataview.buffer), offset + 1)

    // buffer.writeUInt16LE(n, offset + 1)
    bytes = 3

  // 32 bit
  } else if (n <= 0xffffffff) {
    const dataview = new DataView(new ArrayBuffer(4), 0, 4)
    dataview.setUint32(0, n, true)
    buffer.set([0xfe], offset)
    buffer.set(new Uint8Array(dataview.buffer), offset + 1)

    // buffer.writeUInt8(0xfe, offset)
    // buffer.writeUInt32LE(n, offset + 1)
    bytes = 5

  // 64 bit
  } else {
    const dataview = new DataView(new ArrayBuffer(8), 0, 8)
    dataview.setBigUint64(0, BigInt(n), true)

    buffer.set([0xff], offset)
    buffer.set(new Uint8Array(dataview.buffer), offset + 1)

    bytes = 9
  }

  return { buffer, bytes }
}

export function decode (buffer: Uint8Array, offset?: number): { value: number, bytes: number } {
  if (offset === undefined) offset = 0

  const first = buffer.at(offset)
  if (first === undefined) throw new Error('buffer too small')

  const dataview = new DataView(new Uint8Array(buffer).buffer)

  // 8 bit
  if (first < 0xfd) {
    return { value: first, bytes: 1 }

  // 16 bit
  } else if (first === 0xfd) {
    return { value: dataview.getUint16(offset + 1, true), bytes: 3 }

  // 32 bit
  } else if (first === 0xfe) {
    return { value: dataview.getUint32(offset + 1, true), bytes: 5 }

  // 64 bit
  } else {
    const number = dataview.getBigUint64(offset + 1, true)
    checkUInt53(+number.toString())

    return { value: +number.toString(), bytes: 9 }
  }
}

export function encodingLength (n: number): number {
  checkUInt53(n)

  return (
    n < 0xfd
      ? 1
      : n <= 0xffff
        ? 3
        : n <= 0xffffffff
          ? 5
          : 9
  )
}
