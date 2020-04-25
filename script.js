
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhZGVjYzY1Ni04YTFlLTQ3NjMtYjMwZC02YjdmY2ZjNTdmMTEiLCJpZCI6MjQ3MjcsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1ODU2NjMzMTl9.tDY0vHStcjlbJk7Ertkp6ufLncW7lr7K9zqwUviD53U';
    var viewer = new Cesium.Viewer('cesiumContainer', {
        terrainProvider: Cesium.createWorldTerrain(),
        shouldAnimate : true,
        shadows : false, //display shadows of models
        requestWaterMask : true, // required for water effects
        requestVertexNormals : true // required for terrain lighting
      
    });

//--Viewer--//
//some nicer lights
viewer.scene.globe.enableLighting = true;
// Create an initial camera view
var initialPosition = new Cesium.Cartesian3.fromDegrees(11.666129, 48.259988, 1500.0);
var initialOrientation = new Cesium.HeadingPitchRoll.fromDegrees(7.1077496389876024807, -41.987223091598949054, 0.025883251314954971306);
var homeCameraView = {
    destination : initialPosition,
    orientation : {
        heading : initialOrientation.heading,
        pitch : initialOrientation.pitch,
        roll : initialOrientation.roll
    }
};
// Set the initial view
viewer.scene.camera.setView(homeCameraView);

// Add some camera flight animation options, when clicked "home"
homeCameraView.duration = 3.0;
homeCameraView.maximumHeight = 2000;
homeCameraView.pitchAdjustHeight = 2000;
homeCameraView.endTransform = Cesium.Matrix4.IDENTITY;
// Override the default home button
viewer.homeButton.viewModel.command.beforeExecute.addEventListener(function (e) {
    e.cancel = true;
    viewer.scene.camera.flyTo(homeCameraView);
});


//--Locations--//
//location of the Hyperloop building
var latitudeTUM = 11.668383;
var longitudeTUM = 48.267483;
 
//location of the "cesium guy"
var latitude2 = 11.668560;
var longitude2 = 48.267643;

//Berlin city centre
var latitudeBer = 13.406181;
var longitudeBer = 52.518994;

//--Orientation--//
var positionGuy = Cesium.Cartesian3.fromDegrees(latitude2, longitude2);
var heading = Cesium.Math.toRadians(-75.0);
var pitch = Cesium.Math.toRadians(0.0);
var roll = Cesium.Math.toRadians(0.0);
var orientationGuy = Cesium.Transforms.headingPitchRollQuaternion(positionGuy, new Cesium.HeadingPitchRoll(heading, pitch, roll));

//--Static 3D Objects---//
//function to retrieve color
function getColor(colorName, alpha) {
    var color = Cesium.Color[colorName.toUpperCase()];
    return Cesium.Color.fromAlpha(color, parseFloat(alpha));
}
//some more colors and transparency
var viewModel = {
  color: 'Red',
  alpha: 0.6
}

//walking man from Cesium, fixed to position, hosted on Cesium ion
var cesiumGuy = Cesium.IonResource.fromAssetId(87809)
    .then(function (resource) {
        var cesiumGuyentity = viewer.entities.add({
            position: positionGuy,
            orientation : orientationGuy,
            model: {
                uri: resource,
                heightReference : Cesium.HeightReference.CLAMP_TO_GROUND,
                minimumPixelSize : 128,
                maximumScale : 100,
                scale : 20,
                color : getColor(viewModel.color, viewModel.alpha)
            }
        });
      //enable this below to fix camera above the "cesium guy" object
	  //viewer.trackedEntity = entity;

      //Get Location of the entity and pass it to infobox
            var cartographicPosition = Cesium.Cartographic.fromCartesian(entity.position.getValue(Cesium.JulianDate.now()));
            var longitude = Cesium.Math.toDegrees(cartographicPosition.longitude);
            var latitude = Cesium.Math.toDegrees(cartographicPosition.latitude);

            var description = '<table class="cesium-infoBox-defaultTable cesium-infoBox-defaultTable-lighter"><tbody>' +
                '<tr><th>' + "Longitude" + '</th><td>' + longitude.toFixed(5) + '</td></tr>' +
                '<tr><th>' + "Latitude" + '</th><td>' + latitude.toFixed(5) + '</td></tr>' +
                '</tbody></table>';
            cesiumGuyentity.description = description;
            cesiumGuyentity.name = 'Cesium guy';
    })
    .otherwise(function (error) {
        console.log(error);
    });    


