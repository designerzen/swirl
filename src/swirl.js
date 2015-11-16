// Canvas Swirler Transition by @designerzen

// Polfill vy Paul Irish
window.requestAnimFrame = ( function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();



// It is a Singleton Factory Model...
var Swirl = (function() {
	
	////////////////////////////////////////////////////////////////////////
	// Swirl Class
	// You can have as many swirl instances from images as you want :)
	////////////////////////////////////////////////////////////////////////
	var SwirlInstance = function( id, autoLoad )
	{
		var
			instance = this,
			// rotation on every frame (1 degree)
			rotation = 1*Math.PI/180,
			// initial radius
			radius = 1,
			//variance = 12,
			// size of the swirl asset
			swirlWidth = 1875,//900, 
			swirlHeight = 1686;//900,
		
			
		// Public Options
		
		// rate of animation (affects all)
		this.speed = 1;
		// percentage gap between centre and brush stroked
		this.swirlGap = 0.4;
		// Swirl size of the brush (for procedural)
		this.brushSize = 15;
		// How many strokes are there on the swirl?
		this.proceduralPieces = 150;
		// "lighter" "xor" "source-over"
		this.composition = "lighter";
		// swipe scale start
		this.initialScale = 0.001;
		// change in scale between frames
		this.scaleVariance = 0.00001;
		
		
		// Set variables
		var 
			image, 
			//imageData,
			canvas, context,
			swirl, swirlContext,
			imageElement = document.getElementById( id ),
			imageLoaded = false,
			triggered = false,
			swirlDrawn = false,
			complete = false,
			scale = 1,
			angle = 0,
			swirlURL,
			spinSpeed = 1,
			dimensions = {};
			
			
		// Constants
		var TWO_PI = Math.PI*2;
		
		this.toString = function()
		{
			return "Swirler - "+imageElement.src;
		};
		
		///////////////////////////////////////////////////////
		// PUBLIC > Fetch element that we are using to inject
		///////////////////////////////////////////////////////
		this.getElement = function()
		{
			return canvas || imageElement;
		}
		
		///////////////////////////////////////////////////////
		// PUBLIC > Load external Image
		///////////////////////////////////////////////////////
		this.load = function() 
		{
			// We have *already* loaded this image!
			if (imageLoaded) return this;
			
			// ERROR :
			// if there is *not* an image element...
			if (!imageElement)
			{
				// throw an error...
				console.error("Swirler error finding element with ID "+id );
				return this;
			}
			
			// Load image via JS
			image = new Image();
			image.addEventListener('load', onLoaded);
			image.src = imageElement.src;
			
			// Determine our context
			// create canvas as we have an image loading 
			canvas = document.createElement('canvas');
			context = canvas.getContext("2d");
			
			console.log("Swirler loading "+image.src);
			
			return this;
		}

		// Image has loaded, now paint
		function onLoaded()
		{
			image.removeEventListener('load', onLoaded);
		
			
			// check to see if we want a specific url for swirling...
			// now create our swirl
			swirlContext = createSwirl( swirlWidth, swirlHeight );
			swirl = swirlContext.canvas;
			//console.log("Creating Swirl ",swirl, instance.proceduralPieces, proceduralSpikes );	
			
			// load in the swirl if specified, otherwise use procedurallly generated!
			if (swirlURL) instance.loadSwirl( swirlURL );
			
			// and draw our recently loaded image into the canvas
			drawImage();
			
			console.log("Swirler loaded ");
			
			imageLoaded = true;
			if (triggered) animate();
		}
		
		///////////////////////////////////////////////////////
		// PUBLIC > Trigger animation!
		///////////////////////////////////////////////////////
		this.trigger = function ()
		{
			if (triggered) return;
			console.log("Swirler triggered "+(imageLoaded ? "now animating" : "stationary"));
			
			// check to see if swirl has been drawn...
			if (!swirlDrawn)
			{
				// draw swirl or load if specified
				var proceduralSpikes = swirlURL ? 0 : instance.proceduralPieces;
			
				drawSwirl( proceduralSpikes );
			}
			
			
			if (imageLoaded) animate();
			
			
			
			// now set our options
			spinSpeed = instance.speed*rotation;
			
			// set flag
			triggered = true;
			
			
			return this;
		};

		///////////////////////////////////////////////////////
		// PUBLIC > Restart this animation from zero!
		///////////////////////////////////////////////////////
		this.reset = function ()
		{
			// console.log( "Reset", this, context );
			scale = 1;
			angle = 0;
			
			// restore original canvas
			context.restore();
			context.globalCompositeOperation = instance.composition;
			
			// now start the animation again...
			instance.trigger();
			
			console.log("Swirler reset ");
			
			return this;
		}
		
		///////////////////////////////////////////////////////
		// PUBLIC > Load external Image into the Swirl
		///////////////////////////////////////////////////////
		this.loadSwirl = function( src )
		{
			console.log("Loading Swirl from "+src);
			swirlURL = src;
			if (swirlContext)
			{
				// now clear any stuff that exists in here already
				swirlContext.clearRect(0, 0, swirlWidth, swirlHeight );
				
				// if there is no canvas or context, defer until loaded...
				var swirlImage = new Image();
				
				// failed to load
				swirlImage.addEventListener('error', function()
				{
					swirlImage.removeEventListener('error', this);
					console.error("External swirl "+src+" failed");
					swirlURL = null;
				});
				
				// loaded succesfully :D
				swirlImage.addEventListener('load', function()
				{
					swirlDrawn = true;
					swirlImage.removeEventListener('load', this);
					swirlContext.drawImage(swirlImage, 0, 0 , swirlWidth, swirlHeight, 0,0 , swirlWidth, swirlHeight );
				});
				
				swirlImage.src = src;
			}
			return this;
		}
		
		
		// Create a unique and random swirl using code
		function drawSwirl( times )
		{
			var halfWidth = swirlWidth * 0.5,
				halfHeight = swirlHeight * 0.5;
			
			// set default times
			times = times || 150;
			
			for ( var v=0; v < times; ++v )
			{
				// Draw some circles
				var circleRadius = instance.brushSize * Math.random();
				// Math.random()*width
				// Math.random()*height
				var horizontalSize = halfWidth-circleRadius,
					horizontalGap = horizontalSize * instance.swirlGap,
					horizontalSpan = horizontalSize - horizontalGap,
					positionX = halfWidth + horizontalGap + Math.random()*horizontalSpan;
					 
				swirlContext.beginPath();
				// arc(x,y,radius,startAngle,endAngle,direction) 
				swirlContext.arc( positionX, halfHeight+Math.random()*40, circleRadius, 0, TWO_PI, true); 
				swirlContext.closePath();
				swirlContext.fill();
				
				/*
				// draw some paint stripes ( scalene triangles)
				swirlContext.beginPath();
				// arc(x,y,radius,startAngle,endAngle,direction) 
				swirlContext.arc( positionX, halfHeight+Math.random()*40, circleRadius, 0, TWO_PI, true); 
				swirlContext.closePath();
				swirlContext.fill();
				*/
				
				// Draw some rectangles
				swirlContext.fillRect( positionX, halfHeight, 1, circleRadius );
			}
			swirlDrawn = true;
			
			console.log("Creating procedural Swirl with "+times+" peaks circleRadius:"+circleRadius );
			
			return swirlContext;
		};
		
		
		
		function createSwirl( width, height, times )
		{
			var dynamicCanvas = document.createElement('canvas');
			dynamicCanvas.width  = width;
			dynamicCanvas.height = height;
			
			// draw some shit onto this element
			var dynamicContext = dynamicCanvas.getContext("2d");
			
			// debugger
			//dynamicContext.fillStyle = "#ff0000";
			//dynamicContext.fillRect(0, 0, width, height );
			dynamicContext.fillStyle = "#ffffff";
			
			return dynamicContext;
		}

		
		
		// Paint the original image onto the canvas
		function drawImage() 
		{
			// as the html can set the image to larger than 
			// the image's natural size...
			var stretched = imageElement.clientWidth != image.naturalWidth || imageElement.clientHeight != image.naturalHeight,
				oversized = imageElement.clientWidth > image.naturalWidth,
				overScale = imageElement.clientWidth / image.naturalWidth;
		
			// Full size image?
			//dimensions.width = image.naturalWidth;
			//dimensions.height = image.naturalHeight;
				
			// Element Sized Image
			dimensions.width = imageElement.clientWidth;
			dimensions.height = imageElement.clientHeight;
			
			dimensions.halfWidth = dimensions.width * 0.5;
			dimensions.halfHeight = dimensions.height * 0.5;
			
			console.log("Stretched "+stretched);
			console.log("oversized "+oversized);
			console.log("overScale "+overScale);
			
			dimensions.radius = dimensions.width > dimensions.height ? dimensions.width : dimensions.height;
			
			// Fetch canvas from DOM & resize to image's size
			canvas.id = imageElement.id;
			canvas.width = dimensions.width;
			canvas.height = dimensions.height;

			//context.fillStyle = "#ffffff";
			//context.globalAlpha = 0.5;

			// Blend Modes for compositions
			// "lighter" "xor" "source-over"
			context.globalCompositeOperation = instance.composition;
			
			// and resize to initial scale
			context.scale( overScale, overScale );
			
			// (img,sx,sy,swidth,sheight,x,y,width,height)
			// context.drawImage( image, 0,0, canvas.width, canvas.height, 0,0, dimensions.w, dimensions.h);
			context.drawImage( image, 0,0, dimensions.width, dimensions.height, 0,0, dimensions.width, dimensions.height);
			
			// now centre on the context
			context.translate( dimensions.halfWidth, dimensions.halfHeight );
			
			// save our context for resetting later!
			context.save();
			
			// and resize to initial scale
			context.scale( instance.initialScale, instance.initialScale );
			
			// Now replace the IMAGE DOM Element with the CANVAS DOM Element...
			//imageElement.parentNode.removeChild( imageElement );
			if ( imageElement.parentNode && canvas )
			{
				// as imageElement still has a parent, it is on the DOM
				imageElement.parentNode.replaceChild( canvas, imageElement );
			}
		};
		

		// Every Frame
		function update()
		{
			// clear canvas
			//context.clearRect(0, 0, dimensions.w, dimensions.h);

			// now draw overlay
			/*
			// Math.random() * 
			var sizeX = Math.random() * variance,
				 sizeY = Math.random() * variance,
				 //posX = radius * Math.sin( angle ) + dimensions.halfWidth,
				 //posY = radius * Math.cos( angle ) + dimensions.halfHeight,
				 angleDelta = angle;
			
			// update angle
			
			angleDelta = angle - angleDelta;
			// update radius too
			
			// Make a few at a time...
			for ( var v=0, l=100; v < l; ++v )
			{
				context.fillRect( posX - sizeX*0.5, posY - sizeY*0.5, sizeX, sizeY);
			}
			*/
			
			// update the angle (not neccessary for )
			//console.error( angle );
			angle += instance.speed;
			
			// dimensions.radius * 
			radius = 10*(angle/TWO_PI);
			
			if ( radius > dimensions.radius )
			{
				//console.log("end", radius ,dimensions.radius);
				//console.log("updating at end", "scale", scale, "spinSpeed", spinSpeed, "radius", radius );
				//context.globalAlpha -= 0.01;
			}else{
				//console.log("updating", scale);
				//console.log("updating", "scale", scale, "spinSpeed", spinSpeed, "radius", radius );
			}
			
			//context.translate( swirl.halfWidth, swirl.halfHeight );
			//context.translate( 2*Math.random()-1, 2*Math.random()-1 );
			//context.translate( 2*Math.random()-1, 2*Math.random()-1 );
			//context.translate( Math.random()-1, 0 );
			//context.translate( -20, 0 );
			//context.translate( dimensions.halfWidth,dimensions.halfHeight );
			//context.translate( -dimensions.halfWidth,-dimensions.halfHeight );
			
			
			//console.log("Update", scale);
			context.scale( scale, scale );
			scale += instance.scaleVariance;
			if (scale > 10 )
			{
				complete = true;
			}
			
			// Copy a canvas object onto our context
			context.rotate( spinSpeed );
			
			// (img,sx,sy,swidth,sheight,x,y,width,height)
			// swirlContext.drawImage(swirl, 0, 0, swirlWidth, swirlHeight, -swirlWidth/2,-swirlHeight/2 , swirlWidth, swirlHeight );
			context.drawImage( swirl, 0, 0, swirlWidth, swirlHeight, -swirlWidth/2,-swirlHeight/2 , swirlWidth, swirlHeight );
			// context.drawImage(swirl, 0,0, 100, 100, dimensions.halfWidth, dimensions.halfHeight);
			// context.drawImage(swirl, 0, 0, swirl.width, swirl.height, -swirl.width/2,-swirl.height/2 , swirl.width, swirl.height );
		}

		// Start Animation Loop and maintain 
		function animate() 
		{
			update();
			if (!complete) requestAnimFrame(animate);
		}
		
		// Expose public methods
		/*
		return {
			"reset":reset,
			"load":load,
			"loadSwirl":loadSwirl,
			"trigger":trigger,
			"getElement":getElement
		};*/
	};
	
// Contains *all* Swirls
	var instances = [],
		dictionary = {};
	
	// Factory
	function create( elementId )
	{
		var instance = new SwirlInstance( elementId );
		instances.push( instance );
		dictionary[ elementId ] = instance;
		return instance;
	};
	
	/*
	function fetchByIndex( index )
	{
		return instances[index];
	};
	
	function fetchById( elementId )
	{
		return dictionary[ elementId ];
	};
	*/
	function fetch( indexOrId )
	{
		return !isNan(indexOrId+0) ? instances[indexOrId] : dictionary[indexOrId];
	};

	return {
		"create":create,
		"fetch":fetch
	};
	
})();
