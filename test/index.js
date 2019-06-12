
const lineIntersection = require('../src/line-intersection');

const line1 = [[0,0], [1,1]];
const line2 = [[1,0], [0,1]];
const line3 = [[1,0], [2,1]]; //1 and three should never meet

const lineLayout = require('../src/layout');

const layout = lineLayout(line1);

const layedOut = layout([line1[0], line2[1], line3[1]]);
