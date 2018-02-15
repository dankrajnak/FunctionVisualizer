// @flow
let math = require('mathjs');

export type Bounds = {
    xmin: number,
    xmax: number,
    ymin: number,
    ymax: number,
}

export type Padding = {
    left: number,
    top: number,
    bottom: number,
    right: number,
}


export class FunctionVisualize {
    context: CanvasRenderingContext2D;
    expression: Object;
    samples: number[][];
    padding: Padding;
    background: string;
    lineColor: string;
    lineWidth: number;

    _defaultBounds: Bounds;
    // Quadratic ease-in ease-out
    _defaultEasingFunction: number => number;

    /**
     * Creates a FunctionVisualize instance which draws on the context with
     * a given padding.
     * @param {CanvasRedneringContext2D} context context of HTML5 canvas
     * @param {Padding} padding specifies the space around the visualization to
     *  the edge of the canvas.
     */
    constructor(context: CanvasRenderingContext2D, padding: Padding) {
        this.context = context;
        this.expression = {};
        this.samples = [];
        this.padding = padding;

        this.background = 'white';
        this.lineColor = 'black';
        this.lineWidth = 2;

        this._defaultBounds = {
            xmin: 0,
            xmax: 1,
            ymin: 0,
            ymax: 1,
        }

        //Quad ease-in-out.
        this._defaultEasingFunction = (t) => {
            return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t
        }

    }

    /**
     * Prepares the expression for further evaluation
     * @param {string} expression the expression to be visualized
     */
    setExpression(expression: string) {
        try {
            this.expression = math.compile(expression)
        } catch (e) {
            console.error('Problem parsing expression: ' + expression);
            this.expression = math.compile(0);
        }
    }

    /**
     * Uniformly distribute points around bounds, calculate value of function
     * at those points.
     */
    calcSamples(bounds: Bounds, numSamples: number) {
        let stepSize = (bounds.xmax - bounds.xmin) / numSamples; //Evenly space samples.
        this.samples = []; //Clear samples.
        for (let i = 0; i < numSamples; i++) {
            let x = bounds.xmin + i * stepSize;
            let y = this.expression.eval({x: x});
            this.samples.push([x, y]);
        }
    }

    drawPoint(point: number[], bounds: Bounds, pointScaler: (number[])=>number[]){
        let [x,y] = point;
        if(y < bounds.ymin || y > bounds.ymax){
            this.context.moveTo(...pointScaler(point));
        } else {
            this.context.lineTo(...pointScaler(point));
        }
    }

    /**
     * Clears entire canvas and fills it with the current background color.
     */
    clearCanvas() {
        let height = this.context.canvas.height;
        let width = this.context.canvas.width;
        this.context.clearRect(0, 0, width, height);
        this.context.fillStyle = this.background;
        this.context.fillRect(0, 0, width, height);
    }

    /**
     * Clears area in canvas where function is displayed.
     * TODO: what if canvas is resized? width or height - padding no longer reflects
     * where the function is drawn.
     */
    clearFunctionArea() {
        let height = this.context.canvas.height;
        let width = this.context.canvas.width;

        this.context.clearRect(
            this.padding.left,
            this.padding.top,
            width - (this.padding.left + this.padding.right),
            height - (this.padding.top + this.padding.bottom));

        this.context.fillStyle = this.background;
        this.context.fillRect(
            this.padding.left,
            this.padding.top,
            width - (this.padding.left + this.padding.right),
            height - (this.padding.top + this.padding.bottom));
    }

    /**
     * Draws the expression on the canvas.
     * @param {string} expression the mathematical expression to be visualized
     * @param {bool} ease specify whether function will perform ease-in on display.
     * @param {Bounds} bounds [optional] bounds within which the function will be
     *   displayed.
     * @param {number} numSamples [optional] number of points to be connected to
     *   visualize the expression.
     */
    visualize(expression: string, ease: bool = true, bounds: Bounds = this._defaultBounds,
        numSamples: number = 1000) {

        this.setExpression(expression);
        this.calcSamples(bounds, numSamples);

        let height = this.context.canvas.height;
        let width = this.context.canvas.width;
        // Set the line width and color
        this.context.lineWidth = this.lineWidth;
        this.context.strokeStyle = this.lineColor;

        // Get function which puts the samples in terms of canvas coordinates.
        let scalePoint = this.getPointsScaler(width, height, bounds);

        if (ease) {
            this._plotWithEase(bounds, scalePoint);
        } else {
            this._plotWithoutEase(bounds, scalePoint);
        }


    }