//add polyline Munich-Berlin
var lineEntity = viewer.entities.add({
    polyline : {
        positions : Cesium.Cartesian3.fromDegreesArray([
                    latitude2, longitude2,
                    latitudeBer, longitudeBer]),
        clampToGround : true,  
        width : 10,
                    material : new Cesium.PolylineOutlineMaterialProperty({
                    color : Cesium.Color.BLUE,
                    outlineWidth : 2,
                    outlineColor : Cesium.Color.BLACK
                }),
        distanceDisplayCondition : new Cesium.DistanceDisplayCondition(0.0, 1500000.0)
}});


//--Pop-Ups--//

//line selection description
lineEntity.name = 'Munich - Berlin route';
lineEntity.description = '\
<img\
  width="100%"\
  style="float:left; margin: 0 1em 1em 0;"\
  src="./screenshots/pod.jpg"/>\
<p>\
  Hyperloop route Munich - Berlin\
</p>\
<p>\
  Simulation team saluts you!\
\
\
\
\
\
</p>\
<p>\
  Source: \
  <a style="color: WHITE"\
    target="_blank"\
    href="https://www.flickr.com/photos/148755431@N04/43573944782/">TUM Hyperloop</a>\
</p>';



//--Moving 3D Objects--//

//Set the random number seed for consistent results.
Cesium.Math.setRandomNumberSeed(3);

//Set bounds of our simulation time
var start = Cesium.JulianDate.fromDate(new Date(2015, 2, 25, 16));
var stop = Cesium.JulianDate.addSeconds(start, 120, new Cesium.JulianDate());

//Make sure viewer is at the desired time.
viewer.clock.startTime = start.clone();
viewer.clock.stopTime = stop.clone();
viewer.clock.currentTime = start.clone();
viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //Loop at the end
viewer.clock.multiplier = 0.05; //change speed of the model
viewer.clock.shouldAnimate = true;

//Set timeline to simulation bounds
viewer.timeline.zoomTo(start, stop);


var entityPosition = new Cesium.Cartesian3();
var entityOrientation = new Cesium.Quaternion();
var rotationMatrix = new Cesium.Matrix3();
var modelMatrix = new Cesium.Matrix4();

function computeModelMatrix(entity, time) {
    return entity.computeModelMatrix(time, new Cesium.Matrix4());
}

var translation = new Cesium.Cartesian3();
var rotation = new Cesium.Quaternion();
var hpr = new Cesium.HeadingPitchRoll();
var trs = new Cesium.TranslationRotationScale();


var pos1 = Cesium.Cartesian3.fromDegrees(latitudeTUM, longitudeTUM);
var pos2 = Cesium.Cartesian3.fromDegrees(latitudeBer, longitudeBer);
var position = new Cesium.SampledPositionProperty();

position.addSample(start, pos1);
position.addSample(stop, pos2);

//add glTF object, arbitrary vehicle hosted on Cesium ion
var buggyMoving = Cesium.IonResource.fromAssetId(87734)
    .then(function (resource) {
    var entity = viewer.entities.add({
        availability : new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
            start : start,
            stop : stop
        })]),
        model : {
            uri : resource,
			heightReference : Cesium.HeightReference.CLAMP_TO_GROUND,
            minimumPixelSize : 128,
            maximumScale : 100,
            scale : 0.25
            //color : getColor(viewModel.color, viewModel.alpha)
        },
        position : position,
        orientation : new Cesium.VelocityOrientationProperty(position)
    });
	//enable this below to fix moving camera above the "buggy" object
	//viewer.trackedEntity = entity;
	
	        //Add infobox to model
            entity.name = 'Buggy';
	
    })
	    .otherwise(function (error) {
        console.log(error);
    });    
    
