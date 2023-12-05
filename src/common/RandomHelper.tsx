export function getRandomRoundNumber(matrixSize: number) {
  return Math.round(Math.random() * matrixSize);
}

export function generateUniqueRandomPositions(
  count: number,
  matrixSize: number,
) {
  const positionsSet = new Set();

  while (positionsSet.size < count) {
    const position = [
      getRandomRoundNumber(matrixSize),
      getRandomRoundNumber(matrixSize),
    ];
    const positionString = JSON.stringify(position);

    // Check if the position is unique
    if (!positionsSet.has(positionString)) {
      positionsSet.add(positionString);
    }
  }

  // Convert Set back to an array of arrays
  return Array.from(positionsSet).map((pos) => JSON.parse(pos as string));
}
