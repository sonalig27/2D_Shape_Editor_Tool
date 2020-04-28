/******************************************************************************
Global variables
******************************************************************************/

var stageDraw;          // The Konva Stage element which is our canvas for drawing
var container;          // The container links the canvas drawing area to the Konva stage object
var layerDraw;          // The Konva Layer that is added to the stage
var nextShape = "";    // The next shape to be drawn on canvas
var selectedShape;      // The currently selected Konva Shape to be drawn on canvas
var nextShapeID = 1;    // Next number to be used for shape ID
var modal;              // The modal for displaying error messages
var shapeInfoTable = "";  // To build Shape Info table in the sideToolBar
var textarea = "";      // To edit the text content for text element
var json;
var defaultText = "Welcome to the 2D shape drawing app";      // Default text for text element
var defaultShapeInfoHTML =     // Default text for the Shape Info tab
    "<h1>Shape Info</h1>" +
    "<p>Click a shape on the canvas for its info.<br>" +
    "Create a new shape, using the Shapes tab.</p>";

/******************************************************************************
navigation functionality
******************************************************************************/
function openNav() {
    document.getElementById("toolBar").style.width = "500px";
    document.getElementById("mainPage").style.marginLeft = "500px";
}

function closeNav() {
    document.getElementById("toolBar").style.width = "0";
    document.getElementById("mainPage").style.marginLeft= "0";
}

function openTab(tabName, elmnt, color) {
    /* default hide tab elements */
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // For tablinks and buttons removing the background color
    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].style.backgroundColor = "";
    }

    // display tab content
    document.getElementById(tabName).style.display = "block";
}

//Drawing the grid on canvas, if user chooses so
function showGrid(){
  for (var i = 0; i <= (stageDraw.width() / 20); i++) {
    var hGridLines = new Konva.Line({
      points: [i * 20, 0, i * 20, stageDraw.height()],
      stroke: '#ccc',
      strokeWidth: 1
    });
    var vGridLines = new Konva.Line({
      points: [0, i * 20, stageDraw.width(), i * 20],
      stroke: '#ccc',
      strokeWidth: 1
    });

    layerDraw.add(hGridLines);
    layerDraw.add(vGridLines);
  }
  stageDraw.add(layerDraw);
}
/******************************************************************************
initApp() called on body load
******************************************************************************/

