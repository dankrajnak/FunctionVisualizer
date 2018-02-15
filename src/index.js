// @flow
import {FunctionVisualize} from './FunctionVisualize';
import type {Bounds, Padding} from './FunctionVisualize';

let canvas = ((document.getElementById('canvas'): any): HTMLCanvasElement)

let context = canvas.getContext('2d');
let padding = {
    left: 60,
    top: 100,
    right: 60,
    bottom: 300.
}
let visualizer = new FunctionVisualize(context, padding);

canvas.setAttribute('width', window.innerWidth);
canvas.setAttribute('height', window.innerHeight);

let bounds: Bounds = {
    xmax: 10,
    xmin: 0,
    ymax: 10,
    ymin: -10,
}
visualizer.lineColor = '#F4F5F0';
visualizer.background = '#101820';
visualizer.lineWidth = 4;
visualizer.clearCanvas();

function visualizeIncremental(numPoints){
    if(numPoints<500){
        visualizer.visualize('sin(2x)', numPoints, bounds);
        setTimeout(()=>{
            visualizeIncremental(numPoints+1);
        }, 200);
    }
}
let startingEquation = '3sin(x)';


visualizer.visualize(startingEquation, true, bounds, 1000);

document.getElementById('functionInput').setAttribute('value', startingEquation);

document.getElementById('functionInput').onkeydown = (e)=>{
    if(e.keyCode == 13){
        visualizer.clearCanvas()
        visualizer.visualize(e.target.value, true, bounds, 1000);
    }
}