    /**
     * I really wanted to make a generator for this, but babel-polyfill with
     * browserify was harder than I thought.  Oh well.
     *
     * This creates a function which takes in a sample point generated with the
     * given bounds, and transfers that point to be in terms of coordinates on
     * canvas, taking into account canvas width, height, and padding.
     *
     * @param {number} width  width of drawable area. (Canvas width - padding)
     * @param {number} height  height of drawable area (Canvas height - padding)
     * @param {Bounds} bounds  bounds on the expression
     */
    getPointsScaler(width: number, height: number, bounds: Bounds): (number[]) => number[] {
        let realWidth = width - (this.padding.left + this.padding.right);
        let realHeight = height - (this.padding.top + this.padding.bottom);
        return (sample: number[]) => {
            let x = this.padding.left + realWidth * (sample[0] - bounds.xmin) / (bounds.xmax - bounds.xmin);
            // y has to be drawn from the bottom up.
            let y = height - this.padding.bottom - realHeight * (sample[1] - bounds.ymin) / (bounds.ymax - bounds.ymin);
            return [x, y];
        }
    }

    diferentiate(ease: bool = true, bounds: Bounds = this._defaultBounds){
        //Find the slopes of all the lines in-between samples.
        let slopes = [];

        let height = this.context.canvas.height;
        let width = this.context.canvas.width;

        // Set the line width and color
        this.context.lineWidth = this.lineWidth;
        this.context.strokeStyle = this.lineColor;

        // Get function which puts the samples in terms of canvas coordinates.
        let scalePoint = this.getPointsScaler(width, height, bounds);

        //All points are equally spaced in x-direction, so we only need to calculate
        //this once.
        let xStep = 1;
        if(this.samples.length>1){
            xStep = this.samples[1][0] - this.samples[0][0];
        }

        for(let i =0; i<this.samples.length-1; i++){
            slopes.push([this.samples[i][0],
                (this.samples[i+1][1]-this.samples[i][1])/xStep]);
        }
        this.samples = slopes;

        if(ease){
            this._plotWithEase(bounds, scalePoint)
        } else{
            this._plotWithoutEase(bounds, scalePoint)
        }

    }

    integrate(ease: bool = true, bounds: Bounds = this._defaultBounds){
        //Find the area under all the line segments.
        let sums = [];

        let height = this.context.canvas.height;
        let width = this.context.canvas.width;

        // Set the line width and color
        this.context.lineWidth = this.lineWidth;
        this.context.strokeStyle = this.lineColor;

        // Get function which puts the samples in terms of canvas coordinates.
        let scalePoint = this.getPointsScaler(width, height, bounds);

        //All points are equally spaced in x-direction, so we only need to calculate
        //this once.
        let xStep = 1;
        if(this.samples.length>1){
            xStep = this.samples[1][0] - this.samples[0][0];
        }

        let sumSoFar = 0;
        for(let i=0; i<this.samples.length-1; i++){
            //We can calculate the area under each line segment by averaging the
            //the y-values of the two points and treating it like a rectangle
            //with the height inbetween the two points.
            sumSoFar += (this.samples[i][1]+this.samples[i+1][1])/2*xStep;

            //Average the two x-points.
            sums.push([(this.samples[i][0]+this.samples[i+1][0])/2,
                sumSoFar]);
        }
        this.samples = sums;

        if(ease){
            this._plotWithEase(bounds, scalePoint)
        } else{
            this._plotWithoutEase(bounds, scalePoint)
        }

    }

    showDensityTree(bounds: Bounds){
        
    }

    _plotWithEase(bounds: Bounds, scalePoint: (number[])=> number[]){
        // According to the default easing function, draw the function
        // incrementally.

        let frameRate = 1000/60 // 60 times a second specified in miliseconds
        let animationLength = 2000 // 2 seconds.

        // We need to take frameRate*animationLength steps mapped to the range
        // 0 to 1 to be compatible with an easing function.
        let easeStep = 1/(animationLength/frameRate);

        //The last sample we drew.
        let previousSample = 0;

        let drawFromPointToPoint = (from: number, to: number)=>{

            this.context.beginPath()
            let points = this.samples.slice(from, to);

            //slice does not include last number.
            if(to<this.samples.length){
                points.push(this.samples[to]);
            }

            for(let point of points){
                this.drawPoint(point, bounds, scalePoint);
            }
            this.context.stroke();
            this.context.closePath();
        }

        //Ok, we're going to set a lot of timeOuts.
        let counter = 0;
        for(let easeX = 0; easeX<=1; easeX+=easeStep){
            counter++;
            let nextSample = Math.ceil(this._defaultEasingFunction(easeX)*this.samples.length)
            setTimeout(()=>{
                window.requestAnimationFrame(()=>{
                    //overlap the segments a little
                    if(previousSample > 0)
                        previousSample--;
                    drawFromPointToPoint(previousSample, nextSample)
                    previousSample = nextSample;
                });
            }, frameRate*counter);
        }
    }

    _plotWithoutEase(bounds: Bounds, scalePoint: (number[])=>number[]){
        // Just draw all the points at once.
        this.context.beginPath();
        // Move to first point
        this.context.moveTo(...scalePoint(this.samples[0]));
        this.samples.forEach(sample => {
            this.drawPoint(sample, bounds, scalePoint);
        });
        this.context.stroke();
        this.context.closePath();
    }

}
