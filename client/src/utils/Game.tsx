export const isBlack = (piece: string): boolean => {
  return piece.charCodeAt(0) >= 97
}

export const isWhite = (piece: string): boolean => {
  return piece.charCodeAt(0) < 97
}
