
function lineIntersection(
  [[l1x1, l1y1], [l1x2, l1y2]], 
  [[l2x1, l2y1], [l2x2, l2y2]] ) {
  // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite)
  const denominator = ((l2y2 - l2y1) * (l1x2 - l1x1)) - ((l2x2 - l2x1) * (l1y2 - l1y1));
  
  let a = l1y1 - l2y1;
  let b = l1x1 - l2x1;
  const numerator1 = ((l2x2 - l2x1) * a) - ((l2y2 - l2y1) * b);
  const numerator2 = ((l1x2 - l1x1) * a) - ((l1y2 - l1y1) * b);
  a = numerator1 / denominator;
  b = numerator2 / denominator;

  // if we cast these lines infinitely in both directions, they intersect here:
  return [l1x1 + (a * (l1x2 - l1x1)), l1y1 + (a * (l1y2 - l1y1))]; // [x,y]
};

module.exports = lineIntersection;