/******************************************************************************
Global variables
******************************************************************************/

var stageDraw;          // The Konva Stage that is parent to all drawing
var container;          // The container inside the Stage, used for key event handling
var layerDraw;          // The Konva Layer in the Stage - there is just one in this app
var GNextShape = "";    // The next shape to draw, selected from Toolbar
var selectedShape;      // The currently selected Kona Shape
var nextShapeID = 1;    // Next number to use for a unique ID for a Konva Shape
var modal;              // The modal dialog to display error messages
var objInfoTable = "";  // To build up a table in the sidebar's Object Info tab
var textarea = "";      // Text Area to edit text content of a Kona Text Shape
var curveLayer, lineLayer, anchorLayer, bezier;
var json;
var defaultText = "Welcome to the 2D shape drawing app";      // Default text in a new Text Shape
var defaultObjectInfoHTML =     // Default text in the sidebar's Object Info tab
    "<h1>Object Info</h1>" +
    "<p>Click a shape on the canvas to show its info here.<br>" +
    "To create a new shape, go to the Toolbar tab.</p>";

/******************************************************************************
Simple navigation button functions
******************************************************************************/
function openNav() {
    document.getElementById("mySidebar").style.width = "500px";
    document.getElementById("main").style.marginLeft = "500px";
}

function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
    document.getElementById("main").style.marginLeft= "0";
}

function openTab(tabName, elmnt, color) {
    // Hide all elements with class="tabcontent" by default */
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Remove the background color of all tablinks/buttons
    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].style.backgroundColor = "";
    }

    // Show the specific tab content
    document.getElementById(tabName).style.display = "block";
}


// Click on element (assumed to be a button) with id="defaultOpen"
// and set up some initial text content in sidebar tabs
// function clickDefaultButton() {
//   document.getElementById("defaultOpen").click();
//   clearObjectInfo();
// }

/******************************************************************************
Initialize the app. This needs to be called after the <body> is loaded
******************************************************************************/

