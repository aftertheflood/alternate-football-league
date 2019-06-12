const d3 = require('d3')
const debounce = require('lodash.debounce');
const layoutFactory = require('./layout');
const {coords2vector, vector2coords} = require('./line-vector');
const colourList = require('../site/data/colours.json');
const height = 500;
const width = 500; 
const margin = {top:20,left:20, bottom:20, right:20 };

const plotWidth = width - (margin.left+margin.right);
const plotHeight = height - (margin.top+margin.bottom);

const xProp = 'turnover 2018';
const yProp = 'finishing position 2018';
let userVector = [[0,0], [width, height]]; // the line vector is in coordinate space

const colourLookup = colourList.reduce((dict, current)=>{
  dict[current.club] = current;
  return dict;
},{});

const vectorLength = Math.sqrt(width*width + height*height)

const main = () => {
  d3.tsv('data/data.tsv')
    .then((data)=>{
      setUpUI(data.columns);
      update(data);
    })
}

function extendLine(line, length){
  const features = coords2vector(line[0], line[1])
  return vector2coords(features.angle, length, line[0]);
}

function drawCharts(parent, xProperty, yProperty, imageOptions){
  const data = parent.datum();

  //work out the scales
  const xDomain = d3.extent(data, d=>Number(d[xProperty]))
  const yDomain = d3.extent(data, d=>Number(d[yProperty]))

  const xScale = d3.scaleLinear()
    .range([0, imageOptions.plotWidth])
    .domain(xDomain);
  
  const yScale = d3.scaleLinear()
    .range([0, imageOptions.plotHeight])
    .domain(yDomain);

  const layout = layoutFactory(userVector)
    .xAccessor(d=>xScale(d[xProperty]))
    .yAccessor(d=>yScale(d[yProperty])); 

  const scatterLayout = layout(data);

  // add scatter plot
  let dragging = false;
  parent.selectAll('svg.scatter')
    .data([1])
    .enter()
    .append('svg')
      .attr('width',imageOptions.width)
      .attr('height',imageOptions.height)
      .attr('class','scatter')
      .on('mousedown',function(){
        dragging=true;
      })
      .on('mouseup',function(){
        dragging=false;
      })
      .on('mousemove', function(){
        if(dragging){
          const mousePos = d3.mouse(this)
          const plotPos = [
            mousePos[0]-imageOptions.margin.left,
            mousePos[1]-imageOptions.margin.top
          ];
          userVector = [[0,0],plotPos];
          update();
        }
      })
    .append('g')
      .attr('class','plot')
      .attr('transform',`translate(${imageOptions.margin.left},${imageOptions.margin.top})`);

  // lines
  parent.select('svg.scatter .plot')
    .selectAll('line.club')
    .data(scatterLayout, d=>d.data.club)
      .enter()
    .append('line')
      .attr('class','club')
      .attr('x1', d=>d.point[0])
      .attr('y1', d=>d.point[1])
      .attr('x2', d=>d.intersectionPoint[0])
      .attr('y2', d=>d.intersectionPoint[1])
      .attr('stroke',d=>colourLookup[d.data.club].text || colourLookup[d.data.club].secondary)
      .attr('stroke-width',0);

  parent.selectAll('line.club')
    .attr('x1', d=>d.point[0])
    .attr('y1', d=>d.point[1])
    .attr('x2', d=>d.intersectionPoint[0])
    .attr('y2', d=>d.intersectionPoint[1])
    .attr('stroke-width',1);    
  
    // user set vector
  parent.select('svg.scatter .plot')
    .selectAll('line.user-vector')
    .data([extendLine(userVector, vectorLength)])
    .enter()
    .append('line')
      .attr('class','user-vector')
      .attr('x1', d=>d[0][0])
      .attr('y1', d=>d[0][1])
      .attr('x2', d=>d[1][0])
      .attr('y2', d=>d[1][1])
      .attr('stroke','#000')
      .attr('stroke-width', 2);

  parent.selectAll('line.user-vector')
    .attr('x1', d=>d[0][0])
    .attr('y1', d=>d[0][1])
    .attr('x2', d=>d[1][0])
    .attr('y2', d=>d[1][1]);

  // circles
  parent.select('svg.scatter .plot')
    .selectAll('circle.club')
    .data(scatterLayout, d=>d.data.club)
      .enter()
    .append('circle')
      .attr('class','club')
      .attr('data-club', d=>d.data.club)
      .attr('cx', d=>d.point[0])
      .attr('cy', d=>d.point[1])
      .attr('fill',d=>colourLookup[d.data.club].primary)
      .attr('stroke',d=>colourLookup[d.data.club].secondary)
      .attr('r', 0);

  parent.selectAll('circle.club')
    .transition(5)
    .attr('cx', d=>d.point[0])
    .attr('cy', d=>d.point[1])
    .attr('r', 5)

  // add position plot
  parent.selectAll('svg.position')
    .data([1])
    .enter()
    .append('svg')
      .attr('width', 300)
      .attr('height', imageOptions.height)
      .attr('class','position')
    .append('g')
      .attr('class', 'plot')
      .attr('transform',`translate(${imageOptions.margin.left},${imageOptions.margin.right})`)
  
  const sortedLayout = scatterLayout
    .sort((a,b)=>(a.distanceAlongLine - b.distanceAlongLine))
    .map((d,i)=>{
      d.adjustedRank = i+1
      return d;
    })

  const positionScale = d3.scaleLinear()
    .range([0 ,imageOptions.plotHeight, ])
    .domain([1,sortedLayout.length]);

  parent.select('svg.position .plot')
      .selectAll('text.club-name')
    .data(sortedLayout, d=>d.data.club)
      .enter()
    .append('text')
      .attr('fill',d=>colourLookup[d.data.club].text || colourLookup[d.data.club].primary)
      .attr('data-club', d=>d.data.club)
      .attr('class','club-name')
      .attr('dx','50')
      .attr('dy',5)
      .attr('transform',(d)=>`translate(0, ${positionScale(d.adjustedRank)})`)
      .text((d,i)=>`${d.adjustedRank}. ${d.data.club}`);


  parent.select('svg.position .plot')
    .selectAll('text.club-name')
    .text((d,i)=>`${d.adjustedRank}. ${d.data.club}`)
    .attr('transform', (d,i)=>`translate(0, ${positionScale(d.adjustedRank)})`);

    parent.select('svg.position .plot')
      .selectAll('line.ranking-lead')
    .data(sortedLayout, d=>d.data.club)
      .enter()
    .append('line')
      .attr('class','ranking-lead')
      .attr('x1',0)
      .attr('y1',d=>d.distanceAlongLine)
      .attr('x2',50)
      .attr('y2',d=>positionScale(d.adjustedRank))
      .attr('stroke',d=>colourLookup[d.data.club].text || colourLookup[d.data.club].secondary)
      .attr('stroke-width',1);

  parent.select('svg.position .plot')
    .selectAll('line.ranking-lead')
    .attr('y1',d=>d.distanceAlongLine)
    .attr('y2',d=>positionScale(d.adjustedRank))

  parent.select('svg.position .plot')
      .selectAll('circle.ranking-position')
    .data(sortedLayout, d=>d.data.club)
      .enter()
    .append('circle')
      .attr('class', 'ranking-position')
      .attr('r',3)
      .attr('cx',0)
      .attr('cy',d=>d.distanceAlongLine);

  parent.select('svg.position .plot')
    .selectAll('circle.ranking-position')
      .attr('cy',d=>d.distanceAlongLine)
      .attr('fill',d=>colourLookup[d.data.club].primary)
      .attr('stroke',d=>colourLookup[d.data.club].secondary);

}





function setUpUI(columns, key='club'){
  const options = columns.filter(d=>(d!=key));
  
  function addOptions(parent, opts, selected){
    parent.append('select')
      .selectAll('option')
        .data(opts)
      .enter()
        .append('option')
      .attr('value', d=>d)
      .attr('selected',d=>{
        if(d==selected) return 'selected';
        return null;
      }).text(d=>d);
  }

  d3.select('.property-selector.x')
    .call(addOptions, options, xProp)
    .on('change', update);

  d3.select('.property-selector.y')
    .call(addOptions, options, yProp)
    .on('change', update);
}

function update(data){
  const xSelector = d3.select('.property-selector.x select').node();
  const ySelector = d3.select('.property-selector.y select').node();

  if(data){
    d3.select('.viz').datum(data)
  }

  d3.select('.viz')
    .call(drawCharts, 
      xSelector[xSelector.selectedIndex].value, 
      ySelector[ySelector.selectedIndex].value,
      { height, width, margin, plotWidth, plotHeight });

}
window.onload = main;