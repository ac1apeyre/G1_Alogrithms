//PATH EXTRACTION 

//Given a ray described by an initial point P0 and a direction V both in world coordinates, 
//check to see if it intersects the polygon described by "vertices," an array of vec3
//values describing the location of the polygon vertices in its child frame.
//mvMatrix is a matrix describing how to transform "vertices" into world coordinates
//which you will have to do to get the correct intersection in world coordinates.
//Be sure to compute the plane normal only after you have transformed the points,
//and be sure to only compute intersections which are inside of the polygon
//(you can assume that all polygons are convex and use the area method)

function rayIntersectPolygon(P0, V, vertices, mvMatrix) {
	//TODO: Fill this in
	//Step 1: Make a new array of vec3s which holds "vertices" transformed to world 
	//coordinates (hint: vec3 has a function "transformMat4" which is useful)
	//Step 2: Compute the plane normal of the plane spanned by the transformed vertices
	//Step 3: Perform ray intersect plane
	//Step 4: Check to see if the intersection point is inside of the transformed 
	//polygon. You can assume that the polygon is convex.  If you use the area test, 
	//you can allow for some wiggle room in the two areas you're comparing (e.g. 
	//absolute difference not exceeding 1e-4)
	//Step 5: Return the intersection point if it exists or null if it's outside
	//of the polygon or if the ray is perpendicular to the plane normal (no intersection)
	return {t:1e9, P:vec3.fromValues(0, 0, 0)}; //These are dummy values 
	//you should return both an intersection point and a parameter t.  The parameter t 
	//will be used to sort intersections in order of occurrence to figure out which one happened first
}





