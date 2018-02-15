'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _marked = /*#__PURE__*/regeneratorRuntime.mark(hey);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var math = require('mathjs');

var FunctionVisualize = exports.FunctionVisualize = function () {
    function FunctionVisualize(context, padding) {
        _classCallCheck(this, FunctionVisualize);

        this.context = context;
        this.expression = {};
        this.samples = [];
        this.padding = padding;

        this.background = 'white';
        this.lineColor = 'black';
        this.strokeWeight = 2;
        this._defaultBounds = {
            xmin: 0,
            xmax: 1,
            ymin: 0,
            ymax: 1
        };
    }

    _createClass(FunctionVisualize, [{
        key: 'setExpression',
        value: function setExpression(expression) {
            this.expression = math.compile(expression);
        }
    }, {
        key: 'calcSamples',
        value: function calcSamples(numSamples, bounds) {
            var stepSize = (bounds.xmax - bounds.xmin) / numSamples; //Evenly space samples.
            this.samples = []; //Clear samples.
            for (var i = 0; i < numSamples; i++) {
                var x = 0 + i * stepSize;
                var y = this.expression.eval({ x: x });
                this.samples.push([x, y]);
            }
        }
    }, {
        key: 'visualize',
        value: function visualize(expression) {
            var _this = this;

            var numSamples = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1000;
            var bounds = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this._defaultBounds;

            this.setExpression(expression);
            this.calcSamples(numSamples, bounds);

            var height = this.context.canvas.height;
            var width = this.context.canvas.width;

            //Reset canvas and draw function
            this.context.clearRect(this.padding.left, this.padding.top, width - (this.padding.left + this.padding.right), height - (this.padding.top + this.padding.bottom));

            this.context.fillStyle = this.background;
            this.context.fillRect(this.padding.left, this.padding.top, width - (this.padding.left + this.padding.right), height - (this.padding.top + this.padding.bottom));

            var scaledPoints = this.scalePoints(width, height, bounds);
            this.context.beginPath();
            console.log(scaledPoints.next());
            // this.context.moveTo(...scaledPoints.next());
            //Visualize in the box 0-1;
            this.samples.forEach(function (sample) {
                //scale x and y coordinates
                var x = width * (sample[0] - bounds.xmin) / (bounds.xmax - bounds.xmin);
                var y = height * (sample[1] - bounds.ymin) / (bounds.ymax - bounds.ymin);
                _this.context.lineTo(x, y);
            });
            this.context.stroke();
            this.context.closePath();
        }
    }, {
        key: 'scalePoints',
        value: /*#__PURE__*/regeneratorRuntime.mark(function scalePoints(width, height, bounds) {
            var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, sample, x, y;

            return regeneratorRuntime.wrap(function scalePoints$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _iteratorNormalCompletion = true;
                            _didIteratorError = false;
                            _iteratorError = undefined;
                            _context.prev = 3;
                            _iterator = this.samples[Symbol.iterator]();

                        case 5:
                            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                                _context.next = 14;
                                break;
                            }

                            sample = _step.value;
                            x = width * (sample[0] - bounds.xmin) / (bounds.xmax - bounds.xmin);
                            y = height * (sample[1] - bounds.ymin) / (bounds.ymax - bounds.ymin);
                            _context.next = 11;
                            return [x, y];

                        case 11:
                            _iteratorNormalCompletion = true;
                            _context.next = 5;
                            break;

                        case 14:
                            _context.next = 20;
                            break;

                        case 16:
                            _context.prev = 16;
                            _context.t0 = _context['catch'](3);
                            _didIteratorError = true;
                            _iteratorError = _context.t0;

                        case 20:
                            _context.prev = 20;
                            _context.prev = 21;

                            if (!_iteratorNormalCompletion && _iterator.return) {
                                _iterator.return();
                            }

                        case 23:
                            _context.prev = 23;

                            if (!_didIteratorError) {
                                _context.next = 26;
                                break;
                            }

                            throw _iteratorError;

                        case 26:
                            return _context.finish(23);

                        case 27:
                            return _context.finish(20);

                        case 28:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, scalePoints, this, [[3, 16, 20, 28], [21,, 23, 27]]);
        })
    }]);

    return FunctionVisualize;
}();

function hey() {
    var array, i;
    return regeneratorRuntime.wrap(function hey$(_context2) {
        while (1) {
            switch (_context2.prev = _context2.next) {
                case 0:
                    array = [3, 3, 3, 3, 3];
                    i = 0;

                case 2:
                    if (!(i < array.length)) {
                        _context2.next = 8;
                        break;
                    }

                    _context2.next = 5;
                    return i;

                case 5:
                    i++;
                    _context2.next = 2;
                    break;

                case 8:
                    _context2.next = 10;
                    return 'hello';

                case 10:
                case 'end':
                    return _context2.stop();
            }
        }
    }, _marked, this);
}