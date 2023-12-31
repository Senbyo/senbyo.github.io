main();

//
// Start here
//
function main() {
  const canvas = document.getElementById('glcanvas');
  const gl = canvas.getContext('webgl');

  // If we don't have a GL context, give up now

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Vertex shader program

//   const vsSource = `
//     attribute vec4 aVertexPosition;

//     uniform mat4 uModelViewMatrix;
//     uniform mat4 uProjectionMatrix;

//     void main() {
//       gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
//     }
//   `;

  const vsSource = `
  attribute vec4 aVertexPosition;
  attribute vec3 aVertexNormal;

  uniform mat4 uNormalMatrix;
  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;
  uniform mat4 uModelMatrix;
  uniform mat4 uViewMatrix;

  varying vec3 normalInterp;
  varying vec3 vertPos;

  void main() {
    mat4 modelViewMatrix = uViewMatrix * uModelMatrix;
    vec4 vertPos4 = modelViewMatrix * vec4(aVertexPosition.xyz, 1.0);

    vertPos = vec3(vertPos4.xyz) / vertPos4.w;
    normalInterp = vec3(uNormalMatrix * vec4(aVertexNormal, 0.0));
    gl_Position = uProjectionMatrix * vertPos4;

  }
`;
  // Fragment shader program

//   const fsSource = `
//     void main() {
//       gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
//     }
//   `;

  const fsSource = `
  precision mediump float;
  
  varying vec3 normalInterp;  // Surface normal
  varying vec3 vertPos;       // Vertex position 

  uniform vec3 ulightPos;
  uniform vec3 udiffuseColor;

  void main() {
    float Ka = 0.82;   // Ambient reflection coefficient
    float Kd = 1.0;   // Diffuse reflection coefficient
    float Ks = 0.61;   // Specular reflection coefficient
    float shininessVal = 60.0; // Shininess
    // Material color
    vec3 ambientColor = vec3(0.1, 0.1, 0.1);
    vec3 specularColor = vec3(1.0, 1.0, 1.0);


    vec3 N = normalize(normalInterp);
    vec3 L = normalize(ulightPos - vertPos);
  
    // Lambert's cosine law
    float lambertian = max(dot(N, L), 0.0);
    float specular = 0.0;
    if(lambertian > 0.0) {
      vec3 R = reflect(-L, N);      // Reflected light vector
      vec3 V = normalize(-vertPos); // Vector to viewer
      // Compute the specular term
      float specAngle = max(dot(R, V), 0.0);
      specular = pow(specAngle, shininessVal);
    }
    gl_FragColor = vec4(Ka * ambientColor +
                        Kd * lambertian * udiffuseColor +
                        Ks * specular * specularColor, 1.0);
  }
`;

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aVevrtexColor and also
  // look up uniform locations.
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      modelMatrix: gl.getUniformLocation(shaderProgram, 'uModelMatrix'),
      viewMatrix: gl.getUniformLocation(shaderProgram, 'uViewMatrix'),
      normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
      lightPosition: gl.getUniformLocation(shaderProgram, "ulightPos"),
      diffusePosition: gl.getUniformLocation(shaderProgram, "udiffuseColor"),
    },
  };

  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  const buffers = initBuffers(gl);
  const buffers_plane = initBuffers_plane(gl);

  var then = 0;

  // Draw the scene repeatedly
  function render(now) {
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;

    drawScene(gl, programInfo, buffers, buffers_plane);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);


    // // Set clear color to black, fully opaque
    // gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
    // // Clear the color buffer with specified clear color
    // gl.clear(gl.COLOR_BUFFER_BIT);

}

