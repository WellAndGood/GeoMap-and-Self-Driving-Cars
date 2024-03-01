class GraphEditor {
    constructor(viewport, graph) {
        this.viewport = viewport;
        this.canvas = viewport.canvas;
        this.graph = graph;

        this.ctx = this.canvas.getContext("2d");

        this.selected = null;
        this.hovered = null;
        this.dragging = null;
        this.mouse = null;

        this.#addEventListeners();
    }

    #addEventListeners() {
        this.canvas.addEventListener("mousedown", this.#handleMouseDown.bind(this))
        this.canvas.addEventListener("mousemove", this.#handleMouseMove.bind(this))
        this.canvas.addEventListener("contextmenu", (evt) => evt.preventDefault())
        this.canvas.addEventListener("mouseup", () => this.dragging = false);
    }

    #handleMouseMove(evt) {
        this.mouse = this.viewport.getMouse(evt, true);
        this.hovered = getNearestPoint(this.mouse, this.graph.points, 20 * this.viewport.view);

        // Mousing the mouse allows us to relocate a Point if 
        // you've left-clicked and are moving your mouse
        if (this.dragging == true) {
            this.selected.x = this.mouse.x;
            this.selected.y = this.mouse.y;
        }
    }

    #handleMouseDown(evt) {
        if (evt.button == 2) { // right click
            if (this.selected) {
                this.selected = null;
            } else if (this.hovered) {
                this.#removePoint(this.hovered);
            }
        }
        if (evt.button == 0) { // left click
            if (this.hovered) {
                this.#select(this.hovered);
                this.dragging = true;
                return;
            }
            this.graph.addPoint(this.mouse);
            this.#select(this.mouse);
            this.hovered = this.mouse;
        }
        }

    #removePoint(point) {
        this.graph.removePoint(point);
        this.hovered = null;
        if (this.selected == point) {
            this.selected = null;
        }
    }

    #select(point) {
        // If there's a non-null value for the selected property,
        // Attempt to create a segment between this.selected and the 'point'
        if (this.selected) {
            this.graph.tryAddSegment(new Segment(this.selected, point));
         }
         this.selected = point;
    }

    dispose() {
        this.graph.dispose();
        this.selected = null;
        this.hovered = null;
    }

    display() {
        this.graph.draw(this.ctx);

        // If you're hovering over 'this', give it context and set a yellow dot in the center
        if (this.hovered) {
            this.hovered.draw(this.ctx, {fill: true});
        }
        // If you've selected the 'this' being evaluated,  create a segment connecting 
        // the main item and the intended place (another dot your mouse is hovering over versus)
        // the mouse location
        if (this.selected) {
            const intent = this.hovered ? this.hovered : this.mouse;
            new Segment(this.selected, intent).draw(ctx, { dash: [3, 3] });
            this.selected.draw(this.ctx, { outline: true });
         }
    }
}