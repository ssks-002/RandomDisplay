// Variable and initial value declaration, initialization
var intervalvalue = {};
intervalvalue.text = 15;

// ScriptIPanel layout and each event setting
var buttongroup = this.add("group", undefined);
buttongroup.orientation="row";

var applybutton = buttongroup.add('button', undefined,"Apply");
var intervalgroup = buttongroup.add("group", undefined);
var intervaltext =  intervalgroup.add("statictext", undefined,"interval");
intervalvalue = intervalgroup.add("edittext", undefined,  intervalvalue ? intervalvalue.text : "15");

this.layout.layout();
this.onResize = function(){
    this.layout.resize();
    };

applybutton.onClick = function (){
    // Mainprocess
    app.beginUndoGroup("RandomDisplay");

    // Get total number of selected layers
    var selectedLayers = app.project.activeItem.selectedLayers;
    var totalLayers = selectedLayers.length;

    if(totalLayers !== 0){
        // Create nulllayer
        var nullLayer = app.project.activeItem.layers.addNull();
        nullLayer.name = "Random Display";

        // Set interval slider
        var intervalSlider = nullLayer.Effects.addProperty("ADBE Slider Control");
        intervalSlider.name = "Interval Control";
        intervalSlider.property("ADBE Slider Control-0001").setValue(intervalvalue ? intervalvalue.text : 15);

        // Set seed slider
        var randomSlider = nullLayer.Effects.addProperty("ADBE Slider Control");
        randomSlider.name = "Random Control";

        // Set display number slider
        var layercontrolnumberSlider = nullLayer.Effects.addProperty("ADBE Slider Control");
        layercontrolnumberSlider.name = "Layer Control Number";

        // Calculate random numbers using seed slider value
        nullLayer.effect("Layer Control Number")(1).expression =
            'seedRandom(thisLayer.effect(\"Random Control\")(1), true);\n' +
            "posterizeTime(thisLayer.effect(\"Interval Control\")(1));\n" +
            "value = Math.floor(random(1, " + totalLayers + " + 1));"

        // Process selected layer
        for (var i = 1; i <= totalLayers; i++) {
            var layer = selectedLayers[i - 1];

            // Assign numbers to each layer
            var layernumber = layer.Effects.addProperty("ADBE Slider Control");
            layernumber.name = "Random Display Layer Number";
            layernumber.property("ADBE Slider Control-0001").setValue(i);
            
            // Fix layer number
            layer.effect("Random Display Layer Number")(1).expression =
                "value = "+ i +""

            // Add transform effects selected layer
            var transform = layer.Effects.addProperty("ADBE Geometry2");
            transform.name = "Random Display"
        
            // Set display expression
            layer.effect("Random Display")(9).expression = 
                "DisplayNumber = thisComp.layer(\"Random Display\").effect(\"Layer Control Number\")(1);\n" +
                "LayerNumber = thisLayer.effect(\"Random Display Layer Number\")(1);\n" +
                "if (parseInt(DisplayNumber) == parseInt(LayerNumber)) {\n" +
                "   value = 100;\n" +
                "   } else {\n" +
                "   value = 0;\n" +
                "   }"
        };
    }else{
        alert("No item selected");
    }
    app.endUndoGroup();
};