function initBuffers_plane(gl) {
       // Create a buffer for the square's positions.
  
       const positionBuffer = gl.createBuffer();
  
       // Select the positionBuffer as the one to apply buffer
       // operations to from here out.
     
       gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
     
       // Now create an array of positions for the square.
     
       const positions = [
            -2.0,  -1.0, 2.0,
            2.0,  -1.0, 2.0,
            -2.0, -1.0, -2.0,
            2.0, -1.0, -2.0,
         ];

         gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(positions),
            gl.STATIC_DRAW);

         const normalBuffer = gl.createBuffer();
         gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
       
         const vertexNormals = [
            0.0,  1.0,  0.0,
            0.0,  1.0,  0.0,
            0.0,  1.0,  0.0,
            0.0,  1.0,  0.0,
         ];
       
         gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals),
                       gl.STATIC_DRAW);
     
       // Now pass the list of positions into WebGL to build the
       // shape. We do this by creating a Float32Array from the
       // JavaScript array, then use it to fill the current buffer.
     
   
       return {
       position: positionBuffer,
       normal: normalBuffer,
       };
}

function initBuffers(gl) {

    // Create a buffer for the square's positions.
  
    const positionBuffer = gl.createBuffer();
  
    // Select the positionBuffer as the one to apply buffer
    // operations to from here out.
  
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  
    // Now create an array of positions for the square.
  
    const positions = [
        // Front face
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0,
         1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,
        
        // Back face
        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0, -1.0, -1.0,
        
        // Top face
        -1.0,  1.0, -1.0,
        -1.0,  1.0,  1.0,
         1.0,  1.0,  1.0,
         1.0,  1.0, -1.0,
        
        // Bottom face
        -1.0, -1.0, -1.0,
         1.0, -1.0, -1.0,
         1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,
        
        // Right face
         1.0, -1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0,  1.0,  1.0,
         1.0, -1.0,  1.0,
        
        // Left face
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0,
      ];
  
    // Now pass the list of positions into WebGL to build the
    // shape. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.
  
    gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(positions),
    gl.STATIC_DRAW);

    // normals for the cube

    const normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

  const vertexNormals = [
    // Front
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,

    // Back
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,

    // Top
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,

    // Bottom
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,

    // Right
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,

    // Left
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals),
                gl.STATIC_DRAW);


    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    // This array defines each face as two triangles, using the
    // indices into the vertex array to specify each triangle's
    // position.

    const indices = [
    0,  1,  2,      0,  2,  3,    // front
    4,  5,  6,      4,  6,  7,    // back
    8,  9,  10,     8,  10, 11,   // top
    12, 13, 14,     12, 14, 15,   // bottom
    16, 17, 18,     16, 18, 19,   // right
    20, 21, 22,     20, 22, 23,   // left
    ];

    // Now send the element array to GL

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices), gl.STATIC_DRAW);

    return {
    position: positionBuffer,
    normal: normalBuffer,
    indices: indexBuffer,
    };
  }

  //
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
  
    // Create the shader program
  
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
  
    // If creating the shader program failed, alert
  
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
      return null;
    }
  
    return shaderProgram;
  }
  
  //
  // creates a shader of the given type, uploads the source and
  // compiles it.
  //
  function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
  
    // Send the source to the shader object
  
    gl.shaderSource(shader, source);
  
    // Compile the shader program
  
    gl.compileShader(shader);
  
    // See if it compiled successfully
  
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
  
    return shader;
  }


