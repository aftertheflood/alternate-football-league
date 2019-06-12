
function coords2vector([x1,y1], [x2,y2]){
  const length = Math.sqrt(((x2-x1)*(x2-x1)) + ((y2-y1)*(y2-y1)))
  const angle = Math.atan((y2-y1)/(x2-x1));
  return {
    angle,
    length,
    normal: (Math.PI/2)+angle 
  };
}

function vector2coords(angle, length, origin){
  if(!origin) origin = [0, 0];
  const x = origin[0] + length * Math.cos(angle);
  const y = origin[1] + length * Math.sin(angle);
  return [origin, [x, y]];
}

module.exports = { coords2vector, vector2coords };