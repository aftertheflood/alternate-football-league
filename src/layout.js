// the layout is
/* [
  {
    point: [Number, Number],
    pointOnLine: [Number, Number],
    distanceAlongLine: Number
    data:{ ...the original data row...}
  }
] */

const intersection = require('./line-intersection');
const { vector2coords, coords2vector } = require('./line-vector');

function layoutFactory(line) { // line is defined as [[x1,y1], [x2,y2]]
  let xAccessor = d=>d[0];
  let yAccessor = d=>d[1];

  const lineVector = coords2vector(line[0], line[1]);

  function layout(data){

    return data.map(d => {
      const x = xAccessor(d);
      const y = yAccessor(d);
      const perpendicularLine = vector2coords(lineVector.normal, 1, [x,y])  //a unit vector
      const intersectionPoint = intersection(perpendicularLine, line);

      return {
        point: [xAccessor(d), yAccessor(d)],
        intersectionPoint,
        distanceAlongLine: coords2vector(line[0], intersectionPoint).length,
        data: d
      }
    });
  }

  layout.lineAngle = ()=>{
    return lineVector.angle;
  }

  layout.xAccessor = (f)=>{
    if(!f) return xAccessor;
    xAccessor = f;
    return layout;
  }

  layout.yAccessor = (f)=>{
    if(!f) return yAccessor;
    yAccessor = f;
    return layout;
  }

  return layout;
}

module.exports = layoutFactory;