function initApp() {
    //clickDefaultButton();   // Populate default text in sidebar tabs

    // Set up the drawing area
    stageDraw = new Konva.Stage({
        container: 'canvas',
        width: "640",
        height: "480"
    });

    container = stageDraw.container();  // Need reference to container for key events
    container.tabIndex = 1;

    // add a layer to the stage
    layerDraw = new Konva.Layer();
    stageDraw.add(layerDraw);
    
    // Establish a reference to the modal dialog for error messages
    modal = document.getElementById('myModal');

    /**************************************************************************
    Event-handling functions for the Konva Stage and its Container.
    These are in initApp() since the Stage must be created first.
    **************************************************************************/

    // Three cases on a single click:
    // 1. User has not selected a "new Shape" tool from the sidebar's Toolbar,
    //    and is clicking a blank area to deselect all Shapes
    // 2. User has selected a "new Shape" tool and is placing the new Shape
    // 3. User is selecting an existing Shape to examine/modify it
    stageDraw.on('click', function (e) {
      // If click on empty area and not creating a new shape, then remove all
      // transformers, clear selectedShape, and clear Object Info tab
      if (e.target === stageDraw && GNextShape == "") {
        stageDraw.find('Transformer').destroy();
        layerDraw.draw();
        selectedShape = undefined;
        clearObjectInfo();
        return;
      }

      // At this point the user intends either to create a new shape
      // or select an existing one.
      // Destroy any existing Transformers
      stageDraw.find('Transformer').destroy();

      // Get the position of the mouse
      var pointerPosition = stageDraw.getPointerPosition();

      // First see if the user is creating a new Shape
      var newShape;
      switch(GNextShape){
        case "circle":
          newShape = new Konva.Circle({
            x: pointerPosition.x,
            y: pointerPosition.y,
            radius: 70,
            fill: $c.name2hex('white'),
            fillEnabled: true,
            stroke: $c.name2hex('black'),
            strokeWidth: 4,
            strokeEnabled: true,
            strokeScaleEnabled: false,
          });
          break;
        case "rectangle":
          newShape = new Konva.Rect({
              x: pointerPosition.x,
              y: pointerPosition.y,
              width: 100,
              height: 50,
              fill: $c.name2hex('white'),
              fillEnabled: true,
              stroke: $c.name2hex('black'),
              strokeWidth: 4,
              strokeEnabled: true,
              strokeScaleEnabled: false
          });
          break;
        case "ellipse":
          newShape = new Konva.Ellipse({
            x: pointerPosition.x,
            y: pointerPosition.y,
            radius: {
                x: 100,
                y: 50
            },
            fill: $c.name2hex('white'),
            fillEnabled: true,
            stroke: $c.name2hex('black'),
            strokeWidth: 4,
            strokeEnabled: true,
            strokeScaleEnabled: false
          });
          break;
        case "line":
          newShape = new Konva.Line({
            // points = [x1, y1, x2, y2, x3, y3]
            points: [pointerPosition.x+5, pointerPosition.y+70,
              pointerPosition.x+140, pointerPosition.y+23,],
              //pointerPosition.x+250, pointerPosition.y+60,
              //pointerPosition.x+300, pointerPosition.y+20],
            stroke: $c.name2hex('black'),
            strokeWidth: 4,
            strokeEnabled: true,
            lineCap: 'round',
            lineJoin: 'round',
            strokeScaleEnabled: false
          });
          break;
          case "arrow":
            newShape = new Konva.Arrow({
              // x: pointerPosition.x,
              // y: pointerPosition.y,
              points: [pointerPosition.x + 5, pointerPosition.y + 70, pointerPosition.x+140, pointerPosition.y+23],
              pointerLength: 20,
              pointerWidth: 20,
              stroke: $c.name2hex('black'),
              fill: $c.name2hex('black'),
              fillEnabled: true,
              strokeWidth: 4,
              strokeEnabled: true,
              lineCap: 'round',
              lineJoin: 'round',
              strokeScaleEnabled: false
            });
            break;
        case "triangle":
          newShape = new Konva.RegularPolygon({
            x: pointerPosition.x,
            y: pointerPosition.y,
            sides: 3,
            radius: 70,
            fill: $c.name2hex('white'),
            fillEnabled: true,
            stroke: $c.name2hex('black'),
            strokeWidth: 4,
            strokeEnabled: true,
            strokeScaleEnabled: false
          })
          break;
          case "text":
            newShape = new Konva.Text({
                text: defaultText,
                fontSize: 20,
                x: pointerPosition.x,
                y: pointerPosition.y,
                width: 300,
                height: 50,
                fill: $c.name2hex('black'),
                fillEnabled: true,
                stroke: $c.name2hex('black'),
                strokeWidth: 0,
                strokeEnabled: false,
                strokeScaleEnabled: false,
                ellipsis: false
            });
            break;
        case "square":
            newShape = new Konva.RegularPolygon({
              x: pointerPosition.x,
              y: pointerPosition.y,
              sides: 4,
              radius: 70,
              fill: $c.name2hex('white'),
              fillEnabled: true,
              stroke: $c.name2hex('black'),
              strokeWidth: 4,
              strokeEnabled: true,
              strokeScaleEnabled: false
            })
            break;
        case "curve":
          newShape = new Konva.Shape({
            stroke: $c.name2hex('black'),
            strokeWidth: 4,
            lineCap: 'round',
            strokeEnabled: true,
            strokeScaleEnabled: false,
            sceneFunc: function(context) {
              context.beginPath();
              context.moveTo(pointerPosition.x,pointerPosition.y);
              context.bezierCurveTo(pointerPosition.x,pointerPosition.y + 200,
                pointerPosition.x + 200,pointerPosition.y+200,
                pointerPosition.x + 200,pointerPosition.y);
              context.strokeShape(this);
            }
          });

         break;
        case "pentagon":
          newShape = new Konva.RegularPolygon({
            x: pointerPosition.x,
            y: pointerPosition.y,
            sides: 5,
            radius: 70,
            fill: $c.name2hex('white'),
            fillEnabled: true,
            stroke: $c.name2hex('black'),
            strokeWidth: 4,
            strokeEnabled: true,
            strokeScaleEnabled: false
          })
          break;
        case "hexagon":
          newShape = new Konva.RegularPolygon({
            x: pointerPosition.x,
            y: pointerPosition.y,
            sides: 6,
            radius: 70,
            fill: $c.name2hex('white'),
            fillEnabled: true,
            stroke: $c.name2hex('black'),
            strokeWidth: 4,
            strokeEnabled: true,
            strokeScaleEnabled: false
          })
          break;
        case "star":
          var newShape = new Konva.Star({
            x: pointerPosition.x,
            y: pointerPosition.y,
            numPoints: 5,
            innerRadius: 40,
            outerRadius: 70,
            fill: $c.name2hex('white'),
            fillEnabled: true,
            stroke: $c.name2hex('black'),
            lineCap: 'round',
            lineJoin: 'round',
            strokeWidth: 4,
            strokeEnabled: true,
            strokeScaleEnabled: false
          });
          break;
          case "ring":
            var newShape = new Konva.Ring({
              x: pointerPosition.x,
              y: pointerPosition.y,
              innerRadius: 40,
              outerRadius: 70,
              fill: $c.name2hex('white'),
              fillEnabled: true,
              stroke: $c.name2hex('black'),
              strokeWidth: 4,
              strokeEnabled: true,
              strokeScaleEnabled: false
            });
            break;
        case "polyline":
          alert("poly line not implemented yet");
          break;
        default:
          break;
      }

      if (newShape) {
          finishNewShape(newShape);
          GNextShape="";
          selectedShape = newShape;
      } else {
          selectedShape = e.target;
      }
      
      // Finally, at this point the user has selected a Shape, whether
      // pre-existing or just newly created.

      // Create new transformer
      var tr = new Konva.Transformer();
      tr.rotationSnaps([0, 90, 180, 270]);  // Snap to 90-degree increments
      // if (selectedShape.getClassName() == "Text") {
      //   // Disable rotation for Text shapes
      //   // TODO Enable rotation for Text shapes when we can figure out the math
      //   tr.rotateEnabled(false);
      // }
      layerDraw.add(tr);
      if(selectedShape.getClassName() != "Shape"){
        tr.attachTo(selectedShape);
      }
      layerDraw.draw();
      getShapeAttributes(selectedShape);
      openNav();
      openTab('Object Info', this, 'red');
    });     // End stageDraw.on('click', ...)

    // Keyboard event listener
    container.addEventListener('keydown', function (e) {
      // Destroy selected shape and its transformer
      if (e.keyCode === 8 || e.keyCode === 46) {
        stageDraw.find('Transformer').destroy();
        selectedShape.destroy();
        selectedShape = undefined;
        clearObjectInfo();
      }
      layerDraw.draw();
    });
    
    // 2 event listeners to close the modal error dialog
    // When the user clicks on <span> (x), close the modal
    document.getElementsByClassName("close")[0].onclick = function() {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    var scaleBy = 1.01;
    stageDraw.on('wheel', e => {
      e.evt.preventDefault();
      var oldScale = stageDraw.scaleX();

      var mousePointTo = {
        x: stageDraw.getPointerPosition().x / oldScale - stageDraw.x() / oldScale,
        y: stageDraw.getPointerPosition().y / oldScale - stageDraw.y() / oldScale
      };

      var newScale =
        e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
      stageDraw.scale({ x: newScale, y: newScale });

      var newPos = {
        x:
          -(mousePointTo.x - stageDraw.getPointerPosition().x / newScale) *
          newScale,
        y:
          -(mousePointTo.y - stageDraw.getPointerPosition().y / newScale) *
          newScale
      };
      stageDraw.position(newPos);
      stageDraw.batchDraw();
    });
}   // function initApp()

/******************************************************************************
Functions to create and update Shapes
******************************************************************************/

// Set GNextShape to draw
function setShape(shape) {
  GNextShape = shape;
}

// Clear out the Object Info tab
function clearObjectInfo() {
    document.getElementById("Object Info").innerHTML = defaultObjectInfoHTML;
}

// Finish creating a new Shape
function finishNewShape(newShape) {
    // Transformers adjust scale, not size. It's confusing, we usually don't want it
    // for outlines, and we certainly don't want it for text. So, as a Transformer
    // scales a shape, update it's width and height to the equivalent of scale 1.
    // From: https://github.com/konvajs/konva/issues/449#issuecomment-419374138
  
    newShape.on('transform', () => {
      if(newShape.getClassName() != "Line" && newShape.getClassName() != "Arrow"){
        newShape.setAttrs({
          width: newShape.width() * newShape.scaleX(),
          height: newShape.height() * newShape.scaleY(),
          scaleX: 1,
          scaleY: 1
        });
     }
      else{
          newShape.setAttrs({
          // width: newShape.width() * newShape.scaleX(),
          // height: newShape.height() * newShape.scaleY(),
          scaleX : newShape.scaleX(),
          scaleY : newShape.scaleY()
        });
      }
      getShapeAttributes(newShape);
    })

    // When a Transformer is done updating, update the contents of the
    // sidebar's Object Info tab
    newShape.on('transformend', function () {
/* TODO Remove if can't get this "compensation" working
      // Compensate for odd behavior of Konva Transformers that disappear if
      // the mouse is not on Transformer on the transformend event
      stageDraw.find('Transformer').destroy();
      // Create new transformer
      var tr = new Konva.Transformer();
      tr.rotationSnaps([0, 90, 180, 270]);  // Snap to 90-degree increments
      if (this.getClassName() == "Text") {
        // Disable rotation for Text shapes
        // TODO Enable rotation for Text shapes when we can figure out the math
        tr.rotateEnabled(false);
      }
      layerDraw.add(tr);
      tr.attachTo(this);
      layerDraw.draw();
 */
      getShapeAttributes(newShape);
      stageDraw.find('Transformer').forceUpdate();
      layerDraw.draw();
    });

    // When starting to drag a Shape, move it to the top of the Z ordering
    newShape.on("dragstart", function() {
        this.moveToTop();
//         layerDraw.draw();
    });

    // When done dragging a shape, update the contents of the Object Info tab
    newShape.on('dragmove', function() {
        getShapeAttributes(newShape);
    });


    // Set the pointer to clarify when a shape can be dragged
    newShape.on('mouseover', function() {
        document.body.style.cursor = 'pointer';
    });
    newShape.on('mouseout', function() {
        document.body.style.cursor = 'default';
    });

     
    setShapeID(newShape);
    layerDraw.add(newShape);
    
    layerDraw.draw();
    newShape.draggable(true);
}   // finishNewShape(newShape)

// Get the attributes of the selected shape and show on the Object Info tab
function getShapeAttributes(shape) {
  // When shape selected will change Object Info content to that shape's
  // specific attributes
  var isShapeValid = true;
  objInfoTable = "<h1>Object Info</h1>" +
    "<p>Hold Alt while dragging a handle to transform from the center</p>" +
    "<table class=\"objInfoTable\"><tbody>";
  switch(shape.getClassName()){
    case "Circle":
      createShapeAttributeString(shape, "ID (Make Unique): ", "id");
//       createShapeAttributeString(shape, "X-Position (Center of Circle): ", "x", "number");
//       createShapeAttributeString(shape, "Y-Position (Center of Circle): ", "y", "number");
// //       createShapeAttributeString(shape, "Scale-X: ", "scaleX", "number", "readonly");
// //       createShapeAttributeString(shape, "Scale-Y: ", "scaleY", "number", "readonly");
//       createShapeAttributeString(shape, "width: ", "width", "number", "readonly");
//       createShapeAttributeString(shape, "height: ", "height", "number", "readonly");
      createShapeAttributeString(shape, "Radius (Pixels): ", "radius", "number");
      createShapeAttributeString(shape, "Fill Color: ", "fill", "color");
      createShapeAttributeString(shape, "Fill Enabled (true/false): ", "fillEnabled", "checkbox");
      createShapeAttributeString(shape, "Shape Outline Color: ", "stroke", "color");
      createShapeAttributeString(shape, "Shape Outline Width: ", "strokeWidth", "number");
      createShapeAttributeString(shape, "Shape Outline Enabled (true/false): ", "strokeEnabled", "checkbox");
      break;
    case "Rect":
      createShapeAttributeString(shape, "ID (Make Unique): ", "id");
//       createShapeAttributeString(shape, "X-Position: ", "x", "number");
//       createShapeAttributeString(shape, "Y-Position: ", "y", "number");
// //       createShapeAttributeString(shape, "Scale-X: ", "scaleX", "number", "readonly");
// //       createShapeAttributeString(shape, "Scale-Y: ", "scaleY", "number", "readonly");
//       createShapeAttributeString(shape, "width: ", "width", "number");
//       createShapeAttributeString(shape, "height: ", "height", "number");
      createShapeAttributeString(shape, "Rotation (Degrees): ", "rotation", "number");
      createShapeAttributeString(shape, "Fill Color: ", "fill", "color");
      createShapeAttributeString(shape, "Fill Enabled (true/false): ", "fillEnabled", "checkbox");
      createShapeAttributeString(shape, "Shape Outline Color: ", "stroke", "color");
      createShapeAttributeString(shape, "Shape Outline Width: ", "strokeWidth", "number");
      createShapeAttributeString(shape, "Shape Outline Enabled (true/false): ", "strokeEnabled", "checkbox");
      break;
    case "Ellipse":
      createShapeAttributeString(shape, "ID (Make Unique): ", "id");
//       createShapeAttributeString(shape, "X-Position (Center of Circle): ", "x", "number");
//       createShapeAttributeString(shape, "Y-Position (Center of Circle): ", "y", "number");
// //       createShapeAttributeString(shape, "Scale-X: ", "scaleX", "number", "readonly");
// //       createShapeAttributeString(shape, "Scale-Y: ", "scaleY", "number", "readonly");
//       createShapeAttributeString(shape, "width: ", "width", "number", "readonly");
//       createShapeAttributeString(shape, "height: ", "height", "number", "readonly");
      createShapeAttributeString(shape, "Rotation (Degrees): ", "rotation", "number");
      createShapeAttributeString(shape, "Radius X (Pixels): ", "radiusX", "number");
      createShapeAttributeString(shape, "Radius Y (Pixels): ", "radiusY", "number");
      createShapeAttributeString(shape, "Fill Color: ", "fill", "color");
      createShapeAttributeString(shape, "Fill Enabled (true/false): ", "fillEnabled", "checkbox");
      createShapeAttributeString(shape, "Shape Outline Color: ", "stroke", "color");
      createShapeAttributeString(shape, "Shape Outline Width: ", "strokeWidth", "number");
      createShapeAttributeString(shape, "Shape Outline Enabled (true/false): ", "strokeEnabled", "checkbox");
      break;
    case "Line":
      createShapeAttributeString(shape, "ID (Make Unique): ", "id");
      //createShapeAttributeString(shape, "X-Position (Left most point): ", "x", "number");
      //createShapeAttributeString(shape, "Y-Position (Left most point): ", "y", "number");
      // createShapeAttributeString(shape, "Points (x1, y1, x2, y2, etc.): ", "points");
      createShapeAttributeString(shape, "Line Join Point Shape (miter, round, or bevel): ", "lineJoin","String");
      createShapeAttributeString(shape, "Line Cap Shape (butt, round, or square): ", "lineCap","String");
//       createShapeAttributeString(shape, "Scale-X: ", "scaleX", "number", "readonly");
//       createShapeAttributeString(shape, "Scale-Y: ", "scaleY", "number", "readonly");
      // createShapeAttributeString(shape, "Scale-X: ", "scaleX", "number");
      // createShapeAttributeString(shape, "Scale-Y: ", "scaleY", "number");
      // createShapeAttributeString(shape,"Scale: ","scale","number");
      //createShapeAttributeString(shape, "width: ", "width", "number", "readonly");
      //createShapeAttributeString(shape, "height: ", "height", "number", "readonly");
      // createShapeAttributeString(shape, "Rotation (Degrees): ", "rotation", "number");
      //createShapeAttributeString(shape, "Fill Color: ", "fill", "color");
      //createShapeAttributeString(shape, "Fill Enabled (true/false): ", "fillEnabled", "checkbox");
      createShapeAttributeString(shape, "Line Color: ", "stroke", "color");
      createShapeAttributeString(shape, "Line Width: ", "strokeWidth", "number");
      createShapeAttributeString(shape, "Line Width Enabled (true/false): ", "strokeEnabled", "checkbox");
      break;
      case "Arrow":
      createShapeAttributeString(shape, "ID (Make Unique): ", "id");
      createShapeAttributeString(shape, "Line Join Point Shape (miter, round, or bevel): ", "lineJoin","String");
      createShapeAttributeString(shape, "Line Cap Shape (butt, round, or square): ", "lineCap","String");
      //createShapeAttributeString(shape, "width: ", "width", "number", "readonly");
      //createShapeAttributeString(shape, "height: ", "height", "number", "readonly");
      // createShapeAttributeString(shape, "Rotation (Degrees): ", "rotation", "number");
      createShapeAttributeString(shape, "Fill Color: ", "fill", "color");
      createShapeAttributeString(shape, "Fill Pointer Enabled (true/false): ", "fillEnabled", "checkbox");
      createShapeAttributeString(shape, "Line Color: ", "stroke", "color");
      createShapeAttributeString(shape, "Line Width: ", "strokeWidth", "number");
      createShapeAttributeString(shape, "Line Width Enabled (true/false): ", "strokeEnabled", "checkbox");
      break;
    case "Text":
      createShapeAttributeString(shape, "ID (Make Unique): ", "id");
      // createShapeAttributeString(shape, "X-Position: ", "x", "number");
      // createShapeAttributeString(shape, "Y-Position: ", "y", "number");
//       createShapeAttributeString(shape, "Scale-X: ", "scaleX", "number", "readonly");
//       createShapeAttributeString(shape, "Scale-Y: ", "scaleY", "number", "readonly");
      // createShapeAttributeString(shape, "width: ", "width", "number");
      // createShapeAttributeString(shape, "height: ", "height", "number");
      createShapeAttributeString(shape, "Rotation (Degrees): ", "rotation", "number");
      createShapeAttributeString(shape, "Text Color: ", "fill", "color");
      createShapeAttributeString(shape, "Fill Enabled (true/false): ", "fillEnabled", "checkbox");
      createShapeAttributeString(shape, "Text Outline Color: ", "stroke", "color");
      createShapeAttributeString(shape, "Text Outline Width: ", "strokeWidth", "number");
      createShapeAttributeString(shape, "Text Outline Enabled (true/false): ", "strokeEnabled", "checkbox");
      createShapeAttributeString(shape, "Font Family (Arial, Times, etc.): ", "fontFamily");
      createShapeAttributeString(shape, "Font Size: ", "fontSize");
      createShapeAttributeString(shape, "Font Style (italic, bold): ", "fontStyle");
      createShapeAttributeString(shape, "Font Variant (normal, small-caps): ", "fontVariant");
      createShapeAttributeString(shape, "Horizontal Align (left, center, right): ", "align");
      createShapeAttributeString(shape, "Vertical Align (top, middle, bottom): ", "verticalAlign");
      createShapeAttributeString(shape, "Padding (Pixels): ", "padding", "number");
      createShapeAttributeString(shape, "Line Height (1, 2, ...): ", "lineHeight", "number");
      createShapeAttributeString(shape, "Wrap (word, char, none): ", "wrap");
      // createShapeAttributeString(shape, "Ellipsis (true/false): ", "ellipsis", "checkbox");
      // Special handling for a text edit box below
      break;
      case "Star":
      createShapeAttributeString(shape, "ID (Make Unique): ", "id");
      createShapeAttributeString(shape,"Number of Points: ","numPoints","Integer");
      createShapeAttributeString(shape, "Line Join Point Shape (miter, round, or bevel): ", "lineJoin","String");
      createShapeAttributeString(shape, "Line Cap Shape (butt, round, or square): ", "lineCap","String");
      createShapeAttributeString(shape, "Rotation (Degrees): ", "rotation", "number");
      createShapeAttributeString(shape, "Fill Color: ", "fill", "color");
      createShapeAttributeString(shape, "Fill Enabled (true/false): ", "fillEnabled", "checkbox");
      createShapeAttributeString(shape, "Shape Outline Color: ", "stroke", "color");
      createShapeAttributeString(shape, "Shape Outline Width: ", "strokeWidth", "number");
      createShapeAttributeString(shape, "Shape Outline Enabled (true/false): ", "strokeEnabled", "checkbox");
      break;
      case "Ring":
        createShapeAttributeString(shape, "ID (Make Unique): ", "id");
        createShapeAttributeString(shape, "Inner Radius (Pixels): ", "innerRadius", "number");
        createShapeAttributeString(shape, "Outer Radius (Pixels): ", "outerRadius", "number");
        createShapeAttributeString(shape, "Fill Color: ", "fill", "color");
        createShapeAttributeString(shape, "Fill Enabled (true/false): ", "fillEnabled", "checkbox");
        createShapeAttributeString(shape, "Shape Outline Color: ", "stroke", "color");
        createShapeAttributeString(shape, "Shape Outline Width: ", "strokeWidth", "number");
        createShapeAttributeString(shape, "Shape Outline Enabled (true/false): ", "strokeEnabled", "checkbox");
        break;
    case "Shape":
      createShapeAttributeString(shape, "ID (Make Unique): ", "id");
      //createShapeAttributeString(shape, "X-Position (Left most point): ", "x", "number");
      //createShapeAttributeString(shape, "Y-Position (Left most point): ", "y", "number");
      //createShapeAttributeString(shape, "Points (x1, y1, x2, y2, etc.): ", "points");
      //createShapeAttributeString(shape, "Line Join Point Shape (miter, round, or bevel): ", "lineJoin");
      createShapeAttributeString(shape, "Line Cap Shape (butt, round, or square): ", "lineCap","String");
//       createShapeAttributeString(shape, "Scale-X: ", "scaleX", "number", "readonly");
//       createShapeAttributeString(shape, "Scale-Y: ", "scaleY", "number", "readonly");
      //createShapeAttributeString(shape, "width: ", "width", "number", "readonly");
      //createShapeAttributeString(shape, "height: ", "height", "number", "readonly");
      createShapeAttributeString(shape, "Rotation (Degrees): ", "rotation", "number");
      //createShapeAttributeString(shape, "Fill Color: ", "fill", "color");
      //createShapeAttributeString(shape, "Fill Enabled (true/false): ", "fillEnabled", "checkbox");
      createShapeAttributeString(shape, "curve Color: ", "stroke", "color");
      createShapeAttributeString(shape, "curve Width: ", "strokeWidth", "number");
      createShapeAttributeString(shape, "curve Width Enabled (true/false): ", "strokeEnabled", "checkbox");
      break;
    case "RegularPolygon":
      //alert("It's a regular Polygon");
      var polygonSides = shape.attrs["sides"];
      if(polygonSides == 3){
        createShapeAttributeString(shape, "ID (Make Unique): ", "id");
  //       createShapeAttributeString(shape, "X-Position: ", "x", "number");
  //       createShapeAttributeString(shape, "Y-Position: ", "y", "number");
  // //       createShapeAttributeString(shape, "Scale-X: ", "scaleX", "number", "readonly");
  // //       createShapeAttributeString(shape, "Scale-Y: ", "scaleY", "number", "readonly");
  //       createShapeAttributeString(shape, "width: ", "width", "number");
  //       createShapeAttributeString(shape, "height: ", "height", "number");
        createShapeAttributeString(shape, "Rotation (Degrees): ", "rotation", "number");
        createShapeAttributeString(shape, "Fill Color: ", "fill", "color");
        createShapeAttributeString(shape, "Fill Enabled (true/false): ", "fillEnabled", "checkbox");
        createShapeAttributeString(shape, "Shape Outline Color: ", "stroke", "color");
        createShapeAttributeString(shape, "Shape Outline Width: ", "strokeWidth", "number");
        createShapeAttributeString(shape, "Shape Outline Enabled (true/false): ", "strokeEnabled", "checkbox");
      }
      else if(polygonSides == 4){
        createShapeAttributeString(shape, "ID (Make Unique): ", "id");
  //       createShapeAttributeString(shape, "X-Position: ", "x", "number");
  //       createShapeAttributeString(shape, "Y-Position: ", "y", "number");
  // //       createShapeAttributeString(shape, "Scale-X: ", "scaleX", "number", "readonly");
  // //       createShapeAttributeString(shape, "Scale-Y: ", "scaleY", "number", "readonly");
  //       createShapeAttributeString(shape, "width: ", "width", "number");
  //       createShapeAttributeString(shape, "height: ", "height", "number");
        createShapeAttributeString(shape, "Rotation (Degrees): ", "rotation", "number");
        createShapeAttributeString(shape, "Fill Color: ", "fill", "color");
        createShapeAttributeString(shape, "Fill Enabled (true/false): ", "fillEnabled", "checkbox");
        createShapeAttributeString(shape, "Shape Outline Color: ", "stroke", "color");
        createShapeAttributeString(shape, "Shape Outline Width: ", "strokeWidth", "number");
        createShapeAttributeString(shape, "Shape Outline Enabled (true/false): ", "strokeEnabled", "checkbox");        
      }
      else if(polygonSides == 5){
        createShapeAttributeString(shape, "ID (Make Unique): ", "id");
  //       createShapeAttributeString(shape, "X-Position: ", "x", "number");
  //       createShapeAttributeString(shape, "Y-Position: ", "y", "number");
  // //       createShapeAttributeString(shape, "Scale-X: ", "scaleX", "number", "readonly");
  // //       createShapeAttributeString(shape, "Scale-Y: ", "scaleY", "number", "readonly");
  //       createShapeAttributeString(shape, "width: ", "width", "number");
  //       createShapeAttributeString(shape, "height: ", "height", "number");
        createShapeAttributeString(shape, "Rotation (Degrees): ", "rotation", "number");
        createShapeAttributeString(shape, "Fill Color: ", "fill", "color");
        createShapeAttributeString(shape, "Fill Enabled (true/false): ", "fillEnabled", "checkbox");
        createShapeAttributeString(shape, "Shape Outline Color: ", "stroke", "color");
        createShapeAttributeString(shape, "Shape Outline Width: ", "strokeWidth", "number");
        createShapeAttributeString(shape, "Shape Outline Enabled (true/false): ", "strokeEnabled", "checkbox");       
      }
      else if(polygonSides == 6){
        createShapeAttributeString(shape, "ID (Make Unique): ", "id");
  //       createShapeAttributeString(shape, "X-Position: ", "x", "number");
  //       createShapeAttributeString(shape, "Y-Position: ", "y", "number");
  // //       createShapeAttributeString(shape, "Scale-X: ", "scaleX", "number", "readonly");
  // //       createShapeAttributeString(shape, "Scale-Y: ", "scaleY", "number", "readonly");
  //       createShapeAttributeString(shape, "width: ", "width", "number");
  //       createShapeAttributeString(shape, "height: ", "height", "number");
        createShapeAttributeString(shape, "Rotation (Degrees): ", "rotation", "number");
        createShapeAttributeString(shape, "Fill Color: ", "fill", "color");
        createShapeAttributeString(shape, "Fill Enabled (true/false): ", "fillEnabled", "checkbox");
        createShapeAttributeString(shape, "Shape Outline Color: ", "stroke", "color");
        createShapeAttributeString(shape, "Shape Outline Width: ", "strokeWidth", "number");
        createShapeAttributeString(shape, "Shape Outline Enabled (true/false): ", "strokeEnabled", "checkbox");
      }
      break;
      
    default:
      isShapeValid = false;
      alert("Shape not valid");
      break;
  }

  // If a valid shape was found, update the Object Info tab with the
  // <table> with editing widgets, a place to edit Text objects,
  // an Update button, etc.
  if (isShapeValid) {
    objInfoTable += "</tbody></table><br>";
    var objInfo = document.getElementById("Object Info");
    objInfo.innerHTML = objInfoTable;
    if (shape.getClassName() == "Text") {
        // Special handling for a text edit box
        textarea = document.createElement('textarea');
        textarea.value = shape.getAttr("text");
        textarea.style.width = "300px";
        textarea.setAttribute("id", shape.id() + "textarea");

        objInfo.insertAdjacentHTML('beforeend', "Text:<br>");
        objInfo.appendChild(textarea);
        objInfo.insertAdjacentHTML('beforeend', "<br>");
        objInfo.insertAdjacentHTML('beforeend', "<br>");
    }
   
    var btn = document.createElement("BUTTON");
    btn.setAttribute("class", "updatebtn");
    var t = document.createTextNode("Update");
    btn.appendChild(t);
    objInfo.appendChild(btn);
    btn.onclick = function() {
      setSelectedShapeAttributes(shape);
    };
  } else {
    clearObjectInfo();
  }
}   // End function getShapeAttributes(shape)

// Dynamically add string/textbox value to the  Object Info tab
// If inputType is provided, it should be the type of the HTML <input>, such
// as "number" or "color". If not provided, inputType defaults to "text".
// See https://www.w3schools.com/tags/att_input_type.asp
// Note that for "color" the color value should be in hex format, not a color name.
// If readonly is true then the <input> will be readonly.
//
// Format overall Object Info tab content as a table.
// createShapeAttributeString writes one row, with surrounding <table> text
// supplied by caller. Potential layout:
// <table class="objInfoTable">
//     <tr>
//         <td class="leftCol">label</td>
//         <td class="rightCol">input text/checkbox/etc.</td>
//     </tr>
//     ...
// </table>

function createShapeAttributeString(shape, string, value, inputType, readonly) {
  if (inputType === undefined) {
    inputType = "text";
  }
  var tempBox = document.createElement('INPUT');
  tempBox.setAttribute("type", inputType);
  if (inputType === "checkbox") {
    tempBox.setAttribute("checked", "checked");
    if (shape.getAttr(value) == "false"
        || shape.getAttr(value) == false) {
      tempBox.removeAttribute("checked");   // Work around String vs. Boolean issue
    }
  } else {
    tempBox.setAttribute("value", shape.getAttr(value));
    if (value == "image") {
      tempBox.setAttribute("value", shape.getImage().src);
    }
  }
  tempBox.setAttribute("id", shape.id() + value);
  if (readonly) {
    tempBox.setAttribute("readonly", "true");
  }

  var rowPrefix = "<tr><td class=\"leftCol\">";
  var rowMiddle = "</td><td class=\"rightCol\">";
  var rowSuffix = "</td></tr>"
  objInfoTable += rowPrefix + string + rowMiddle + tempBox.outerHTML + rowSuffix;
  
  // For Images, add an extra button to allow selecting a local image file
  if (value == "image") {
      objInfoTable += rowPrefix + "Use a local image file: " + rowMiddle +
      "<input type=\"file\" id=\"fileInput\">"
      + rowSuffix;
  }
}

// Add a unique ID to a shape; If shape already has an ID, do nothing.
// NOTE THIS SIMPLE IMPLEMENTATION ASSUMES ID NUMBERS <= 999999
function setShapeID(shape) {
  if (!shape.id()) {
    shape.id(shape.getClassName() + "ID" + ("000000"+nextShapeID++).slice(-6));
  }
}

// TODO //
// Will take the values from the textboxes in Object Info
// to change selected shape When "Update" button is clicked.
// Must be careful to treat numbers as numbers and not strings, otherwise the Konva
// libraries hit exceptions that cause a variety of problems. For our cases,
// the unary plus operator seems to be the best overall approach, as per
// https://medium.com/@nikjohn/cast-to-number-in-javascript-using-the-unary-operator-f4ca67c792ce
function setSelectedShapeAttributes(shape) {
  var isShapeValid = true;
  switch(shape.getClassName()){
    case "Circle":
      shape.setAttr("id", document.getElementById(shape.id() + "id").value);
      // shape.setAttr("x", +(document.getElementById(shape.id() + "x").value));
      // shape.setAttr("y", +(document.getElementById(shape.id() + "y").value));
//       shape.setAttr("scaleX", +(document.getElementById(shape.id() + "scaleX").value));
// //       shape.setAttr("scaleY", +(document.getElementById(shape.id() + "scaleY").value));
//       shape.setAttr("width", +(document.getElementById(shape.id() + "width").value));
//       shape.setAttr("height", +(document.getElementById(shape.id() + "height").value));
      shape.setAttr("radius", +(document.getElementById(shape.id() + "radius").value));
      shape.setAttr("fill", document.getElementById(shape.id() + "fill").value);
      // fillEnabled is a checkbox so must use "checked" instead of "value"
      shape.setAttr("fillEnabled", document.getElementById(shape.id() + "fillEnabled").checked);
      shape.setAttr("stroke", document.getElementById(shape.id() + "stroke").value);
      shape.setAttr("strokeWidth", +(document.getElementById(shape.id() + "strokeWidth").value));
      // strokeEnabled is a checkbox so must use "checked" instead of "value"
      shape.setAttr("strokeEnabled", document.getElementById(shape.id() + "strokeEnabled").checked);
      break;
      case "Ellipse":
      shape.setAttr("id", document.getElementById(shape.id() + "id").value);
      // shape.setAttr("x", +(document.getElementById(shape.id() + "x").value));
      // shape.setAttr("y", +(document.getElementById(shape.id() + "y").value));
//       shape.setAttr("scaleX", +(document.getElementById(shape.id() + "scaleX").value));
// //       shape.setAttr("scaleY", +(document.getElementById(shape.id() + "scaleY").value));
//       shape.setAttr("width", +(document.getElementById(shape.id() + "width").value));
//       shape.setAttr("height", +(document.getElementById(shape.id() + "height").value));
      shape.setAttr("rotation", +(document.getElementById(shape.id() + "rotation").value));
      shape.setAttr("radiusX", +(document.getElementById(shape.id() + "radiusX").value));
      shape.setAttr("radiusY", +(document.getElementById(shape.id() + "radiusY").value));
      shape.setAttr("fill", document.getElementById(shape.id() + "fill").value);
      // fillEnabled is a checkbox so must use "checked" instead of "value"
      shape.setAttr("fillEnabled", document.getElementById(shape.id() + "fillEnabled").checked);
      shape.setAttr("stroke", document.getElementById(shape.id() + "stroke").value);
      shape.setAttr("strokeWidth", +(document.getElementById(shape.id() + "strokeWidth").value));
      // strokeEnabled is a checkbox so must use "checked" instead of "value"
      shape.setAttr("strokeEnabled", document.getElementById(shape.id() + "strokeEnabled").checked);
      break;
    case "Rect":
      shape.setAttr("id", document.getElementById(shape.id() + "id").value);
      // shape.setAttr("x", +(document.getElementById(shape.id() + "x").value));
      // shape.setAttr("y", +(document.getElementById(shape.id() + "y").value));
      // //       shape.setAttr("scaleX", +(document.getElementById(shape.id() + "scaleX").value));
      // //       shape.setAttr("scaleY", +(document.getElementById(shape.id() + "scaleY").value));
      // shape.setAttr("width", +(document.getElementById(shape.id() + "width").value));
      // shape.setAttr("height", +(document.getElementById(shape.id() + "height").value));
      shape.setAttr("rotation", +(document.getElementById(shape.id() + "rotation").value));
      shape.setAttr("fill", document.getElementById(shape.id() + "fill").value);
      // fillEnabled is a checkbox so must use "checked" instead of "value"
      shape.setAttr("fillEnabled", document.getElementById(shape.id() + "fillEnabled").checked);
      shape.setAttr("stroke", document.getElementById(shape.id() + "stroke").value);
      shape.setAttr("strokeWidth", +(document.getElementById(shape.id() + "strokeWidth").value));
      // strokeEnabled is a checkbox so must use "checked" instead of "value"
      shape.setAttr("strokeEnabled", document.getElementById(shape.id() + "strokeEnabled").checked);
      break;
    case "Line":
      shape.setAttr("id", document.getElementById(shape.id() + "id").value);
      // shape.points(document.getElementById(shape.id() + "points").value.split(",").map(Number));
      shape.setAttr("lineJoin", document.getElementById(shape.id() + "lineJoin").value);
      shape.setAttr("lineCap", document.getElementById(shape.id() + "lineCap").value);
      // shape.setAttr("scaleX", +(document.getElementById(shape.id() + "scaleX").value));
      // shape.setAttr("scaleY", +(document.getElementById(shape.id() + "scaleY").value));
      // shape.setAttr("scale", +(document.getElementById(shape.id() + "scale").value));
      //shape.setAttr("width", +(document.getElementById(shape.id() + "width").value));
      //shape.setAttr("height", +(document.getElementById(shape.id() + "height").value));
      // shape.setAttr("rotation", +(document.getElementById(shape.id() + "rotation").value));
      shape.setAttr("stroke", document.getElementById(shape.id() + "stroke").value);
      shape.setAttr("strokeWidth", +(document.getElementById(shape.id() + "strokeWidth").value));
      // strokeEnabled is a checkbox so must use "checked" instead of "value"
      shape.setAttr("strokeEnabled", document.getElementById(shape.id() + "strokeEnabled").checked);
      break;
    case "Arrow":
      shape.setAttr("id", document.getElementById(shape.id() + "id").value);
      // shape.points(document.getElementById(shape.id() + "points").value.split(",").map(Number));
      shape.setAttr("lineJoin", document.getElementById(shape.id() + "lineJoin").value);
      shape.setAttr("lineCap", document.getElementById(shape.id() + "lineCap").value);
      // shape.setAttr("scaleX", +(document.getElementById(shape.id() + "scaleX").value));
      // shape.setAttr("scaleY", +(document.getElementById(shape.id() + "scaleY").value));
      // shape.setAttr("scale", +(document.getElementById(shape.id() + "scale").value));
      //shape.setAttr("width", +(document.getElementById(shape.id() + "width").value));
      //shape.setAttr("height", +(document.getElementById(shape.id() + "height").value));
      // shape.setAttr("rotation", +(document.getElementById(shape.id() + "rotation").value));
      shape.setAttr("fill", document.getElementById(shape.id() + "fill").value);
      // fillEnabled is a checkbox so must use "checked" instead of "value"
      shape.setAttr("fillEnabled", document.getElementById(shape.id() + "fillEnabled").checked);
      shape.setAttr("stroke", document.getElementById(shape.id() + "stroke").value);
      shape.setAttr("strokeWidth", +(document.getElementById(shape.id() + "strokeWidth").value));
      // strokeEnabled is a checkbox so must use "checked" instead of "value"
      shape.setAttr("strokeEnabled", document.getElementById(shape.id() + "strokeEnabled").checked);
        break;
    case "Text":
      shape.setAttr("id", document.getElementById(shape.id() + "id").value);
      shape.setAttr("text", document.getElementById(shape.id() + "textarea").value);
      // shape.setAttr("x", +(document.getElementById(shape.id() + "x").value));
      // shape.setAttr("y", +(document.getElementById(shape.id() + "y").value));
//       shape.setAttr("scaleX", +(document.getElementById(shape.id() + "scaleX").value));
//       shape.setAttr("scaleY", +(document.getElementById(shape.id() + "scaleY").value));
      // shape.setAttr("width", +(document.getElementById(shape.id() + "width").value));
      // shape.setAttr("height", +(document.getElementById(shape.id() + "height").value));
      // shape.width(+(document.getElementById(shape.id() + "width").value));
      // shape.height(+(document.getElementById(shape.id() + "height").value));
      shape.setAttr("rotation", +(document.getElementById(shape.id() + "rotation").value));
      shape.setAttr("fill", document.getElementById(shape.id() + "fill").value);
      // fillEnabled is a checkbox so must use "checked" instead of "value"
      shape.setAttr("fillEnabled", document.getElementById(shape.id() + "fillEnabled").checked);
      shape.setAttr("stroke", document.getElementById(shape.id() + "stroke").value);
      shape.setAttr("strokeWidth", +(document.getElementById(shape.id() + "strokeWidth").value));
      // strokeEnabled is a checkbox so must use "checked" instead of "value"
      shape.setAttr("strokeEnabled", document.getElementById(shape.id() + "strokeEnabled").checked);
      shape.setAttr("fontFamily", document.getElementById(shape.id() + "fontFamily").value);
      shape.setAttr("fontSize", +(document.getElementById(shape.id() + "fontSize").value));
      shape.setAttr("fontStyle", document.getElementById(shape.id() + "fontStyle").value);
      shape.setAttr("fontVariant", document.getElementById(shape.id() + "fontVariant").value);
      shape.setAttr("align", document.getElementById(shape.id() + "align").value);
      shape.setAttr("verticalAlign", document.getElementById(shape.id() + "verticalAlign").value);
      shape.setAttr("padding", +(document.getElementById(shape.id() + "padding").value));
      shape.setAttr("lineHeight", +(document.getElementById(shape.id() + "lineHeight").value));
      shape.setAttr("wrap", document.getElementById(shape.id() + "wrap").value);
      // ellipsis is a checkbox so must use "checked" instead of "value"
      // shape.setAttr("ellipsis", document.getElementById(shape.id() + "ellipsis").checked);
      break;
    case "Shape":
      shape.setAttr("id", document.getElementById(shape.id() + "id").value);
      //shape.points(document.getElementById(shape.id() + "points").value.split(",").map(Number));
      //shape.setAttr("lineJoin", document.getElementById(shape.id() + "lineJoin").value);
      shape.setAttr("lineCap", document.getElementById(shape.id() + "lineCap").value);
      //shape.setAttr("width", +(document.getElementById(shape.id() + "width").value));
      //shape.setAttr("height", +(document.getElementById(shape.id() + "height").value));
      shape.setAttr("rotation", +(document.getElementById(shape.id() + "rotation").value));
      shape.setAttr("stroke", document.getElementById(shape.id() + "stroke").value);
      shape.setAttr("strokeWidth", +(document.getElementById(shape.id() + "strokeWidth").value));
      // strokeEnabled is a checkbox so must use "checked" instead of "value"
      shape.setAttr("strokeEnabled", document.getElementById(shape.id() + "strokeEnabled").checked);
      break;
      case "Star":
        shape.setAttr("id", document.getElementById(shape.id() + "id").value);
        shape.setAttr("numPoints",document.getElementById(shape.id() + "numPoints").value);
        shape.setAttr("rotation", +(document.getElementById(shape.id() + "rotation").value));
        shape.setAttr("fill", document.getElementById(shape.id() + "fill").value);
        shape.setAttr("lineJoin", document.getElementById(shape.id() + "lineJoin").value);
        shape.setAttr("lineCap", document.getElementById(shape.id() + "lineCap").value);
        // fillEnabled is a checkbox so must use "checked" instead of "value"
        shape.setAttr("fillEnabled", document.getElementById(shape.id() + "fillEnabled").checked);
        shape.setAttr("stroke", document.getElementById(shape.id() + "stroke").value);
        shape.setAttr("strokeWidth", +(document.getElementById(shape.id() + "strokeWidth").value));
        // strokeEnabled is a checkbox so must use "checked" instead of "value"
        shape.setAttr("strokeEnabled", document.getElementById(shape.id() + "strokeEnabled").checked);
      break;
      case "Ring":
        shape.setAttr("id", document.getElementById(shape.id() + "id").value);
        shape.setAttr("innerRadius", +(document.getElementById(shape.id() + "innerRadius").value));
        shape.setAttr("outerRadius", +(document.getElementById(shape.id() + "outerRadius").value));
        shape.setAttr("fill", document.getElementById(shape.id() + "fill").value);
        // fillEnabled is a checkbox so must use "checked" instead of "value"
        shape.setAttr("fillEnabled", document.getElementById(shape.id() + "fillEnabled").checked);
        shape.setAttr("stroke", document.getElementById(shape.id() + "stroke").value);
        shape.setAttr("strokeWidth", +(document.getElementById(shape.id() + "strokeWidth").value));
        // strokeEnabled is a checkbox so must use "checked" instead of "value"
        shape.setAttr("strokeEnabled", document.getElementById(shape.id() + "strokeEnabled").checked);
        break;
      case "RegularPolygon":
        var polygonSides = shape.attrs["sides"];
        if(polygonSides == 3){
          shape.setAttr("id", document.getElementById(shape.id() + "id").value);
      // shape.setAttr("x", +(document.getElementById(shape.id() + "x").value));
      // shape.setAttr("y", +(document.getElementById(shape.id() + "y").value));
      // //       shape.setAttr("scaleX", +(document.getElementById(shape.id() + "scaleX").value));
      // //       shape.setAttr("scaleY", +(document.getElementById(shape.id() + "scaleY").value));
      // shape.setAttr("width", +(document.getElementById(shape.id() + "width").value));
      // shape.setAttr("height", +(document.getElementById(shape.id() + "height").value));
      shape.setAttr("rotation", +(document.getElementById(shape.id() + "rotation").value));
      shape.setAttr("fill", document.getElementById(shape.id() + "fill").value);
      // fillEnabled is a checkbox so must use "checked" instead of "value"
      shape.setAttr("fillEnabled", document.getElementById(shape.id() + "fillEnabled").checked);
      shape.setAttr("stroke", document.getElementById(shape.id() + "stroke").value);
      shape.setAttr("strokeWidth", +(document.getElementById(shape.id() + "strokeWidth").value));
      // strokeEnabled is a checkbox so must use "checked" instead of "value"
      shape.setAttr("strokeEnabled", document.getElementById(shape.id() + "strokeEnabled").checked);
        }
        else if(polygonSides == 4){
          shape.setAttr("id", document.getElementById(shape.id() + "id").value);
      // shape.setAttr("x", +(document.getElementById(shape.id() + "x").value));
      // shape.setAttr("y", +(document.getElementById(shape.id() + "y").value));
      // //       shape.setAttr("scaleX", +(document.getElementById(shape.id() + "scaleX").value));
      // //       shape.setAttr("scaleY", +(document.getElementById(shape.id() + "scaleY").value));
      // shape.setAttr("width", +(document.getElementById(shape.id() + "width").value));
      // shape.setAttr("height", +(document.getElementById(shape.id() + "height").value));
      shape.setAttr("rotation", +(document.getElementById(shape.id() + "rotation").value));
      shape.setAttr("fill", document.getElementById(shape.id() + "fill").value);
      // fillEnabled is a checkbox so must use "checked" instead of "value"
      shape.setAttr("fillEnabled", document.getElementById(shape.id() + "fillEnabled").checked);
      shape.setAttr("stroke", document.getElementById(shape.id() + "stroke").value);
      shape.setAttr("strokeWidth", +(document.getElementById(shape.id() + "strokeWidth").value));
      // strokeEnabled is a checkbox so must use "checked" instead of "value"
      shape.setAttr("strokeEnabled", document.getElementById(shape.id() + "strokeEnabled").checked);
        }
        else if(polygonSides == 5){
          shape.setAttr("id", document.getElementById(shape.id() + "id").value);
      // shape.setAttr("x", +(document.getElementById(shape.id() + "x").value));
      // shape.setAttr("y", +(document.getElementById(shape.id() + "y").value));
      // //       shape.setAttr("scaleX", +(document.getElementById(shape.id() + "scaleX").value));
      // //       shape.setAttr("scaleY", +(document.getElementById(shape.id() + "scaleY").value));
      // shape.setAttr("width", +(document.getElementById(shape.id() + "width").value));
      // shape.setAttr("height", +(document.getElementById(shape.id() + "height").value));
      shape.setAttr("rotation", +(document.getElementById(shape.id() + "rotation").value));
      shape.setAttr("fill", document.getElementById(shape.id() + "fill").value);
      // fillEnabled is a checkbox so must use "checked" instead of "value"
      shape.setAttr("fillEnabled", document.getElementById(shape.id() + "fillEnabled").checked);
      shape.setAttr("stroke", document.getElementById(shape.id() + "stroke").value);
      shape.setAttr("strokeWidth", +(document.getElementById(shape.id() + "strokeWidth").value));
      // strokeEnabled is a checkbox so must use "checked" instead of "value"
      shape.setAttr("strokeEnabled", document.getElementById(shape.id() + "strokeEnabled").checked);
          
        }
        else if(polygonSides == 6){
          shape.setAttr("id", document.getElementById(shape.id() + "id").value);
      // shape.setAttr("x", +(document.getElementById(shape.id() + "x").value));
      // shape.setAttr("y", +(document.getElementById(shape.id() + "y").value));
      // //       shape.setAttr("scaleX", +(document.getElementById(shape.id() + "scaleX").value));
      // //       shape.setAttr("scaleY", +(document.getElementById(shape.id() + "scaleY").value));
      // shape.setAttr("width", +(document.getElementById(shape.id() + "width").value));
      // shape.setAttr("height", +(document.getElementById(shape.id() + "height").value));
      shape.setAttr("rotation", +(document.getElementById(shape.id() + "rotation").value));
      shape.setAttr("fill", document.getElementById(shape.id() + "fill").value);
      // fillEnabled is a checkbox so must use "checked" instead of "value"
      shape.setAttr("fillEnabled", document.getElementById(shape.id() + "fillEnabled").checked);
      shape.setAttr("stroke", document.getElementById(shape.id() + "stroke").value);
      shape.setAttr("strokeWidth", +(document.getElementById(shape.id() + "strokeWidth").value));
      // strokeEnabled is a checkbox so must use "checked" instead of "value"
      shape.setAttr("strokeEnabled", document.getElementById(shape.id() + "strokeEnabled").checked);

        }
        break;
    default:
      isShapeValid = false;
      alert("Shape not valid");
      break;
  }

  // If a valid shape was processed, update the drawing area
  if (isShapeValid) {
    stageDraw.find('Transformer').forceUpdate();      // Fit Transformer to updated shape
    layerDraw.draw();
  }
}   // setSelectedShapeAttributes(shape)

// From https://konvajs.github.io/docs/data_and_serialization/Stage_Data_URL.html
function downloadURI(uri, name) {
    var link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    delete link;
}

function canvasToJpg() {
    var dataURL = stageDraw.toDataURL();
    downloadURI(dataURL, 'canvasimage.jpg');
}

function canvasToPdf(){
var pdf = new jsPDF('l', 'px', 'a3');
pdf.setTextColor('#000000');
// first add texts
stageDraw.find('Text').forEach(text => {
  const size = text.fontSize() / 0.75; // convert pixels to points
  pdf.setFontSize(size);
  pdf.text(text.text(), text.x(), text.y(), {
    baseline: 'top',
    angle: -text.getAbsoluteRotation()
  });
});

// then put image on top of texts (so texts are not visible)
pdf.addImage(
  stageDraw.toDataURL({ pixelRatio: 3 }),
  0,
  0,
  stageDraw.width(),
  stageDraw.height()
);

pdf.save('canvasPDF.pdf');
}

function canvasToJson(){
//   var location = window.location.href;
// var directoryPath = location.substring(0, location.lastIndexOf("/")+1);
// console.log(directoryPath);
  json = stageDraw.toJSON();
  var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json));
  var link = document.createElement("a");
    link.setAttribute("href", "data:"+data);
    link.setAttribute("download", "canvas.json");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    delete link;
}

// function loadJson(){
//   const selectedFile = document.getElementById('file').files[0];
//   var fileread = new FileReader();
//   fileread.readAsText(selectedFile);
//   fileread.onload = function(e) {
//     var content = e.target.result;
//     var intern = JSON.parse(content); // Array of Objects.
//     console.log(intern); // You can index every object
//     stageDraw = Konva.Node.create(intern, 'drawing');
//   };
// }


function loadJson(){
  var input = document.createElement('input');
  input.type = 'file';
  // var selectedFile;
  input.onchange = e => { 
    var selectedFile = e.target.files[0]; 
    // console.log(selectedFile.name);
  var fileread = new FileReader();
  fileread.readAsText(selectedFile);
  fileread.onload = function(e) {
    var content = e.target.result;
    var intern = JSON.parse(content); // Array of Objects.
    // console.log(intern); // You can index every object
    stageDraw = Konva.Node.create(intern, 'canvas');
  };
 }
  input.click(); 
}