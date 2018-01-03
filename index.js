import * as maptalks from 'maptalks';

const options = {
    renderer: maptalks.Browser.webgl ? 'gl' : 'canvas',
    crossOrigin: null
};

export class ImageLayer extends maptalks.Layer {

    constructor(id, options = {}) {
        super(id, options);
        this._options = options;
        this._images = options.images;
        this._extent = options.extent;
    }

    onLoad() {
        if (this.imgData && this.imgData.length > 0) {
            return true;
        }
        this.imgData = [];
        const len = this._images.length;
        for (let i = 0; i < len; i++) {
            const img = new Image();
            img.src = this._images[i].url;
            img.crossOrigin = this._options.crossOrigin;
            img.onload = () => {
                this.imgData.push({
                    img:img,
                    extent:this._images[i].extent
                });
                if (i === len - 1) {
                    this.load();
                }
            };
        }
        return false;
    }

    //check whether image is in map's extent
    _isInExtent(extent) {
        const map = this.getMap();
        const mapExtent = map.getExtent();
        const intersection = mapExtent.intersection(new maptalks.Extent(extent));
        if (intersection) {
            return true;
        } else
            return false;
    }
}

ImageLayer.mergeOptions(options);

class ImageCanvasRenderer extends maptalks.renderer.CanvasRenderer {

    onAdd() {

    }

    needToRedraw() {
        const map = this.layer.getMap();
        if (map.isZooming()) {
            return false;
        }
        if (map.isMoving()) {
            return false;
        }
        return super.needToRedraw();
    }

    draw() {
        this.prepareCanvas();
        this._drawImages();
    }

    _drawImages() {
        if (this.layer.imgData && this.layer.imgData.length > 0) {
            for (let i = 0; i < this.layer.imgData.length; i++) {
                this._drawImage(this.layer.imgData[i]);
            }
            this.completeRender();
        }
    }

    _drawImage(imgObject) {
        const extent = new maptalks.Extent(imgObject.extent);
        if (this.layer._isInExtent(extent)) {
            const imgExtent = this._buildDrawParams(extent);
            this.context.drawImage(imgObject.img, imgExtent.x, imgExtent.y, imgExtent.width, imgExtent.height);
        }
    }

    _buildDrawParams(extent) {
        const nw = new maptalks.Coordinate(extent.xmin, extent.ymax);
        const se = new maptalks.Coordinate(extent.xmax, extent.ymin);
        const lt = this.layer.getMap().coordinateToContainerPoint(nw);
        const rb = this.layer.getMap().coordinateToContainerPoint(se);
        const width = rb.x - lt.x;
        const height = rb.y - lt.y;
        return {
            x:lt.x,
            y:lt.y,
            width:width,
            height:height
        };
    }

    drawOnInteracting() {
        this.draw();
    }

    hitDetect() {
        return false;
    }

    onZoomEnd(e) {
        super.onZoomEnd(e);
    }

    onMoveEnd(e) {
        super.onMoveEnd(e);
    }

    onDragRotateEnd(e) {
        super.onDragRotateEnd(e);
    }

}

ImageLayer.registerRenderer('canvas', ImageCanvasRenderer);

ImageLayer.registerRenderer('gl', class extends maptalks.renderer.ImageGLRenderable(ImageCanvasRenderer) {

    //override to set to always drawable
    isDrawable() {
        return true;
    }

    needToRedraw() {
        const map = this.getMap();
        if (map.isZooming()) {
            return true;
        }
        if (map.isMoving()) {
            return true;
        }
        if (map.isRotating()) {
            return true;
        }
        return super.needToRedraw();
    }

    draw() {
        this.prepareCanvas();
        this._drawImages();
    }

    _drawImages() {
        if (this.layer.imgData && this.layer.imgData.length > 0) {
            for (let i = 0; i < this.layer.imgData.length; i++) {
                this._drawImage(this.layer.imgData[i]);
            }
            this.completeRender();
        }
    }

    _drawImage(imgObject) {
        const map = this.getMap(),
            glZoom = map.getGLZoom();
        const extent = new maptalks.Extent(imgObject.extent);
        if (this.layer._isInExtent(extent)) {
            const nw = new maptalks.Coordinate(extent.xmin, extent.ymax);
            const se = new maptalks.Coordinate(extent.xmax, extent.ymin);
            const lt = this.layer.getMap()._prjToPoint(nw, glZoom);
            const rb = this.layer.getMap()._prjToPoint(se, glZoom);
            const width = rb.x - lt.x;
            const height = rb.y - lt.y;
            this.drawGLImage(imgObject.img, lt.x, lt.y, width, height, 1.0);
        }
    }

    drawOnInteracting() {
        this.draw();
    }

    onCanvasCreate() {
        this.prepareGLCanvas();
    }

    resizeCanvas(canvasSize) {
        if (!this.canvas) {
            return;
        }
        super.resizeCanvas(canvasSize);
        this.resizeGLCanvas();
    }

    clearCanvas() {
        if (!this.canvas) {
            return;
        }
        super.clearCanvas();
        this.clearGLCanvas();
    }

    getCanvasImage() {
        if (this.glCanvas && this.isCanvasUpdated()) {
            const ctx = this.context;
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
        return super.getCanvasImage();
    }

    onRemove() {
        this.removeGLCanvas();
    }
});
