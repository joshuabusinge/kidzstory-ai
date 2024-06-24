const cleanTitle = (title: string): string =>
  title
    .replace(/[-/\\[\]]/g, " ") // Remove specified characters
    .replace(/\s+/g, " ") // Remove all whitespace
    .trim(); // Trim whitespace from both ends

export default cleanTitle;
