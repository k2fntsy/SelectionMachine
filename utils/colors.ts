export const PASTEL_COLORS = [
  '#F87171', // Red
  '#FB923C', // Orange
  '#FACC15', // Yellow
  '#4ADE80', // Green
  '#2DD4BF', // Teal
  '#38BDF8', // Sky
  '#818CF8', // Indigo
  '#C084FC', // Purple
  '#F472B6', // Pink
  '#FB7185', // Rose
];

export const getRandomColor = () => {
  return PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)];
};