function addImageSourcesFunctions(scene) {
	//Purpose: A recursive function provided which helps to compute intersections
	//of rays with all faces in the scene, taking into consideration the scene graph
	//structure

	//Inputs: P0 (vec3): Ray starting point, V (vec3): ray direction
	//node (object): node in scene tree to process, 
	//mvMatrix (mat4): Matrix to put geometry in this node into world coordinates
	//excludeFace: Pointer to face object to be excluded (don't intersect with
	//the face that this point lies on)
	//Returns: null if no intersection,
	//{tmin:minimum t along ray, PMin(vec3): corresponding point, faceMin:Pointer to mesh face hit first}
    
	//NOTE: Calling this function with node = scene and an identity matrix for mvMatrix
	//will start the recursion at the top of the scene tree in world coordinates
	
	//PROVIDED 
	scene.rayIntersectFaces = function(P0, V, node, mvMatrix, excludeFace) {
		var tmin = Infinity; //The parameter along the ray of the nearest intersection
		var PMin = null; //The point of intersection corresponding to the nearest interesection
		var faceMin = null;//The face object corresponding to the nearest intersection
		if (node === null) {
			return null;
		}
		if ('mesh' in node) { //Make sure it's not just a dummy transformation node
			var mesh = node.mesh;
			for (var f = 0; f < mesh.faces.length; f++) {
				if (mesh.faces[f] == excludeFace) {
				continue; //Don't re-intersect with the face this point lies on
				}
				//Intersect the ray with this polygon
				var res = rayIntersectPolygon(P0, V, mesh.faces[f].getVerticesPos(), mvMatrix);
				if (!(res === null) && (res.t < tmin)) {
					tmin = res.t;
					PMin = res.P;
					faceMin = mesh.faces[f];
				}
			}
		}
		if ('children' in node) {
		//Recursively check the meshes of the children to make sure the ray doesn't intersect any of them first
			for (var i = 0; i < node.children.length; i++) {
				var nextmvMatrix = mat4.create();
				//Multiply on the right by the next transformation of the child node
				mat4.mul(nextmvMatrix, mvMatrix, node.children[i].transform);
				//Recursively intersect with the child node
				var cres = scene.rayIntersectFaces(P0, V, node.children[i], nextmvMatrix, excludeFace);
				if (!(cres === null) && (cres.tmin < tmin)) {
					tmin = cres.tmin;
					PMin = cres.PMin;
					faceMin = cres.faceMin;
				}
			}
		}
		if (PMin === null) {
			return null;
		}
		return {tmin:tmin, PMin:PMin, faceMin:faceMin};
	}
 


	//IMAGE SOURCE GENERATION
	//Purpose: Fill in the array scene.imsources[] with a bunch of source objects. 
	//Inputs: order (int) : maximum number of bounces to take
	//Notes: 
	//source objects need "pos", "genFace", "rcoeff", "order", & "parent" fields (at least)
    	//use recursion (reflecting images of images of images (etc.) across polygon faces)

	scene.computeImageSources = function(order) {
		scene.source.order = 0; //how many bounces a particular image represents
		scene.source.rcoeff = 1.0; //reflection coefficient of the node that gave rise to this source
		scene.source.parent = null; //image source's parent
		scene.source.genFace = null; //mesh face that generated image (don't reflect an image across this face- you'll get parent image)
	
		scene.imsources = [scene.source];

		for (var o = 1; o<=order; o++){
			//check all previous image sources in scene.imsources
			for (var s=0; s<scene.imsources.length; s++){
				//only reflect image sources with an order less than the current order
				if (scene.imsources[s].order === (o-1)){
					//TODO: reflect this image source by calling recursive scene tree function
					//TODO: generate images of 'snew'
					snew.parent=s;
					//TODO: snew.genFace = "face reflected";
				}
			}
		}

		//TODO: complete the recursive scene graph traversal
		// Start off recursion by calling it with scene and the identity matrix: func(scene, mat4.create())
  		// for each node in the scene graph
  			for c in node.children:// for each child in node.children:
  				if (mesh in node){ // check if node is dummy: if not dummy node, it will have a mesh object
  					var mesh = node.mesh; // access the mesh object
  					for (var f = 0; f < mesh.faces.length; f++){ //loop through the array of its faces
  						var face = mesh.faces[f]; // pointer to face
       						var vertices = face.getVerticesPos(); //get all vertices for a 'face' in CCW order
       						// Note: 'vertices' is an array of vec3 objects; positions are in NODE COORDINATE SYSTEM (NCS)
       						// Convert vertices from NCS to WCS: 
       						var nextmvMatrix = mat4.create(); //Allocate transformation matrix
       						mat4.mul(nextmvMatrix, mvMatrix, c.transform); //Calculate transformation matrix based on hierarchy
       						var wc_vertices = []; //Make a new array that will contains vertices (vec3s) in WCS
       						for vertex in vertices: 
       							var wc_vertex= vec3.create(); //allocate a vector for the transfromed vertex
       							vec3.transformMat4(wc_vertex, vertex, nextmvMatrix);
						// TODO: Create the virtual source (mirror image) across each face (plane)
							// Use vertices to find a point 'q' on the plane
							// Create a vector from the source to this point (vec=source-q)
							// calculate plane normal using transformed vertices
							// The mirror image of s, snew =  s - 2((s-q)*n)*n
							// add snew to scene.imsources[]
							// remember to create a few object fields: pos, order, rcoeff, parent, genface
  							// Note: Reflect images across faces in WORLD COORDINATES
  					}
  				}
  				//TODO: recursive call on child -- f(c, mat4,mul(mvMatrix,node.transform));--- ???


		//FOR DEBUGGING PURPOSES
		//Display all image sources to the console
		//# virtual images: N(N-1)^(r-1) where N = number of faces in a scene and r is the order 
		for (var a = 0; a < scene.imsources.length; a++) {
    			console.log(scene.imsources[a]);
		}
		
	}    
    
    



	//Purpose: Based on the extracted image sources, trace back paths from the
    
	//receiver to the source, checking to make sure there are no occlusions
    
	//along the way.  Remember, you're always starting by tracing a path from
    
	//the receiver to the image, and then from the intersection point with
    
	//that image's corresponding face to the image's parent, and so on
    
	//all the way until you get back to the original source.
    
    
	//Fill in the array scene.paths, where each element of the array is itself
    
	//an array of objects describing vertices along the path, starting
    
	//with the receiver and ending with the source.  Each object in each path
    
	//array should contain a field "pos" which describes the position, as well
    
	//as an element "rcoeff" which stores the reflection coefficient at that
    
	//part of the path, which will be used to compute decays in "computeInpulseResponse()"
    
	//Don't forget the direct path from source to receiver!
    


	/**PATH EXTRACTION**
	scene.extractPaths = function() {
        
		scene.paths = [];
        
        
		//TODO: Finish this. Extract the rest of the paths by backtracing from
        
		//the image sources you calculated.  Return an array of arrays in
        
		//scene.paths.  Recursion is highly recommended
      
		//Each path should start at the receiver and end at the source
        
		//(or vice versa), so scene.receiver should be the first element 
        
		//and scene.source should be the last element of every array in 
        
		//scene.paths
    
	}


    
    
    
	//Inputs: Fs: Sampling rate (samples per second)
    
	

	//**IMPULSE RESPONSE GENERATION**
	scene.computeImpulseResponse = function(Fs) {
        
		var SVel = 340;	//Sound travels at 340 meters/second
        

		//TODO: Finish this.  Be sure to scale each bounce by 1/(1+r^p), 
        
		//where r is the length of the line segment of that bounce in meters
        
		//and p is some integer less than 1 (make it smaller if you want the 
        
		//paths to attenuate less and to be more echo-y as they propagate)
        
		//Also be sure to scale by the reflection coefficient of each material
        
		//bounce (you should have stored this in extractPaths() if you followed
        
		//those directions).  Use some form of interpolation to spread an impulse
        
		//which doesn't fall directly in a bin to nearby bins
        
		//Save the result into the array scene.impulseResp[]
    
	}

}
