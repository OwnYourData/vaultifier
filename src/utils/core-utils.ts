export const onlyContains = (value: string, ...allowedChars: string[]): boolean => {
  for (const char of value) {
    if (allowedChars.indexOf(char) === -1)
      return false;
  }

  return true;
}

export const onlyContainsHex = (value: string) => onlyContains(value, ...('abcdef1234567890'));