function drawScene(gl, programInfo, buffers, buffers_plane) {
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
  
    // Clear the canvas before we start drawing on it.
  
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.
  
    const fieldOfView = 45 * Math.PI / 180;   // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();
  
    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    mat4.perspective(projectionMatrix,
                     fieldOfView,
                     aspect,
                     zNear,
                     zFar);
  
    // Set the drawing position to the "identity" point, which is
    // the center of the scene.

    const orthoMatrix = mat4.create();

    mat4.ortho(orthoMatrix,
                -3.0,       // left
                3.0,        // right
                -3.0,        // bottom
                3.0,        // top
                zNear,
                zFar);
    
    const viewMatrix = mat4.create();

    mat4.lookAt(viewMatrix,
                [-2.0, 3.0, -6.0],
                [0.0, 0.0, 0.0],
                [0.0, 1.0, 0.0]);

    const modelMatrix = mat4.create();

    mat4.rotateX(modelMatrix, modelMatrix, 1.0);

    const modelViewMatrix = mat4.create();
  
    // Now move the drawing position a bit to where we want to
    // start drawing the square.
  
    mat4.translate(modelViewMatrix,     // destination matrix
                   modelViewMatrix,     // matrix to translate
                   [-0.0, 0.0, -6.0]);  // amount to translate

    mat4.rotate(modelViewMatrix,  // destination matrix
                    modelViewMatrix,  // matrix to rotate
                    45.0,   // amount to rotate in radians
                    [0, 1, 0]);       // axis to rotate around

    mat4.rotate(modelViewMatrix,  // destination matrix
                    modelViewMatrix,  // matrix to rotate
                    25.0,   // amount to rotate in radians
                    [1, 0, 0]);       // axis to rotate around
  
    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute.
    {
      const numComponents = 3;  // pull out 2 values per iteration
      const type = gl.FLOAT;    // the data in the buffer is 32bit floats
      const normalize = false;  // don't normalize
      const stride = 0;         // how many bytes to get from one set of values to the next
                                // 0 = use type and numComponents above
      const offset = 0;         // how many bytes inside the buffer to start from
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
      gl.vertexAttribPointer(
          programInfo.attribLocations.vertexPosition,
          numComponents,
          type,
          normalize,
          stride,
          offset);
      gl.enableVertexAttribArray(
          programInfo.attribLocations.vertexPosition);
    }

    // Tell WebGL how to pull out the normals from
    // the normal buffer into the vertexNormal attribute.
    {
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexNormal,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexNormal);
    }

    // Tell WebGL which indices to use to index the vertices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

  
    // Tell WebGL to use our program when drawing
  
    gl.useProgram(programInfo.program);
  
    // Set the shader uniforms

    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);


    gl.uniformMatrix4fv(
        programInfo.uniformLocations.normalMatrix,
        false,
        normalMatrix);
  
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelMatrix,
        false,
        modelMatrix);

        mat4.rotateX(viewMatrix, viewMatrix, document.getElementById("x").value);
        mat4.rotateY(viewMatrix, viewMatrix, document.getElementById("y").value);
        mat4.rotateZ(viewMatrix, viewMatrix, document.getElementById("z").value);
        mat4.translate(viewMatrix, viewMatrix, [document.getElementById("Red").value, document.getElementById("Green").value, document.getElementById("Blue").value]);


    gl.uniformMatrix4fv(
        programInfo.uniformLocations.viewMatrix,
        false,
        viewMatrix);


      const lightpos = [1.0, 1.0, 1.0];

      gl.uniform3fv(
          programInfo.uniformLocations.lightPosition,
          lightpos);
  
      const diffuseColor = [0.1, 1.0, 0.5];


    gl.uniform3fv(
        programInfo.uniformLocations.diffusePosition,
        diffuseColor);

    {
        const vertexCount = 36;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }

    // Set up plane

    {
        const numComponents = 3;  // pull out 2 values per iteration
        const type = gl.FLOAT;    // the data in the buffer is 32bit floats
        const normalize = false;  // don't normalize
        const stride = 0;         // how many bytes to get from one set of values to the next
                                  // 0 = use type and numComponents above
        const offset = 0;         // how many bytes inside the buffer to start from
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers_plane.position);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexPosition);
    }
    
        // Tell WebGL how to pull out the normals from
    // the normal buffer into the vertexNormal attribute.
    {
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers_plane.normal);
        
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexNormal,
            numComponents,
            type,
            normalize,
            stride,
            offset);


        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexNormal);
    }


    {
        const offset = 0;
        const vertexCount = 4;
        gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
    }
  }

