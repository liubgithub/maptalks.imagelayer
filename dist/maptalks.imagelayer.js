/*!
 * maptalks.imagelayer v0.4.1
 * LICENSE : MIT
 * (c) 2016-2018 maptalks.org
 */
/*!
 * requires maptalks@>=0.32.0 
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('maptalks')) :
	typeof define === 'function' && define.amd ? define(['exports', 'maptalks'], factory) :
	(factory((global.maptalks = global.maptalks || {}),global.maptalks));
}(this, (function (exports,maptalks) { 'use strict';

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

/**
 * reference:
 * https://github.com/Esri/esri-leaflet/blob/master/src/Layers/ImageLayer.js
 */
var options = {
    renderer: maptalks.Browser.webgl ? 'gl' : 'canvas',
    crossOrigin: null
};

var ImageLayer = function (_maptalks$Layer) {
    _inherits(ImageLayer, _maptalks$Layer);

    function ImageLayer(id) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, ImageLayer);

        var _this = _possibleConstructorReturn(this, _maptalks$Layer.call(this, id, options));

        _this._options = options;
        _this._images = options.images;
        _this._extent = options.extent;
        return _this;
    }

    ImageLayer.prototype.onLoad = function onLoad() {
        var _this2 = this;

        if (this.imgData && this.imgData.length > 0) {
            return true;
        }
        this.imgData = [];
        var len = this._images.length;

        var _loop = function _loop(i) {
            var img = new Image();
            img.src = _this2._images[i].url;
            img.crossOrigin = _this2._options.crossOrigin;
            img.onload = function () {
                _this2.imgData.push({
                    img: img,
                    extent: _this2._images[i].extent
                });
                if (i === len - 1) {
                    _this2.load();
                }
            };
        };

        for (var i = 0; i < len; i++) {
            _loop(i);
        }
        return false;
    };

    //check whether image is in map's extent


    ImageLayer.prototype._isInExtent = function _isInExtent(extent) {
        var map = this.getMap();
        var mapExtent = map.getExtent();
        var intersection = mapExtent.intersection(new maptalks.Extent(extent));
        if (intersection) {
            return true;
        } else return false;
    };

    return ImageLayer;
}(maptalks.Layer);

ImageLayer.mergeOptions(options);

var ImageCanvasRenderer = function (_maptalks$renderer$Ca) {
    _inherits(ImageCanvasRenderer, _maptalks$renderer$Ca);

    function ImageCanvasRenderer() {
        _classCallCheck(this, ImageCanvasRenderer);

        return _possibleConstructorReturn(this, _maptalks$renderer$Ca.apply(this, arguments));
    }

    ImageCanvasRenderer.prototype.onAdd = function onAdd() {};

    ImageCanvasRenderer.prototype.needToRedraw = function needToRedraw() {
        var map = this.layer.getMap();
        if (map.isZooming()) {
            return false;
        }
        if (map.isMoving()) {
            return false;
        }
        return _maptalks$renderer$Ca.prototype.needToRedraw.call(this);
    };

    ImageCanvasRenderer.prototype.draw = function draw() {
        this.prepareCanvas();
        this._drawImages();
    };

    ImageCanvasRenderer.prototype._drawImages = function _drawImages() {
        if (this.layer.imgData && this.layer.imgData.length > 0) {
            for (var i = 0; i < this.layer.imgData.length; i++) {
                this._drawImage(this.layer.imgData[i]);
            }
            this.completeRender();
        }
    };

    ImageCanvasRenderer.prototype._drawImage = function _drawImage(imgObject) {
        var extent = new maptalks.Extent(imgObject.extent);
        if (this.layer._isInExtent(extent)) {
            var imgExtent = this._buildDrawParams(extent);
            this.context.drawImage(imgObject.img, imgExtent.x, imgExtent.y, imgExtent.width, imgExtent.height);
        }
    };

    ImageCanvasRenderer.prototype._buildDrawParams = function _buildDrawParams(extent) {
        var nw = new maptalks.Coordinate(extent.xmin, extent.ymax);
        var se = new maptalks.Coordinate(extent.xmax, extent.ymin);
        var lt = this.layer.getMap().coordinateToContainerPoint(nw);
        var rb = this.layer.getMap().coordinateToContainerPoint(se);
        var width = rb.x - lt.x;
        var height = rb.y - lt.y;
        return {
            x: lt.x,
            y: lt.y,
            width: width,
            height: height
        };
    };

    ImageCanvasRenderer.prototype.drawOnInteracting = function drawOnInteracting() {
        this.draw();
    };

    ImageCanvasRenderer.prototype.hitDetect = function hitDetect() {
        return false;
    };

    ImageCanvasRenderer.prototype.onZoomEnd = function onZoomEnd(e) {
        _maptalks$renderer$Ca.prototype.onZoomEnd.call(this, e);
    };

    ImageCanvasRenderer.prototype.onMoveEnd = function onMoveEnd(e) {
        _maptalks$renderer$Ca.prototype.onMoveEnd.call(this, e);
    };

    ImageCanvasRenderer.prototype.onDragRotateEnd = function onDragRotateEnd(e) {
        _maptalks$renderer$Ca.prototype.onDragRotateEnd.call(this, e);
    };

    return ImageCanvasRenderer;
}(maptalks.renderer.CanvasRenderer);

