import { SQUARE } from "./const"

export const baseBoardWhite: Int8Array = new Int8Array([
  SQUARE.WROOK, SQUARE.WKNIGHT, SQUARE.WBISHOP, SQUARE.WQUEEN,
  SQUARE.WKING, SQUARE.WBISHOP, SQUARE.WKNIGHT, SQUARE.WROOK,
  ...Array(8).fill(SQUARE.WPAWN),
  ...Array(32).fill(SQUARE.EMPTY),
  ...Array(8).fill(SQUARE.BPAWN),
  SQUARE.BROOK, SQUARE.BKNIGHT, SQUARE.BBISHOP, SQUARE.BQUEEN,
  SQUARE.BKING, SQUARE.BBISHOP, SQUARE.BKNIGHT, SQUARE.BROOK,
])

export const baseBoardBlack: Int8Array = new Int8Array([
  SQUARE.BROOK, SQUARE.BKNIGHT, SQUARE.BBISHOP, SQUARE.BQUEEN,
  SQUARE.BKING, SQUARE.BBISHOP, SQUARE.BKNIGHT, SQUARE.BROOK,
  ...Array(8).fill(SQUARE.BPAWN),
  ...Array(32).fill(SQUARE.EMPTY),
  ...Array(8).fill(SQUARE.WPAWN),
  SQUARE.WROOK, SQUARE.WKNIGHT, SQUARE.WBISHOP, SQUARE.WQUEEN,
  SQUARE.WKING, SQUARE.WBISHOP, SQUARE.WKNIGHT, SQUARE.WROOK,
])

export const isBlack = (square: number): boolean => {
  return 6 <= square && square <= 11
}

export const isWhite = (square: number): boolean => {
  return square <= 5
}