function initApp() {

    // Setting up the canvas
    stageDraw = new Konva.Stage({
        container: 'canvas',
        width: "640",
        height: "480"
    });

    container = stageDraw.container();
    container.tabIndex = 1;

    // adding a layer to the stage
    layerDraw = new Konva.Layer();

    stageDraw.add(layerDraw);
    
    //modal dialog for error messages
    modal = document.getElementById('myModal');

    /**************************************************************************
    Event-handling functions for the canvas
    **************************************************************************/

    // 1. User clicks a blank area to deselect all Shapes
    // 2. User selects a new Shape to draw on canvas
    // 3. User selects an existing Shape to change it
    stageDraw.on('click', function (e) {
      // If 1. then remove all transformers, clear selectedShape, and clear Shape Info tab
      if (e.target === stageDraw && nextShape == "") {
        stageDraw.find('Transformer').destroy();
        layerDraw.draw();
        selectedShape = undefined;
        clearShapeInfo();
        return;
      }

      // Destroy any existing Transformers
      stageDraw.find('Transformer').destroy();

      // obtaining mouse position coordinates
      var pointerPosition = stageDraw.getPointerPosition();

      // Check for newshape creation
      var newShape;
      switch(nextShape){
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
            points: [pointerPosition.x+5, pointerPosition.y+70,
              pointerPosition.x+140, pointerPosition.y+23,],
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
              points: [pointerPosition.x + 5, pointerPosition.y + 70, 
                pointerPosition.x+140, pointerPosition.y+23],
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
          nextShape="";
          selectedShape = newShape;
      } else {
          selectedShape = e.target;
      }
      

      // Creating a new transformer
      var tr = new Konva.Transformer();
      tr.rotationSnaps([0, 90, 180, 270]);  // Snapping to 90-degree increments
      layerDraw.add(tr);
      if(selectedShape.getClassName() != "Shape"){
        tr.attachTo(selectedShape);
      }
      layerDraw.draw();
      getShapeAttributes(selectedShape);
      openNav();
      openTab('Shape Info', this, 'red');
    });

    // Keyboard event listener
    container.addEventListener('keydown', function (e) {
      // delete selected shape and its transformer
      if (e.keyCode === 8 || e.keyCode === 46) {
        stageDraw.find('Transformer').destroy();
        selectedShape.destroy();
        selectedShape = undefined;
        clearShapeInfo();
      }
      layerDraw.draw();
    });
    
    //event listener to close the modal error dialog
    document.getElementsByClassName("close")[0].onclick = function() {
        modal.style.display = "none";
    }
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    //Zoom-in and Zoom-out functionality
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
Create and update Shapes
******************************************************************************/

// Setting the nextShape to be drawn on canvas
function setShape(shape) {
  nextShape = shape;
}

// Clearing the Shape Info tab
function clearShapeInfo() {
    document.getElementById("Shape Info").innerHTML = defaultShapeInfoHTML;
}

// Finish creating a new Shape
function finishNewShape(newShape) {
      
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
          scaleX : newShape.scaleX(),
          scaleY : newShape.scaleY()
        });
      }
      getShapeAttributes(newShape);
    })

    // After Transformer has updated the shape, update the contents of Shape Info tab
    newShape.on('transformend', function () {
      getShapeAttributes(newShape);
      stageDraw.find('Transformer').forceUpdate();
      layerDraw.draw();
    });

    // When starting to drag a Shape
    newShape.on("dragstart", function() {
        this.moveToTop();
//         layerDraw.draw();
    });

    // On drag complete for a shape, updating the contents of Shape Info tab
    newShape.on('dragmove', function() {
        getShapeAttributes(newShape);
    });


    // Setting the pointer to indicate dragging possible
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
}