ImageLayer.registerRenderer('canvas', ImageCanvasRenderer);

ImageLayer.registerRenderer('gl', function (_maptalks$renderer$Im) {
    _inherits(_class, _maptalks$renderer$Im);

    function _class() {
        _classCallCheck(this, _class);

        return _possibleConstructorReturn(this, _maptalks$renderer$Im.apply(this, arguments));
    }

    //override to set to always drawable
    _class.prototype.isDrawable = function isDrawable() {
        return true;
    };

    _class.prototype.needToRedraw = function needToRedraw() {
        var map = this.getMap();
        if (map.isZooming()) {
            return true;
        }
        if (map.isMoving()) {
            return true;
        }
        if (map.isRotating()) {
            return true;
        }
        return _maptalks$renderer$Im.prototype.needToRedraw.call(this);
    };

    _class.prototype.draw = function draw() {
        this.prepareCanvas();
        this._drawImages();
    };

    _class.prototype._drawImages = function _drawImages() {
        if (this.layer.imgData && this.layer.imgData.length > 0) {
            for (var i = 0; i < this.layer.imgData.length; i++) {
                this._drawImage(this.layer.imgData[i]);
            }
            this.completeRender();
        }
    };

    _class.prototype._drawImage = function _drawImage(imgObject) {
        var map = this.getMap(),
            glZoom = map.getGLZoom();
        var extent = new maptalks.Extent(imgObject.extent);
        if (this.layer._isInExtent(extent)) {
            var nw = new maptalks.Coordinate(extent.xmin, extent.ymax);
            var se = new maptalks.Coordinate(extent.xmax, extent.ymin);
            var lt = this.layer.getMap()._prjToPoint(nw, glZoom);
            var rb = this.layer.getMap()._prjToPoint(se, glZoom);
            var width = rb.x - lt.x;
            var height = rb.y - lt.y;
            this.drawGLImage(imgObject.img, lt.x, lt.y, width, height, 1.0);
        }
    };

    _class.prototype.drawOnInteracting = function drawOnInteracting() {
        this.draw();
    };

    _class.prototype.onCanvasCreate = function onCanvasCreate() {
        this.prepareGLCanvas();
    };

    _class.prototype.resizeCanvas = function resizeCanvas(canvasSize) {
        if (!this.canvas) {
            return;
        }
        _maptalks$renderer$Im.prototype.resizeCanvas.call(this, canvasSize);
        this.resizeGLCanvas();
    };

    _class.prototype.clearCanvas = function clearCanvas() {
        if (!this.canvas) {
            return;
        }
        _maptalks$renderer$Im.prototype.clearCanvas.call(this);
        this.clearGLCanvas();
    };

    _class.prototype.getCanvasImage = function getCanvasImage() {
        if (this.glCanvas && this.isCanvasUpdated()) {
            var ctx = this.context;
            if (maptalks.Browser.retina) {
                ctx.save();
                ctx.scale(1 / 2, 1 / 2);
            }
            // draw gl canvas on layer canvas
            ctx.drawImage(this.glCanvas, 0, 0);
            if (maptalks.Browser.retina) {
                ctx.restore();
            }
        }
        return _maptalks$renderer$Im.prototype.getCanvasImage.call(this);
    };

    _class.prototype.onRemove = function onRemove() {
        this.removeGLCanvas();
    };

    return _class;
}(maptalks.renderer.ImageGLRenderable(ImageCanvasRenderer)));

exports.ImageLayer = ImageLayer;

Object.defineProperty(exports, '__esModule', { value: true });

typeof console !== 'undefined' && console.log('maptalks.imagelayer v0.4.1, requires maptalks@>=0.32.0.');

})));