// Getting attributes of selected shape to display on Shape Info tab
function getShapeAttributes(shape) {
  var isShapeValid = true;
  shapeInfoTable = "<h1>Shape Info</h1>" +
    "<table class=\"shapeInfoTable\"><tbody>";
  
  //getting the shape attributes
  switch(shape.getClassName()){
    case "Circle":
      createShapeAttributeString(shape, "ID (Make Unique): ", "id");
      createShapeAttributeString(shape, "Radius (Pixels): ", "radius", "number");
      createShapeAttributeString(shape, "Fill Color: ", "fill", "color");
      createShapeAttributeString(shape, "Fill Enabled (true/false): ", "fillEnabled", "checkbox");
      createShapeAttributeString(shape, "Shape Outline Color: ", "stroke", "color");
      createShapeAttributeString(shape, "Shape Outline Width: ", "strokeWidth", "number");
      createShapeAttributeString(shape, "Shape Outline Enabled (true/false): ", "strokeEnabled", "checkbox");
      break;
    case "Rect":
      createShapeAttributeString(shape, "ID (Make Unique): ", "id");
      createShapeAttributeString(shape, "Rotation (Degrees): ", "rotation", "number");
      createShapeAttributeString(shape, "Fill Color: ", "fill", "color");
      createShapeAttributeString(shape, "Fill Enabled (true/false): ", "fillEnabled", "checkbox");
      createShapeAttributeString(shape, "Shape Outline Color: ", "stroke", "color");
      createShapeAttributeString(shape, "Shape Outline Width: ", "strokeWidth", "number");
      createShapeAttributeString(shape, "Shape Outline Enabled (true/false): ", "strokeEnabled", "checkbox");
      break;
    case "Ellipse":
      createShapeAttributeString(shape, "ID (Make Unique): ", "id");;
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
      createShapeAttributeString(shape, "Line Join Point Shape (miter, round, or bevel): ", "lineJoin","String");
      createShapeAttributeString(shape, "Line Cap Shape (butt, round, or square): ", "lineCap","String");
      createShapeAttributeString(shape, "Rotation (Degrees): ", "rotation", "number");
      createShapeAttributeString(shape, "Line Color: ", "stroke", "color");
      createShapeAttributeString(shape, "Line Width: ", "strokeWidth", "number");
      createShapeAttributeString(shape, "Line Width Enabled (true/false): ", "strokeEnabled", "checkbox");
      break;
    case "Arrow":
      createShapeAttributeString(shape, "ID (Make Unique): ", "id");
      createShapeAttributeString(shape, "Line Join Point Shape (miter, round, or bevel): ", "lineJoin","String");
      createShapeAttributeString(shape, "Line Cap Shape (butt, round, or square): ", "lineCap","String");
      createShapeAttributeString(shape, "Rotation (Degrees): ", "rotation", "number");
      createShapeAttributeString(shape, "Fill Color: ", "fill", "color");
      createShapeAttributeString(shape, "Fill Pointer Enabled (true/false): ", "fillEnabled", "checkbox");
      createShapeAttributeString(shape, "Line Color: ", "stroke", "color");
      createShapeAttributeString(shape, "Line Width: ", "strokeWidth", "number");
      createShapeAttributeString(shape, "Line Width Enabled (true/false): ", "strokeEnabled", "checkbox");
      break;
    case "Text":
      createShapeAttributeString(shape, "ID (Make Unique): ", "id");
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
      createShapeAttributeString(shape, "Line Cap Shape (butt, round, or square): ", "lineCap","String");
      createShapeAttributeString(shape, "Rotation (Degrees): ", "rotation", "number");
      createShapeAttributeString(shape, "curve Color: ", "stroke", "color");
      createShapeAttributeString(shape, "curve Width: ", "strokeWidth", "number");
      createShapeAttributeString(shape, "curve Width Enabled (true/false): ", "strokeEnabled", "checkbox");
      break;
    case "RegularPolygon":
      var polygonSides = shape.attrs["sides"];
      if(polygonSides == 3){
        createShapeAttributeString(shape, "ID (Make Unique): ", "id");
        createShapeAttributeString(shape, "Rotation (Degrees): ", "rotation", "number");
        createShapeAttributeString(shape, "Fill Color: ", "fill", "color");
        createShapeAttributeString(shape, "Fill Enabled (true/false): ", "fillEnabled", "checkbox");
        createShapeAttributeString(shape, "Shape Outline Color: ", "stroke", "color");
        createShapeAttributeString(shape, "Shape Outline Width: ", "strokeWidth", "number");
        createShapeAttributeString(shape, "Shape Outline Enabled (true/false): ", "strokeEnabled", "checkbox");
      }
      else if(polygonSides == 4){
        createShapeAttributeString(shape, "ID (Make Unique): ", "id");
        createShapeAttributeString(shape, "Rotation (Degrees): ", "rotation", "number");
        createShapeAttributeString(shape, "Fill Color: ", "fill", "color");
        createShapeAttributeString(shape, "Fill Enabled (true/false): ", "fillEnabled", "checkbox");
        createShapeAttributeString(shape, "Shape Outline Color: ", "stroke", "color");
        createShapeAttributeString(shape, "Shape Outline Width: ", "strokeWidth", "number");
        createShapeAttributeString(shape, "Shape Outline Enabled (true/false): ", "strokeEnabled", "checkbox");        
      }
      else if(polygonSides == 5){
        createShapeAttributeString(shape, "ID (Make Unique): ", "id");
        createShapeAttributeString(shape, "Rotation (Degrees): ", "rotation", "number");
        createShapeAttributeString(shape, "Fill Color: ", "fill", "color");
        createShapeAttributeString(shape, "Fill Enabled (true/false): ", "fillEnabled", "checkbox");
        createShapeAttributeString(shape, "Shape Outline Color: ", "stroke", "color");
        createShapeAttributeString(shape, "Shape Outline Width: ", "strokeWidth", "number");
        createShapeAttributeString(shape, "Shape Outline Enabled (true/false): ", "strokeEnabled", "checkbox");       
      }
      else if(polygonSides == 6){
        createShapeAttributeString(shape, "ID (Make Unique): ", "id");
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

  // updating Shape Info tab with the table having editing widgets and an Update button
  if (isShapeValid) {
    shapeInfoTable += "</tbody></table><br>";
    var objInfo = document.getElementById("Shape Info");
    objInfo.innerHTML = shapeInfoTable;
    if (shape.getClassName() == "Text") {
        // Handling of text edit
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
    clearShapeInfo();
  }
} 

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
      tempBox.removeAttribute("checked");
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
  shapeInfoTable += rowPrefix + string + rowMiddle + tempBox.outerHTML + rowSuffix;
}

// Assigning unique shape ID
function setShapeID(shape) {
  if (!shape.id()) {
    shape.id(shape.getClassName() + "ID" + ("000000"+nextShapeID++).slice(-6));
  }
}

//set Shape attribute to reflect in the Shape Info Tab
function setSelectedShapeAttributes(shape) {
  var isShapeValid = true;
  switch(shape.getClassName()){
    case "Circle":
      shape.setAttr("id", document.getElementById(shape.id() + "id").value);
      shape.setAttr("radius", +(document.getElementById(shape.id() + "radius").value));
      shape.setAttr("fill", document.getElementById(shape.id() + "fill").value);
      shape.setAttr("fillEnabled", document.getElementById(shape.id() + "fillEnabled").checked);
      shape.setAttr("stroke", document.getElementById(shape.id() + "stroke").value);
      shape.setAttr("strokeWidth", +(document.getElementById(shape.id() + "strokeWidth").value));
      shape.setAttr("strokeEnabled", document.getElementById(shape.id() + "strokeEnabled").checked);
      break;
      case "Ellipse":
      shape.setAttr("id", document.getElementById(shape.id() + "id").value);
      shape.setAttr("rotation", +(document.getElementById(shape.id() + "rotation").value));
      shape.setAttr("radiusX", +(document.getElementById(shape.id() + "radiusX").value));
      shape.setAttr("radiusY", +(document.getElementById(shape.id() + "radiusY").value));
      shape.setAttr("fill", document.getElementById(shape.id() + "fill").value);
      shape.setAttr("fillEnabled", document.getElementById(shape.id() + "fillEnabled").checked);
      shape.setAttr("stroke", document.getElementById(shape.id() + "stroke").value);
      shape.setAttr("strokeWidth", +(document.getElementById(shape.id() + "strokeWidth").value));
      shape.setAttr("strokeEnabled", document.getElementById(shape.id() + "strokeEnabled").checked);
      break;
    case "Rect":
      shape.setAttr("id", document.getElementById(shape.id() + "id").value);
      shape.setAttr("rotation", +(document.getElementById(shape.id() + "rotation").value));
      shape.setAttr("fill", document.getElementById(shape.id() + "fill").value);
      shape.setAttr("fillEnabled", document.getElementById(shape.id() + "fillEnabled").checked);
      shape.setAttr("stroke", document.getElementById(shape.id() + "stroke").value);
      shape.setAttr("strokeWidth", +(document.getElementById(shape.id() + "strokeWidth").value));
      shape.setAttr("strokeEnabled", document.getElementById(shape.id() + "strokeEnabled").checked);
      break;
    case "Line":
      shape.setAttr("id", document.getElementById(shape.id() + "id").value);
      shape.setAttr("lineJoin", document.getElementById(shape.id() + "lineJoin").value);
      shape.setAttr("lineCap", document.getElementById(shape.id() + "lineCap").value);
      shape.setAttr("rotation", +(document.getElementById(shape.id() + "rotation").value));
      shape.setAttr("stroke", document.getElementById(shape.id() + "stroke").value);
      shape.setAttr("strokeWidth", +(document.getElementById(shape.id() + "strokeWidth").value));
      shape.setAttr("strokeEnabled", document.getElementById(shape.id() + "strokeEnabled").checked);
      break;
    case "Arrow":
      shape.setAttr("id", document.getElementById(shape.id() + "id").value);
      shape.setAttr("lineJoin", document.getElementById(shape.id() + "lineJoin").value);
      shape.setAttr("lineCap", document.getElementById(shape.id() + "lineCap").value);
      shape.setAttr("rotation", +(document.getElementById(shape.id() + "rotation").value));
      shape.setAttr("fill", document.getElementById(shape.id() + "fill").value);
      shape.setAttr("fillEnabled", document.getElementById(shape.id() + "fillEnabled").checked);
      shape.setAttr("stroke", document.getElementById(shape.id() + "stroke").value);
      shape.setAttr("strokeWidth", +(document.getElementById(shape.id() + "strokeWidth").value));
      shape.setAttr("strokeEnabled", document.getElementById(shape.id() + "strokeEnabled").checked);
        break;
    case "Text":
      shape.setAttr("id", document.getElementById(shape.id() + "id").value);
      shape.setAttr("text", document.getElementById(shape.id() + "textarea").value);
      shape.setAttr("rotation", +(document.getElementById(shape.id() + "rotation").value));
      shape.setAttr("fill", document.getElementById(shape.id() + "fill").value);
      shape.setAttr("fillEnabled", document.getElementById(shape.id() + "fillEnabled").checked);
      shape.setAttr("stroke", document.getElementById(shape.id() + "stroke").value);
      shape.setAttr("strokeWidth", +(document.getElementById(shape.id() + "strokeWidth").value));
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
      break;
    case "Shape":
      shape.setAttr("id", document.getElementById(shape.id() + "id").value);
      shape.setAttr("lineCap", document.getElementById(shape.id() + "lineCap").value);
      shape.setAttr("rotation", +(document.getElementById(shape.id() + "rotation").value));
      shape.setAttr("stroke", document.getElementById(shape.id() + "stroke").value);
      shape.setAttr("strokeWidth", +(document.getElementById(shape.id() + "strokeWidth").value));
      shape.setAttr("strokeEnabled", document.getElementById(shape.id() + "strokeEnabled").checked);
      break;
      case "Star":
        shape.setAttr("id", document.getElementById(shape.id() + "id").value);
        shape.setAttr("numPoints",document.getElementById(shape.id() + "numPoints").value);
        shape.setAttr("rotation", +(document.getElementById(shape.id() + "rotation").value));
        shape.setAttr("fill", document.getElementById(shape.id() + "fill").value);
        shape.setAttr("lineJoin", document.getElementById(shape.id() + "lineJoin").value);
        shape.setAttr("lineCap", document.getElementById(shape.id() + "lineCap").value);

        shape.setAttr("fillEnabled", document.getElementById(shape.id() + "fillEnabled").checked);
        shape.setAttr("stroke", document.getElementById(shape.id() + "stroke").value);
        shape.setAttr("strokeWidth", +(document.getElementById(shape.id() + "strokeWidth").value));

        shape.setAttr("strokeEnabled", document.getElementById(shape.id() + "strokeEnabled").checked);
      break;
      case "Ring":
        shape.setAttr("id", document.getElementById(shape.id() + "id").value);
        shape.setAttr("innerRadius", +(document.getElementById(shape.id() + "innerRadius").value));
        shape.setAttr("outerRadius", +(document.getElementById(shape.id() + "outerRadius").value));
        shape.setAttr("fill", document.getElementById(shape.id() + "fill").value);

        shape.setAttr("fillEnabled", document.getElementById(shape.id() + "fillEnabled").checked);
        shape.setAttr("stroke", document.getElementById(shape.id() + "stroke").value);
        shape.setAttr("strokeWidth", +(document.getElementById(shape.id() + "strokeWidth").value));

        shape.setAttr("strokeEnabled", document.getElementById(shape.id() + "strokeEnabled").checked);
        break;
      case "RegularPolygon":
        var polygonSides = shape.attrs["sides"];
        if(polygonSides == 3){
          shape.setAttr("id", document.getElementById(shape.id() + "id").value);
      shape.setAttr("rotation", +(document.getElementById(shape.id() + "rotation").value));
      shape.setAttr("fill", document.getElementById(shape.id() + "fill").value);
      shape.setAttr("fillEnabled", document.getElementById(shape.id() + "fillEnabled").checked);
      shape.setAttr("stroke", document.getElementById(shape.id() + "stroke").value);
      shape.setAttr("strokeWidth", +(document.getElementById(shape.id() + "strokeWidth").value));
      shape.setAttr("strokeEnabled", document.getElementById(shape.id() + "strokeEnabled").checked);
        }
        else if(polygonSides == 4){
          shape.setAttr("id", document.getElementById(shape.id() + "id").value);
      shape.setAttr("rotation", +(document.getElementById(shape.id() + "rotation").value));
      shape.setAttr("fill", document.getElementById(shape.id() + "fill").value);
      shape.setAttr("fillEnabled", document.getElementById(shape.id() + "fillEnabled").checked);
      shape.setAttr("stroke", document.getElementById(shape.id() + "stroke").value);
      shape.setAttr("strokeWidth", +(document.getElementById(shape.id() + "strokeWidth").value));
      shape.setAttr("strokeEnabled", document.getElementById(shape.id() + "strokeEnabled").checked);
        }
        else if(polygonSides == 5){
          shape.setAttr("id", document.getElementById(shape.id() + "id").value);
      shape.setAttr("rotation", +(document.getElementById(shape.id() + "rotation").value));
      shape.setAttr("fill", document.getElementById(shape.id() + "fill").value);
      shape.setAttr("fillEnabled", document.getElementById(shape.id() + "fillEnabled").checked);
      shape.setAttr("stroke", document.getElementById(shape.id() + "stroke").value);
      shape.setAttr("strokeWidth", +(document.getElementById(shape.id() + "strokeWidth").value));
      shape.setAttr("strokeEnabled", document.getElementById(shape.id() + "strokeEnabled").checked);
          
        }
        else if(polygonSides == 6){
          shape.setAttr("id", document.getElementById(shape.id() + "id").value);
      shape.setAttr("rotation", +(document.getElementById(shape.id() + "rotation").value));
      shape.setAttr("fill", document.getElementById(shape.id() + "fill").value);
      shape.setAttr("fillEnabled", document.getElementById(shape.id() + "fillEnabled").checked);
      shape.setAttr("stroke", document.getElementById(shape.id() + "stroke").value);
      shape.setAttr("strokeWidth", +(document.getElementById(shape.id() + "strokeWidth").value));
      shape.setAttr("strokeEnabled", document.getElementById(shape.id() + "strokeEnabled").checked);

        }
        break;
    default:
      isShapeValid = false;
      alert("Shape not valid");
      break;
  }

  //updating the canvas with the valid shape
  if (isShapeValid) {
    stageDraw.find('Transformer').forceUpdate();      // fitting Transformer to the shape drawn
    layerDraw.draw();
  }
}

//creating download link for the canvas
function downloadURI(uri, name) {
    var link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    delete link;
}

//saving the canvas as jpeg file
function canvasToJpg() {
    var dataURL = stageDraw.toDataURL();
    downloadURI(dataURL, 'canvasimage.jpg');
}

//saving the canvas as PDF
function canvasToPdf(){
var pdf = new jsPDF('l', 'px', 'a3');
pdf.setTextColor('#000000');
stageDraw.find('Text').forEach(text => {
  const size = text.fontSize() / 0.75; // converting pixels to points
  pdf.setFontSize(size);
});
pdf.addImage(
  stageDraw.toDataURL({ pixelRatio: 3 }),
  0,
  0,
  stageDraw.width(),
  stageDraw.height()
);

pdf.save('canvasPDF.pdf');
}

//converting the existing canvas with shapes on it to a JSON format and saving it as a .json file
function canvasToJson(){
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

//open the file explorer and load the .json file and display it on the canvas
function loadJson(){
  var input = document.createElement('input');
  input.type = 'file';
  input.onchange = e => { 
    var selectedFile = e.target.files[0]; 
  var fileread = new FileReader();
  fileread.readAsText(selectedFile);
  fileread.onload = function(e) {
    var content = e.target.result;
    var intern = JSON.parse(content);
    stageDraw = Konva.Node.create(intern, 'canvas');
  };
 }
  input.click(); 
}