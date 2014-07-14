/*
 * David Lettier (C) 2014.
 * 
 * http://www.lettier.com/
 * 
 * 3D Bowling Game
 * 
 * Dependencies:
 * 
 *      Three.js
 *      Cannon.js
 *      Tween.js
 *      Buzz.js
 * 
 */

// Game globals.

var round  = 1;

var total_throws = 0;

var current_round_throws = 0;

var play   = false;

// System settings globals.

var system_settings_level = 2;

var settings_div, low_div, medium_div, high_div;

// Audio globals.

var audio_on = false;

var background_track, roll_sound_effect, hit_sound_effect, drop_sound_effect, strike_sound_effect, wind_sound_effect, laugh_sound_effect, fail_sound_effect, applause1_sound_effect, applause2_sound_effect;

var AUDIO_ON_SYMBOL  = "<span class='lettier-icon-audio_on'></span>";
var AUDIO_OFF_SYMBOL = "<span class='lettier-icon-audio_off'></span>";

var audio_div;

var hit_sound_effect_played = ( new Date( ) ).valueOf( );

var audio_icon_tween;

// 2D globals.

var loading_div, logo_div, start_div, instructions_div, power_div, round_div, final_score_div, strike_div, throwing_div;

var mouse_positions = [ ];

var on_mouse_down_position = [ ];

var on_mouse_down_time = 0;

var on_mouse_down_mouse_on_ball = false;

var mouse_is_down = false;

// 3D globals.

var canvas;

var camera, scene, renderer, projector;

var throwing_view = { 
	
	position: { x: 0, y: 290, z: 60 },
        look_at:  { x: 0, y:   0, z: 0  }
};

var bowling_pin_view = { 
	
	position: { x: 0, y: -195, z: 55 },
        look_at:  { x: 0, y: -195, z:  0 }
};

var spot_light, runway_light1, runway_light2, runway_light3;

var arena_sphere;

var bowling_ball;

var bowling_pins = [ ];
var bowling_pin_positions = [
	
	[ -21, -210, 10.8 ],
	[  -7, -210, 10.8 ],
	[   7, -210, 10.8 ],
	[  21, -210, 10.8 ],	
	[ -14, -200, 10.8 ],
	[   0, -200, 10.8 ],
	[  14, -200, 10.8 ],
	[  -7, -190, 10.8 ],
	[   7, -190, 10.8 ],
	[   0, -180, 10.8 ]
];
var hit_bowling_pins = [ ];
var bowling_pins_reset = true;
var resetting_bowling_pins = false;

var bowling_ball_origin = [ 0, 200, 10 ];
var bowling_ball_damping = 0.1;

var bowling_ball_loaded = false;
var bowling_ball_last_updated_position = bowling_ball_origin;

var apply_wind_gust = false;

var flicker_spot_light_time = ( new Date( ) ).valueOf( ) + random_float_in_range( 0, 1000 );

var last_glow_runway_lights_time = ( new Date( ) ).valueOf( );

var bowling_ball_thrown = false;

var throwing_direction_arrow;

var throwing_target;

var floor_loaded = false;

var max_throwing_power = 200000;

var world;

var timers = [ ];

var current_view   = "throw";
var switching_view = false;

var textures_loaded = 0;

var number_of_textures = 0;

function set_system_settings_level( )
{
	
	var y_spacing = 50;
	var x_spacing = 40;
	
	settings_div               = document.createElement( "div" );
	settings_div.id            = "settings_div";
	settings_div.className     = "settings_div";
	settings_div.innerHTML     = "Computer Power:";
	document.body.appendChild( settings_div );
	
	settings_div.style.top        = ( ( window.innerHeight / 2 ) - ( settings_div.clientHeight / 2 ) ) + "px";
	settings_div.style.left       = ( ( window.innerWidth  / 2 ) - ( settings_div.clientWidth  / 2 ) ) + "px";
	settings_div.style.visibility = "visible";
	
	medium_div               = document.createElement( "div" );
	medium_div.id            = "medium_div";
	medium_div.className     = "medium_div";
	medium_div.innerHTML     = "MEDIUM";
	document.body.appendChild( medium_div );
	
	medium_div.style.top        = settings_div.offsetTop + settings_div.clientHeight + y_spacing + "px";
	medium_div.style.left       = ( ( window.innerWidth  / 2 ) - ( medium_div.clientWidth  / 2 ) ) + "px";
	medium_div.style.visibility = "visible";
	
	low_div               = document.createElement( "div" );
	low_div.id            = "low_div";
	low_div.className     = "low_div";
	low_div.innerHTML     = "LOW";
	document.body.appendChild( low_div );
	
	low_div.style.top        = settings_div.offsetTop + settings_div.clientHeight + y_spacing + "px";
	low_div.style.left       = medium_div.offsetLeft  - low_div.clientWidth - x_spacing + "px";
	low_div.style.visibility = "visible";
	
	high_div               = document.createElement( "div" );
	high_div.id            = "high_div";
	high_div.className     = "high_div";
	high_div.innerHTML     = "HIGH";
	document.body.appendChild( high_div );
	
	high_div.style.top        = settings_div.offsetTop + settings_div.clientHeight + y_spacing + "px";
	high_div.style.left       = medium_div.offsetLeft  + medium_div.clientWidth + x_spacing + "px";
	high_div.style.visibility = "visible";
	
	low_div.onclick = function ( ) {
		
		document.body.removeChild( settings_div );
		
		document.body.removeChild( medium_div );
		
		document.body.removeChild( high_div );
		
		document.body.removeChild( low_div );
		
		system_settings_level = 0;
		
		initialize( );
		
	}
	
	medium_div.onclick = function ( ) {
		
		document.body.removeChild( settings_div );
		
		document.body.removeChild( high_div );
		
		document.body.removeChild( low_div );
		
		document.body.removeChild( medium_div );
		
		system_settings_level = 1;
		
		initialize( );
		
	}
	
	high_div.onclick = function ( ) {
		
		document.body.removeChild( settings_div );
		
		document.body.removeChild( low_div );
		
		document.body.removeChild( medium_div );
		
		document.body.removeChild( high_div );
		
		system_settings_level = 2;
		
		initialize( );
		
	}
	
}

function initialize( )
{
	
	initialize_2d( );
	
	initialize_3d( );
	
	initialize_audio( );
	
	initialize_opening_sequence( );
	
}

function initialize_audio( )
{
	
	/*
		Background track:
		"The Elevator Bossa Nova" Bensound (http://www.bensound.com/) 
		Licensed under Creative Commons
		
	*/
	
	audio_div              = document.createElement( "div" );
	audio_div.id           = "audio_div";
	audio_div.className    = "audio_div";
	audio_div.innerHTML    = AUDIO_OFF_SYMBOL;
	audio_div.title        = "Turn audio on.";
	document.body.appendChild( audio_div );
	
	audio_div.style.top        = window.innerHeight + "px";
	audio_div.style.left       = ( window.innerWidth - 120 ) + "px";
	audio_div.style.visibility = "visible";
	
	var s            = { y : window.innerHeight };
	var f            = { y : 20 };
	audio_icon_tween = new TWEEN.Tween( s ).to( f, 1000 );
	
	audio_icon_tween.onUpdate( function( ) {
		
		audio_div.style.top = s.y + "px";
	
	} );
	
	audio_icon_tween.easing( TWEEN.Easing.Bounce.Out );
	
	window.setTimeout( function ( ) {
		
		roll_sound_effect = new buzz.sound( "assets/audio/roll", { formats: [ "ogg", "mp3" ] } );
		
		roll_sound_effect.setVolume( 100 );
		
		roll_sound_effect.load( );
		
		roll_sound_effect.mute( );
		
		hit_sound_effect = new buzz.sound( "assets/audio/hit", { formats: [ "ogg", "mp3" ] } );
		
		hit_sound_effect.setVolume( 100 );
		
		hit_sound_effect.load( );
		
		hit_sound_effect.mute( );
		
		drop_sound_effect = new buzz.sound( "assets/audio/drop", { formats: [ "ogg", "mp3" ] } );
		
		drop_sound_effect.setVolume( 100 );
		
		drop_sound_effect.load( );
		
		drop_sound_effect.mute( );
		
		strike_sound_effect = new buzz.sound( "assets/audio/strike", { formats: [ "ogg", "mp3" ] } );
		
		strike_sound_effect.setVolume( 50 );
		
		strike_sound_effect.load( );
		
		strike_sound_effect.mute( );
		
		wind_sound_effect = new buzz.sound( "assets/audio/wind", { formats: [ "ogg", "mp3" ] } );
		
		wind_sound_effect.setVolume( 50 );
		
		wind_sound_effect.load( );
		
		wind_sound_effect.mute( );
		
		laugh_sound_effect = new buzz.sound( "assets/audio/laugh", { formats: [ "ogg", "mp3" ] } );
		
		laugh_sound_effect.setVolume( 100 );
		
		laugh_sound_effect.load( );
		
		laugh_sound_effect.mute( );
		
		fail_sound_effect = new buzz.sound( "assets/audio/fail", { formats: [ "ogg", "mp3" ] } );
		
		fail_sound_effect.setVolume( 100 );
		
		fail_sound_effect.load( );
		
		fail_sound_effect.mute( );
		
		applause1_sound_effect = new buzz.sound( "assets/audio/applause1", { formats: [ "ogg", "mp3" ] } );
		
		applause1_sound_effect.setVolume( 100 );
		
		applause1_sound_effect.load( );
		
		applause1_sound_effect.mute( );
		
		applause2_sound_effect = new buzz.sound( "assets/audio/applause2", { formats: [ "ogg", "mp3" ] } );
		
		applause2_sound_effect.setVolume( 100 );
		
		applause2_sound_effect.load( );
		
		applause2_sound_effect.mute( );
	
		background_track = new buzz.sound( "assets/audio/background_track", { formats: [ "ogg", "mp3" ] } );
		
		background_track.setVolume( 30 );
		
		background_track.load( ).loop( ).play( );
		
		background_track.mute( );
		
		audio_div.onclick = function ( ) {
			
			if ( audio_on == true )
			{
				
				audio_div.innerHTML = AUDIO_OFF_SYMBOL;
				audio_div.title     = "Turn audio on.";
				
				background_track.mute( );
				
				roll_sound_effect.mute( );
				
				hit_sound_effect.mute( );
				
				drop_sound_effect.mute( );
				
				strike_sound_effect.mute( );
				
				wind_sound_effect.mute( );
				
				laugh_sound_effect.mute( );
				
				fail_sound_effect.mute( );
				
				applause1_sound_effect.mute( );
				
				applause2_sound_effect.mute( );				
				
				audio_on = false;
				
			}			
			else if ( audio_on == false )
			{
				
				audio_div.innerHTML = AUDIO_ON_SYMBOL;
				audio_div.title     = "Turn audio off.";
				
				background_track.unmute( );
				
				roll_sound_effect.unmute( );
				
				hit_sound_effect.unmute( );
				
				drop_sound_effect.unmute( );
				
				strike_sound_effect.unmute( );
				
				wind_sound_effect.unmute( );
				
				laugh_sound_effect.unmute( );
				
				fail_sound_effect.unmute( );
				
				applause1_sound_effect.unmute( );
				
				applause2_sound_effect.unmute( );	
				
				audio_on = true;
				
			}
			
		}
		
	}, 6500 );
	
}

function initialize_2d( )
{
	
	loading_div              = document.createElement( "div" );
	loading_div.id           = "loading_div";
	loading_div.className    = "loading_div";
	loading_div.innerHTML    = "LOADING";
	document.body.appendChild( loading_div );
	
	loading_div.style.top        = ( ( window.innerHeight / 2 ) - ( loading_div.clientHeight / 2 ) ) + "px";
	loading_div.style.left       = ( ( window.innerWidth  / 2 ) - ( loading_div.clientWidth  / 2 ) ) + "px";
	loading_div.style.visibility = "visible";	
	
	var logo_image          = document.createElement( "img" );
	logo_image.id           = "logo_image";
	logo_image.className    = "logo_image";
	logo_image.src          = "assets/images/logo.png";
	var width               = 1980 * 0.42;
	var height              = 1080 / 1920 * width;
	logo_image.style.width  = width  + "px";
	logo_image.style.height = height + "px";
	
	logo_div              = document.createElement( "div" );
	logo_div.id           = "logo_div";
	logo_div.className    = "logo_div";
	logo_div.style.width  = width  + "px";
	logo_div.style.height = height + "px";
	logo_div.appendChild( logo_image );
	document.body.appendChild( logo_div );
	
	logo_div.style.top        = ( ( window.innerHeight / 2 ) - ( logo_div.clientHeight / 2 ) ) + "px";
	logo_div.style.left       = ( ( window.innerWidth  / 2 ) - ( logo_div.clientWidth  / 2 ) ) + "px";
	logo_div.style.visibility = "hidden";
	
	start_div              = document.createElement( "div" );
	start_div.id           = "start_div";
	start_div.className    = "start_div";
	start_div.innerHTML    = "START";
	start_div.style.cursor = "pointer";

	document.body.appendChild( start_div );
	
	start_div.style.top        = logo_div.offsetTop + logo_div.clientHeight + "px";
	start_div.style.left       = ( ( window.innerWidth  / 2 ) - ( start_div.clientWidth  / 2 ) ) + "px";
	start_div.style.visibility = "hidden";
	
	start_div.onmouseover = function ( ) {
		
		instructions_div.style.top  = ( start_div.offsetTop - instructions_div.clientHeight ) - 10 + "px";
		
		instructions_div.style.visibility = "visible";
		logo_div.style.visibility         = "hidden";
		
	}
	
	start_div.onmouseout = function ( ) {
		
		instructions_div.style.visibility = "hidden";
		logo_div.style.visibility         = "visible";
		
	}
	
	start_div.onclick = function ( ) {
		
		start_div.onmouseover = null;
		start_div.onmouseout  = null;
		
		play = true;
		
		canvas.setAttribute( "style", "-webkit-filter: grayscale( 0.0 ) blur( 0px )" );
		
		canvas.className = "";
		
		round_div.style.visibility        = "visible";
		score_div.style.visibility        = "visible";
		logo_div.style.visibility         = "hidden";
		start_div.style.visibility        = "hidden";
		instructions_div.style.visibility = "hidden";
		
	};
	
	instructions_div              = document.createElement( "div" );
	instructions_div.id           = "instructions_div";
	instructions_div.className    = "instructions_div";
	instructions_div.innerHTML    = "<font style='font-size: 50px;'>Instructions:</font>" +
	"<br><br>" +
	"You can move the ball from side-to-side by moving the mouse over the bowling ball. " +
	"To throw the ball: hold down the left-mouse button (LMB) over the ball, move the mouse in the direction you want the ball to go, and then release the LMB. " +
	"The longer you hold down the LMB, the slower the ball will move. " +
	"The throwing power is indicated by the green bar, located by the mouse cursor. " +
	"After you throw the ball, you can click the LMB once to return the ball." +
	"<br><br>" +
	"A single game lasts for 10 rounds. " +
	"You must knock down all of the pins each round. " +
	"Every throw lowers your score, so use the least amount of throws you can. " +
	"Use only 10 throws, per game, to get a maximum score." +
	"<br><br>" + 
	"Use Google Chrome for a full experience.";
	document.body.appendChild( instructions_div );
	
	instructions_div.style.top  = ( ( window.innerHeight / 2 ) - ( instructions_div.clientHeight / 2 ) ) - 60 + "px";
	instructions_div.style.left = ( ( window.innerWidth  / 2 ) - ( instructions_div.clientWidth  / 2 ) )      + "px";
	
	power_div              = document.createElement( "div" );
	power_div.id           = "power_div";
	power_div.className    = "power_div";
	power_div.innerHTML    = "&nbsp;";
	power_div.style.width  = 200 + "px";
	power_div.style.height = 10 + "px";
	document.body.appendChild( power_div );
	
	round_div              = document.createElement( "div" );
	round_div.id           = "round_div";
	round_div.className    = "round_div";
	round_div.innerHTML    = "Round: " + round;
	round_div.style.top  = 10 + "px";
	round_div.style.left = 10 + "px";
	document.body.appendChild( round_div );
	
	score_div              = document.createElement( "div" );
	score_div.id           = "score_div";
	score_div.className    = "score_div";
	score_div.innerHTML    = "Score: 100%";
	score_div.style.top  = round_div.clientHeight + 10 + "px";
	score_div.style.left = 10 + "px";
	document.body.appendChild( score_div );
	
	final_score_div               = document.createElement( "div" );
	final_score_div.id            = "final_score_div";
	final_score_div.className     = "final_score_div";
	final_score_div.innerHTML     = "Final Score:<br>100%";
	document.body.appendChild( final_score_div );
	
	final_score_div.style.top        = ( ( window.innerHeight / 2 ) - ( final_score_div.clientHeight / 2 ) ) + "px";
	final_score_div.style.left       = ( ( window.innerWidth  / 2 ) - ( final_score_div.clientWidth  / 2 ) ) + "px";
	final_score_div.style.visibility = "hidden";
	
	strike_div               = document.createElement( "div" );
	strike_div.id            = "strike_div";
	strike_div.className     = "strike_div";
	strike_div.innerHTML     = "STRIKE!";
	document.body.appendChild( strike_div );
	
	strike_div.style.top        = ( ( window.innerHeight / 2 ) - ( strike_div.clientHeight / 2 ) ) + "px";
	strike_div.style.left       = ( ( window.innerWidth  / 2 ) - ( strike_div.clientWidth  / 2 ) ) + "px";
	strike_div.style.visibility = "hidden";
	
	throwing_div               = document.createElement( "div" );
	throwing_div.id            = "throwing_div";
	throwing_div.className     = "throwing_div";
	throwing_div.innerHTML     = "&nbsp;";
	throwing_div.style.width   = window.innerWidth  + "px";
	throwing_div.style.height  = window.innerHeight + "px";
	document.body.appendChild( throwing_div );
	
}

function initialize_3d() 
{

	// The camera.
	
	camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.up.set( 0, 0, 1 );
	camera.position.z =   55;
	camera.position.y = -195;
	camera.lookAt( new THREE.Vector3( 0, -195, 0 ) );
	camera.rotation.z = Math.PI;
	
	// The scene.

	scene = new THREE.Scene( );
	
	// The renderer.
	
	renderer = new THREE.WebGLRenderer( { alpha: true } );
	renderer.setSize( window.innerWidth, window.innerHeight );	
	renderer.setClearColor( 0x000000, 0.0 );

	// Physics materials.
	
	var floor_material        = new CANNON.Material( "ground_material"       );
	var bowling_ball_material = new CANNON.Material( "bowling_ball_material" );
	var bowling_pin_material  = new CANNON.Material( "bowling_pin_material"  );
	
	// Physical contact materials.
	
	var floor_to_bowling_ball_contact_material       = new CANNON.ContactMaterial( floor_material,        bowling_ball_material, 0.2,  0.6 );	
	var floor_to_bowling_pin_contact_material        = new CANNON.ContactMaterial( floor_material,        bowling_pin_material,  0.2,  0.9 );	
	var bowling_ball_to_bowling_pin_contact_material = new CANNON.ContactMaterial( bowling_ball_material, bowling_pin_material,  0.2,  2.0 );
	var bowling_pin_to_bowling_pin_contact_material  = new CANNON.ContactMaterial( bowling_pin_material,  bowling_pin_material,  0.2,  1.5 );
	
	// JSON loader for the mesh files.
	
	var loader = new THREE.JSONLoader( true );
	
	// The arena sphere enclosure.
	
	number_of_textures += 1;
	
	loader.load( "assets/models/arena_sphere.js", function( geometry, material ) {
		
		if ( system_settings_level == 0 )
		{
			
			material[ 0 ].map = THREE.ImageUtils.loadTexture( "assets/models/textures/arena_sphere_low.jpg", THREE.UVMapping, function ( ) { textures_loaded += 1; } );
			
		}
		else if ( system_settings_level == 1 )
		{
			
			material[ 0 ].map = THREE.ImageUtils.loadTexture( "assets/models/textures/arena_sphere_medium.jpg", THREE.UVMapping, function ( ) { textures_loaded += 1; } );
			
		}
		else if ( system_settings_level == 2 )
		{
			
			material[ 0 ].map = THREE.ImageUtils.loadTexture( "assets/models/textures/arena_sphere.jpg", THREE.UVMapping, function ( ) { textures_loaded += 1; } );
			
		}
		
		var mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( material ) );
		
		if ( system_settings_level > 0 )
		{
			
			mesh.castShadow     = false;
			mesh.receiveShadow  = true;
			
		}
		
		scene.add( mesh );
		
		arena_sphere = mesh;

	}, "assets/models/textures/" );
	
	// The bowling pin bay mesh.
	
	number_of_textures += 1;
	
	loader.load( "assets/models/bowling_pin_bay.js", function( geometry, material ) {
		
		material.shading = THREE.FlatShading;
		
		if ( system_settings_level == 0 )
		{
			
			material[ 0 ].map = THREE.ImageUtils.loadTexture( "assets/models/textures/bowling_pin_bay_low.jpg", THREE.UVMapping, function ( ) { textures_loaded += 1; } );
			
		}
		else if ( system_settings_level == 1 )
		{
			
			material[ 0 ].map = THREE.ImageUtils.loadTexture( "assets/models/textures/bowling_pin_bay_medium.jpg", THREE.UVMapping, function ( ) { textures_loaded += 1; } );
			
		}
		else if ( system_settings_level == 2 )
		{
			
			material[ 0 ].map = THREE.ImageUtils.loadTexture( "assets/models/textures/bowling_pin_bay.jpg", THREE.UVMapping, function ( ) { textures_loaded += 1; } );
			
		}
		
		var mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( material ) );
		
		if ( system_settings_level > 0 )
		{
			
			mesh.castShadow     = true;
			mesh.receiveShadow  = true;
			
		}
		
		scene.add( mesh );

	}, "assets/models/textures/" );
	
	// The ground floor mesh.

	number_of_textures += 1;
	
	loader.load( "assets/models/floor.js", function( geometry, material ) {
		
		if ( system_settings_level == 0 )
		{
			
			material[ 0 ].map = THREE.ImageUtils.loadTexture( "assets/models/textures/hexagons_low.jpg", THREE.UVMapping, function ( ) { textures_loaded += 1; } );
			
		}
		else if ( system_settings_level == 1 )
		{
			
			material[ 0 ].map = THREE.ImageUtils.loadTexture( "assets/models/textures/hexagons_medium.jpg", THREE.UVMapping, function ( ) { textures_loaded += 1; } );
			
		}
		else if ( system_settings_level == 2 )
		{
			
			material[ 0 ].map = THREE.ImageUtils.loadTexture( "assets/models/textures/hexagons.jpg", THREE.UVMapping, function ( ) { textures_loaded += 1; } );
			
		}		
		
		material[ 0 ].map.wrapS = THREE.RepeatWrapping;
		material[ 0 ].map.wrapT = THREE.RepeatWrapping;
		material[ 0 ].map.repeat.set( 2, 2 );
		
		var mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( material ) );
		
		if ( system_settings_level > 0 )
		{
		
			mesh.castShadow    = false;
			mesh.receiveShadow = true;
		
		}
		
		scene.add( mesh );
		
		var floor_shape = new CANNON.Box( new CANNON.Vec3( 28, 250, 1 ) );
		floor_body = new CANNON.RigidBody( 0, floor_shape, floor_material );
		floor_body.position.set( mesh.position.x, mesh.position.y, mesh.position.z );
		world.add( floor_body );
		
		floor_loaded = true;		

	}, "assets/models/textures/" );
	
	// The logo billboard mesh.
	
	number_of_textures += 1;
	
	loader.load( "assets/models/logo.js", function( geometry, material ) {
		
		if ( system_settings_level == 0 )
		{
			
			material[ 0 ].map = THREE.ImageUtils.loadTexture( "assets/models/textures/logo_billboard_low.png", THREE.UVMapping, function ( ) { textures_loaded += 1; } );
			
		}
		else if ( system_settings_level == 1 )
		{
			
			material[ 0 ].map = THREE.ImageUtils.loadTexture( "assets/models/textures/logo_billboard_medium.png", THREE.UVMapping, function ( ) { textures_loaded += 1; } );
			
		}
		else if ( system_settings_level == 2 )
		{
			
			material[ 0 ].map = THREE.ImageUtils.loadTexture( "assets/models/textures/logo_billboard_medium.png", THREE.UVMapping, function ( ) { textures_loaded += 1; } );
			
		}
		
		var mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( material ) );
		
		if ( system_settings_level > 0 )
		{
			
			mesh.castShadow    = false;
			mesh.receiveShadow = true;
		
		}
		
		scene.add( mesh );	

	}, "assets/models/textures/" );
	
	// The bowling pin meshes and physics bodies.

	var position_index = 0;
	
	var i = 10;
	
	number_of_textures += i;
	
	while ( i-- )
	{
	
		loader.load( "assets/models/bowling_pin.js", function( geometry, material ) {
			
			if ( system_settings_level == 0 )
			{
				
				material[ 0 ].map = THREE.ImageUtils.loadTexture( "assets/models/textures/bowling_pin_low.jpg", THREE.UVMapping, function ( ) { textures_loaded += 1; } );
				
			}
			else if ( system_settings_level == 1 )
			{
				
				material[ 0 ].map = THREE.ImageUtils.loadTexture( "assets/models/textures/bowling_pin_medium.jpg", THREE.UVMapping, function ( ) { textures_loaded += 1; } );
				
			}
			else if ( system_settings_level == 2 )
			{
				
				material[ 0 ].map = THREE.ImageUtils.loadTexture( "assets/models/textures/bowling_pin.jpg", THREE.UVMapping, function ( ) { textures_loaded += 1; } );
				
			}
			
			var mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( material ) );
			
			if ( system_settings_level > 0 )
			{
				
				mesh.castShadow    = true;
				mesh.receiveShadow = true;

			}
			
			mesh.position.set( bowling_pin_positions[ position_index ][ 0 ], 
					   bowling_pin_positions[ position_index ][ 1 ], 
					   bowling_pin_positions[ position_index ][ 2 ] );
			mesh.rotation.z = Math.PI;
			scene.add( mesh );
			
			var mass = 7;
			var box_body = new CANNON.RigidBody( mass, 
							     new CANNON.Box( new CANNON.Vec3( 3, 3, 10 ) ), 
							     bowling_pin_material );
			box_body.position.set(   mesh.position.x, 
						 mesh.position.y, 
						 mesh.position.z );
			box_body.quaternion.set( mesh.quaternion.x, 
						 mesh.quaternion.y, 
						 mesh.quaternion.z, 
						 mesh.quaternion.w );
			world.add( box_body );
			
			bowling_pins.push( [ box_body, mesh ] );
			
			position_index += 1;

		}, "assets/models/textures/" );
		
	}

	// The bowling ball mesh.
	
	number_of_textures += 1;
	
	loader.load( "assets/models/bowling_ball.js", function( geometry, material ) {
		
		if ( system_settings_level == 0 )
		{
			
			material[ 0 ].map = THREE.ImageUtils.loadTexture( "assets/models/textures/bowling_ball_low.jpg", THREE.UVMapping, function ( ) { textures_loaded += 1; } );
			
		}
		else if ( system_settings_level == 1 )
		{
			
			material[ 0 ].map = THREE.ImageUtils.loadTexture( "assets/models/textures/bowling_ball_medium.jpg", THREE.UVMapping, function ( ) { textures_loaded += 1; } );
			
		}
		else if ( system_settings_level == 2 )
		{
			
			material[ 0 ].map = THREE.ImageUtils.loadTexture( "assets/models/textures/bowling_ball.jpg", THREE.UVMapping, function ( ) { textures_loaded += 1; } );
			
		}
		
		var mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( material ) );
		
		if ( system_settings_level > 0 )
		{
			
			mesh.castShadow    = true;
			mesh.receiveShadow = true;
			
		}
		
		mesh.position.set( bowling_ball_origin[ 0 ], bowling_ball_origin[ 1 ], bowling_ball_origin[ 2 ] );
		scene.add( mesh );
		
		var mass = 10, radius = 5;
		var sphere_shape = new CANNON.Sphere( radius );
		sphere_body = new CANNON.RigidBody( mass, sphere_shape, bowling_ball_material );
		sphere_body.position.set( mesh.position.x, mesh.position.y, mesh.position.z );
		sphere_body.angularDamping = sphere_body.linearDamping = bowling_ball_damping;	
		world.add( sphere_body );
	
		bowling_ball = [ sphere_body, mesh ];
		
		bowling_ball_loaded = true;

	}, "assets/models/textures/" );
	
	// The bumpers.
	
	number_of_textures += 1;
	
	loader.load( "assets/models/bumpers.js", function( geometry, material ) {
		
		if ( system_settings_level == 0 )
		{
			
			material[ 0 ].map = THREE.ImageUtils.loadTexture( "assets/models/textures/bumpers_low.jpg", THREE.UVMapping, function ( ) { textures_loaded += 1; } );
			
		}
		else if ( system_settings_level == 1 )
		{
			
			material[ 0 ].map = THREE.ImageUtils.loadTexture( "assets/models/textures/bumpers_medium.jpg", THREE.UVMapping, function ( ) { textures_loaded += 1; } );
			
		}
		else if ( system_settings_level == 2 )
		{
			
			material[ 0 ].map = THREE.ImageUtils.loadTexture( "assets/models/textures/bumpers.jpg", THREE.UVMapping, function ( ) { textures_loaded += 1; } );
			
		}
		
		var mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( material ) );
		
		if ( system_settings_level > 0 )
		{
			
			mesh.castShadow     = true;
			mesh.receiveShadow  = true;
			
		}
		
		scene.add( mesh );

	}, "assets/models/textures/" );
	
	// Lights.
	
	var ambient_light = new THREE.AmbientLight( 0x110111 ); // soft white light
	scene.add( ambient_light );
	
	if ( system_settings_level > 1 )
	{
	
		var point_light1  = new THREE.PointLight( 0xC2E7F2, 0.8, 100 );
		point_light1.position.set( -22, -180, 45 );
		scene.add( point_light1 );
		
		var point_light2  = new THREE.PointLight( 0xC2E7F2, 0.8, 100 );
		point_light2.position.set(  22, -180, 45 );
		scene.add( point_light2 );
	
	}
	
	var point_light3  = new THREE.PointLight( 0xC2E7F2, 0.8, 100 );
	point_light3.position.set(   0, -180, 45 );
	scene.add( point_light3 );
	
	if ( system_settings_level > 0 )
	{
	
		var point_light4  = new THREE.PointLight( 0xEEF78D, 1.1, 140 );
		point_light4.position.set(   0, -160, 55 );
		scene.add( point_light4 );
		
	}
	
	if ( system_settings_level == 2 )
	{
	
		runway_light1  = new THREE.PointLight( 0xaaaaFF, 50.0, 6 );
		runway_light1.position.set(   0, 240, 5 );
		scene.add( runway_light1 );
		
		runway_light2  = new THREE.PointLight( 0x88aaFF, 50.0, 6 );
		runway_light2.position.set(  -21, 250, 5 );
		scene.add( runway_light2 );
		
		runway_light3  = new THREE.PointLight( 0x88aaFF, 50.0, 6 );
		runway_light3.position.set(   21, 250, 5 );
		scene.add( runway_light3 );
		
	}
	else if ( system_settings_level == 1 )
	{
	
		runway_light1  = new THREE.PointLight( 0xaaaaFF, 50.0, 6 );
		runway_light1.position.set(   0, 240, 5 );
		scene.add( runway_light1 );
		
	}
	
	if ( system_settings_level == 0 )
	{
			
		spot_light                     = new THREE.SpotLight( 0xFFF5BA, 1.0 );
		spot_light.castShadow          = true;
		spot_light.shadowCameraVisible = false;
		spot_light.position.set( 200, 0, 300 );
		spot_light.lookAt( -200, 0, 0 );
		scene.add( spot_light );
		
	}
	else if ( system_settings_level == 1 ) 
	{
		
		renderer.shadowMapEnabled = true;
		renderer.shadowMapSoft    = true;
			
		spot_light                     = new THREE.SpotLight( 0xFFF5BA, 1.0 );
		spot_light.castShadow          = true;
		spot_light.shadowMapWidth      = 256;
		spot_light.shadowMapHeight     = 256;
		spot_light.shadowCameraNear    = 10;
		spot_light.shadowCameraFar     = 1050;
		spot_light.shadowCameraFov     = 100;
		spot_light.shadowBias          = 0.00008;
		spot_light.shadowDarkness      = 0.5;
		spot_light.shadowCameraVisible = false;
		spot_light.position.set( 200, 0, 300 );
		spot_light.lookAt( -200, 0, 0 );
		scene.add( spot_light );
		
	}
	else if ( system_settings_level == 2 )
	{
		
		renderer.shadowMapEnabled = true;
		renderer.shadowMapSoft    = true;
			
		spot_light                     = new THREE.SpotLight( 0xFFF5BA, 1.0 );
		spot_light.castShadow          = true;
		spot_light.shadowMapWidth      = 4096;
		spot_light.shadowMapHeight     = 4096;
		spot_light.shadowCameraNear    = 10;
		spot_light.shadowCameraFar     = 1050;
		spot_light.shadowCameraFov     = 100;
		spot_light.shadowBias          = 0.00008;
		spot_light.shadowDarkness      = 0.5;
		spot_light.shadowCameraVisible = false;
		spot_light.position.set( 200, 0, 300 );
		spot_light.lookAt( -200, 0, 0 );
		scene.add( spot_light );
		
	}	
	
	canvas = renderer.domElement;

	document.body.appendChild( canvas );
	
	// Projector.
	
	projector = new THREE.Projector();
	
	// Physics world.

	world = new CANNON.World( );
	world.gravity.set( 0, 0, -120 );
	world.broadphase = new CANNON.NaiveBroadphase( );
	
	if ( system_settings_level == 0 )
	{
		
		world.solver.iterations = 3;
		
	}
	else if ( system_settings_level == 1 ) 
	{
		
		world.solver.iterations = 5;
		
	}
	else if ( system_settings_level == 2 )
	{
		
		world.solver.iterations = 10;
		
	}
	
	// Bowling pin bay physics bodies.
	
	var bowling_pin_bay_back_shape = new CANNON.Box( new CANNON.Vec3( 40, 5, 25 ) );
	bowling_pin_bay_back_body = new CANNON.RigidBody( 0, bowling_pin_bay_back_shape, floor_material );
	bowling_pin_bay_back_body.position.set( 0, -280, 25 );
	world.add( bowling_pin_bay_back_body );
	
	var bowling_pin_bay_top_shape = new CANNON.Box( new CANNON.Vec3( 50, 55, 5 ) );
	bowling_pin_bay_top_body = new CANNON.RigidBody( 0, bowling_pin_bay_top_shape, floor_material );
	bowling_pin_bay_top_body.position.set( 0, -230, 55 );
	world.add( bowling_pin_bay_top_body );
	
	var bowling_pin_bay_left_shape = new CANNON.Box( new CANNON.Vec3( 5, 55, 25 ) );
	bowling_pin_bay_left_body = new CANNON.RigidBody( 0, bowling_pin_bay_left_shape, floor_material );
	bowling_pin_bay_left_body.position.set( 45, -230, 25 );
	world.add( bowling_pin_bay_left_body );
	
	var bowling_pin_bay_right_shape = new CANNON.Box( new CANNON.Vec3( 5, 55, 25 ) );
	bowling_pin_bay_right_body = new CANNON.RigidBody( 0, bowling_pin_bay_right_shape, floor_material );
	bowling_pin_bay_right_body.position.set( -45, -230, 25 );
	world.add( bowling_pin_bay_right_body );
	
	// Left and right lane bumpers.
	
	var bumper_right_shape = new CANNON.Box( new CANNON.Vec3( 5, 212.5, 10 ) );
	bumper_right_body = new CANNON.RigidBody( 0, bumper_right_shape, floor_material );
	bumper_right_body.position.set( -45, 37.5, 10 );
	world.add( bumper_right_body );
	
	var bumper_left_shape = new CANNON.Box( new CANNON.Vec3( 5, 212.5, 10 ) );
	bumper_left_body = new CANNON.RigidBody( 0, bumper_left_shape, floor_material );
	bumper_left_body.position.set( 45, 37.5, 10 );
	world.add( bumper_left_body );
	
	// Add the contact materials.
	
	world.addContactMaterial( floor_to_bowling_ball_contact_material       );
	world.addContactMaterial( floor_to_bowling_pin_contact_material        );
	world.addContactMaterial( bowling_ball_to_bowling_pin_contact_material );
	world.addContactMaterial( bowling_pin_to_bowling_pin_contact_material  );
	
	// The throwing direction arrow and target indicator;
	
	var arrow_direction      = new THREE.Vector3( 0, 0, 0 );
	var arrow_origin         = new THREE.Vector3( bowling_ball_origin[ 0 ], bowling_ball_origin[ 1 ], -20 );
	var arrow_length         = 0.00001;
	var arrow_color          = 0x555555;
	var arrow_head_length    = 5;
	var arrow_head_width     = 2.5;
	throwing_direction_arrow = new THREE.ArrowHelper( arrow_direction, arrow_origin, arrow_length, arrow_color, arrow_head_length, arrow_head_width );
	throwing_direction_arrow.cone.material = new THREE.MeshLambertMaterial( { color: 0xffffff, transparent: true, opacity: 0.5 } );
	throwing_direction_arrow.visible = false;
	scene.add( throwing_direction_arrow );
	
	var geometry    = new THREE.SphereGeometry( 5, 8, 8 );
	var material    = new THREE.MeshLambertMaterial( { color: 0x00ff00, transparent: true, opacity: 0.6 } );
	throwing_target = new THREE.Mesh( geometry, material );
	throwing_target.position.set( 0, 0, -20 );
	scene.add( throwing_target );
	
	// Events.
	
	throwing_div.onmousedown = on_mouse_down;
	throwing_div.onmouseup   = on_mouse_up;
	
	window.onmousemove       = on_mouse_move;	
	window.onresize          = on_resize;
	
	// Draw the first frame.

	draw_frame( );

}

function initialize_opening_sequence( )
{
	
	if ( textures_loaded != number_of_textures )
	{
		
		window.setTimeout( function ( ) {
			
			loading_div.style.opacity = "" + random_float_in_range( 0.1, 1.0 ) + "";
		
			initialize_opening_sequence( );
			
		}, 100 );
		
		canvas.setAttribute( "style", "-webkit-filter: grayscale( 0.5 ) blur( 10px ) brightness( 0.05 )" );
		
		if ( canvas.style.length === 0 )
		{
			
			canvas.className = "firefox_blur firefox_darken";
			
		}
		
		return;
		
	}
	else
	{
		
		loading_div.style.visibility = "hidden";
		
	}
	
	var s            = { y : bowling_pin_view.position.y, z: bowling_pin_view.position.z, l: bowling_pin_view.look_at.y, b: 0.05 };
	var f            = { y : throwing_view.position.y, z: throwing_view.position.z, l: throwing_view.look_at.y, b: 1.0 };
	opening_sequence = new TWEEN.Tween( s ).to( f, 5000 );
	
	if ( canvas.style.length === 0 )
	{
		
		canvas.className = "firefox_blur";
		
	}	
	
	opening_sequence.onUpdate( function( ) {
		
		camera.position.y = s.y;
		camera.position.z = s.z;
		
		camera.lookAt( new THREE.Vector3( 0, s.l, 0 ) );
		
		canvas.setAttribute( "style", "-webkit-filter: grayscale( 0.5 ) blur( 10px ) brightness( " + s.b + ")" );
	
	} );
	
	opening_sequence.chain( audio_icon_tween );
	
	opening_sequence.onComplete( function( ) {
		
		start_div.style.visibility = "visible";
		logo_div.style.visibility  = "visible";
		
		opening_sequence = 0;
	
	} );
	
	opening_sequence.easing( TWEEN.Easing.Quartic.In );
	
	opening_sequence.delay( 0 );
	
	opening_sequence.start( );
	
}
	

function draw_frame( ) 
{
	
	requestAnimationFrame( draw_frame );
	
	handle_tween( );
	
	handle_2d( );
	
	handle_3d( );

}

function handle_tween( )
{
	
	TWEEN.update( );
	
}

function handle_2d( )
{
	
	handle_power_div( );
	
	handle_round_div( );
	
	handle_score_div( );
	
	handle_game_reset( );
	
}

function handle_3d( )
{
	
	if ( floor_loaded == false || bowling_ball_loaded == false ) return; 
	
	handle_arena_sphere( );
	
	handle_lights( );
	
	handle_wind( );
	
	physics_step( );
	
	track_mouse( );
	
	monitor_bowling_ball( );
	
	monitor_bowling_pins( );

	renderer.render( scene, camera );
	
}

function physics_step( )
{

	world.step( 1.0 / 60.0 );

	bowling_ball[ 0 ].position.copy(   bowling_ball[ 1 ].position   );
	bowling_ball[ 0 ].quaternion.copy( bowling_ball[ 1 ].quaternion );

	var i = bowling_pins.length;
	
	while ( i-- )
	{
		
		bowling_pins[ i ][ 0 ].position.copy(   bowling_pins[ i ][ 1 ].position   );
		bowling_pins[ i ][ 0 ].quaternion.copy( bowling_pins[ i ][ 1 ].quaternion );
		
	}

}

function track_mouse( )
{
	
	if ( bowling_ball_thrown == false )
	{
		
		bowling_ball[ 0 ].velocity.set( 0, 0, 0 );
			
		bowling_ball[ 0 ].angularVelocity.set( 0.0, 0.0, 0.0 );
		
		bowling_ball[ 0 ].force.set( 0, 0, 1200 );
		
		if ( mouse_is_down == false && mouse_positions.length > 2 && play == true )
		{
		
// 			var x = ( ( window.innerWidth  / 2 ) - mouse_positions[ mouse_positions.length - 1 ][ 0 ] )
// 			        / ( window.innerWidth  / 2 );
// 		
// 			bowling_ball[ 1 ].position.set( x * 100, 
// 					                bowling_ball_origin[ 1 ], 
// 					                bowling_ball_origin[ 2 ] );
// 		
// 			if      ( bowling_ball[ 1 ].position.x >  35.0 ) bowling_ball[ 1 ].position.x =  34.9;
// 			else if ( bowling_ball[ 1 ].position.x < -35.0 ) bowling_ball[ 1 ].position.x = -34.9;
// 			
// 			bowling_ball_last_updated_position = [ 
// 								bowling_ball[ 1 ].position.x,
// 								bowling_ball[ 1 ].position.y,
// 								bowling_ball[ 1 ].position.z
// 			];
			
			var mouse_position_3d = screen_position_2d_to_3d( mouse_positions[ mouse_positions.length - 1 ][ 0 ], mouse_positions[ mouse_positions.length - 1 ][ 1 ], bowling_ball[ 1 ].position.z );
			
			if ( mouse_position_3d.y >= 177 && mouse_position_3d.y <= 201 )
			{
			
				var bx = bowling_ball[ 1 ].position.x;
				var by = bowling_ball[ 1 ].position.y;
				var bz = bowling_ball[ 1 ].position.z;
				
				var xd = mouse_position_3d.x - bx;
				
				var s = xd / Math.abs( xd );
				
				bowling_ball[ 0 ].velocity.set( s * ( xd * xd ), 0, 0 );
				
			}
			
			if ( bowling_ball[ 0 ].position.x >= 35.0 )
			{
				
				bowling_ball[ 1 ].position.x = 34.9;
				
				bowling_ball[ 0 ].position.set( bowling_ball[ 1 ].position.x, 
								bowling_ball[ 1 ].position.y, 
								bowling_ball[ 1 ].position.z );
				bowling_ball[ 0 ].quaternion =  bowling_ball[ 1 ].quaternion;
				
				bowling_ball[ 0 ].velocity.set( 0, 0, 0 );
					
				bowling_ball[ 0 ].angularVelocity.set( 0.0, 0.0, 0.0 );
				
				bowling_ball[ 0 ].force.set( 0, 0, 1200 );
				
			}
 			else if ( bowling_ball[ 0 ].position.x <= -35.0 )
			{
				
				bowling_ball[ 1 ].position.x = -34.9;
				
				bowling_ball[ 0 ].position.set( bowling_ball[ 1 ].position.x, 
								bowling_ball[ 1 ].position.y, 
								bowling_ball[ 1 ].position.z );
				bowling_ball[ 0 ].quaternion =  bowling_ball[ 1 ].quaternion;
				
				bowling_ball[ 0 ].velocity.set( 0, 0, 0 );				
					
				bowling_ball[ 0 ].angularVelocity.set( 0.0, 0.0, 0.0 );
				
				bowling_ball[ 0 ].force.set( 0, 0, 1200 );
				
			}
			
// 			if (  mouse_is_moving == true )
// 			{
// 			
// 				
// 				
// 				
// 				
// 				bowling_ball[ 0 ].applyForce( new CANNON.Vec3( mouse_position_3d.x * xd, 0, 1200 ), 
// 							      new CANNON.Vec3( bx, by, bz ) );
// 			
// 			}
// 			else
// 			{
// 				
// 				bowling_ball[ 0 ].applyForce( new CANNON.Vec3( 0, 0, 1200 ), 
// 							      new CANNON.Vec3( bx, by, bz ) );
// 				
// 				bowling_ball[ 0 ].angularVelocity.set( 0.0, 0.0, bowling_ball[ 0 ].angularVelocity.z );
// 				bowling_ball[ 0 ].velocity.set( 0.0, 0.0, bowling_ball[ 0 ].velocity.z );
// 				bowling_ball[ 0 ].force.set( 0.0, 0.0, bowling_ball[ 0 ].force.z );
// 				
// 			}
			
		}
		else
		{
			
// 			bowling_ball[ 1 ].position.set( bowling_ball_last_updated_position[ 0 ], 
// 					                bowling_ball_last_updated_position[ 1 ],
// 							bowling_ball_last_updated_position[ 2 ] );
			
		}
		
// 		bowling_ball[ 1 ].rotation.set( 0.0, 
// 					        0.0, 
// 					        0.0 );
// 		bowling_ball[ 0 ].position.set( bowling_ball[ 1 ].position.x, 
// 					        bowling_ball[ 1 ].position.y, 
// 					        bowling_ball[ 1 ].position.z );
// 		bowling_ball[ 0 ].quaternion =  bowling_ball[ 1 ].quaternion;
// 		bowling_ball[ 0 ].angularVelocity.set( 0.0, 0.0, 0.0 );
// 		bowling_ball[ 0 ].velocity.set( 0.0, 0.0, 0.0 );
// 		bowling_ball[ 0 ].force.set( 0.0, 0.0, 0.0 );

		bowling_ball_last_updated_position = [ 
			
			bowling_ball[ 1 ].position.x,
			bowling_ball[ 1 ].position.y,
			bowling_ball[ 1 ].position.z
			
		];

	}
	
}

// Event callbacks.
	

function on_mouse_move( event )
{
	
	mouse_is_moving = true;
	
	mouse_positions.push( [ event.clientX, event.clientY ] );
	
	if ( mouse_positions.length >= 100 )
	{
		
		mouse_positions = mouse_positions.splice( mouse_positions.length - 50, mouse_positions.length );
		
	}
	
	if ( mouse_is_down && on_mouse_down_mouse_on_ball )
	{
	
// 		var x1 = on_mouse_down_position[ 0 ];
// 		var y1 = on_mouse_down_position[ 1 ];
// 		
// 		var x2 = event.clientX;
// 		var y2 = event.clientY;
// 		
// 		var vector = new THREE.Vector3(  ( x1 / window.innerWidth  ) * 2 - 1,
// 						-( y1 / window.innerHeight ) * 2 + 1,
// 						0.5 
// 		);
// 		projector.unprojectVector( vector, camera );
// 		var direction  =  vector.sub( camera.position ).normalize( );
// 		var distance   = -camera.position.z / direction.z;
// 		var position1  =  camera.position.clone( ).add( direction.multiplyScalar( distance ) );
// 		
// 		vector = new THREE.Vector3(  ( x2 / window.innerWidth  ) * 2 - 1,
// 					-( y2 / window.innerHeight ) * 2 + 1,
// 					0.5 
// 		);
// 		projector.unprojectVector( vector, camera );
// 		direction     =  vector.sub( camera.position ).normalize( );
// 		distance      = -camera.position.z / direction.z;
// 		var position2 =  camera.position.clone( ).add( direction.multiplyScalar( distance ) );
// 		
// 		position1_xd = bowling_ball_last_updated_position[ 0 ] - position1.x;
// 		position1_yd = bowling_ball_last_updated_position[ 1 ] - position1.y;
// 		
// 		position1.x += position1_xd;
// 		position1.y += position1_yd;
// 		
// 		position2.x += position1_xd;
// 		position2.y += position1_yd;
// 		
// 		var xd = position2.x - position1.x;
// 		var yd = position2.y - position1.y;
// 		
// 		var x = xd;
// 		var y = yd;
// 		
// 		var l = Math.sqrt( ( xd * xd ) + ( yd * yd ) );
// 		
// 		if ( l != 0.0 )
// 		{
// 			x = xd / l;
// 			y = yd / l;
// 			
// 		}		
// 		
// 		throwing_direction_arrow.visible  = true;
// 		throwing_direction_arrow.position = new THREE.Vector3( bowling_ball_last_updated_position[ 0 ], bowling_ball_origin[ 1 ], 1 );
// 		throwing_direction_arrow.setDirection( new THREE.Vector3( x, y, 0 ) );
// 		throwing_direction_arrow.setLength( 50 );
// 
// 		throwing_target.position.set( ( x * 370 ) + bowling_ball_last_updated_position[ 0 ], ( y * 370 ) + bowling_ball_origin[ 1 ], 5 );
		
	}
	else
	{
		
		throwing_direction_arrow.position.z = -20;
		throwing_direction_arrow.setDirection( new THREE.Vector3( 0, 0, 0 ) );
		throwing_target.position.set( 0, 0, -20 );
		
	}
	
}

function on_mouse_down( event )
{
	
	mouse_is_down = true;
	
	on_mouse_down_time = ( new Date( ) ).valueOf( );
	
	on_mouse_down_position = [ event.clientX, event.clientY ];
	
	if ( mouse_3d_intersection( event.clientX, event.clientY ).id == bowling_ball[ 1 ].id )
	{
	
		on_mouse_down_mouse_on_ball = true;
		
	}
	else
	{
		
		on_mouse_down_mouse_on_ball = false;
		
	}

}

function on_mouse_up( event )
{
	
	mouse_is_down = false;
	
	if ( play == false ) return;
	
	if ( bowling_ball_thrown == true )
	{

		apply_wind_gust = false;
		
		reset_bowling_ball( );
		
		return;
		
	}
	
	if ( on_mouse_down_mouse_on_ball == false ) return;
	
	on_mouse_down_mouse_on_ball = false;
	
	var x1 = on_mouse_down_position[ 0 ];
	var y1 = on_mouse_down_position[ 1 ];
	
	var x2 = event.clientX;
	var y2 = event.clientY;
	
	var position1 = screen_position_2d_to_3d( x1, y1, 0 );
	var position2 = screen_position_2d_to_3d( x2, y2, 0 );
	
	if ( y2 - y1 > 0 ) return;
	
	var translate_x = bowling_ball_last_updated_position[ 0 ] - position1.x;
	var translate_y = bowling_ball_last_updated_position[ 1 ] - position1.y;
	
	position1.x += translate_x;
	position1.y += translate_y;
	
	position2.x += translate_x;
	position2.y += translate_y;
	
	var xd = position2.x - position1.x;
	var yd = position2.y - position1.y;
	
	var x = xd;
	var y = yd;
	
	var l = Math.sqrt( ( xd * xd ) + ( yd * yd ) );
	
	if ( l != 0.0 )
	{
		x = xd / l;
		y = yd / l;
		
	}
	
	if ( y > 0 )
	{
		
		y *= -1;
		x *= -1;
		
	}
	
	var power = calculate_power_level( )
	
	if ( power < 0 ) power = 0;
	
	var fx = x * power;
	var fy = y * power;

	bowling_ball[ 0 ].applyForce( new CANNON.Vec3( fx, fy, 0.0 ), 
				      new CANNON.Vec3( bowling_ball_origin[ 0 ], 
						       bowling_ball_origin[ 1 ], 
						       bowling_ball_origin[ 2 ] + 5 ) );
	
	total_throws += 1;
	
	current_round_throws += 1;
	
	bowling_ball_thrown = true;
	
	switching_view = true;
		
	var timer = window.setTimeout( function ( ) { switch_to_bowling_pin_view( ); }, 1200 );
		
	timers.push( timer );
		
	clear_old_timers( );
	
	if ( power > 1 && l > 0.0001 )
	{
	
		roll_sound_effect.stop( );

		roll_sound_effect.play( );
		
	}
	else
	{
		
		drop_sound_effect.stop( );
		
		drop_sound_effect.play( );
		
	}
	
	if ( random_float_in_range( 0, 100 ) <= 5 )
	{
		
		apply_wind_gust = true;
		
		window.setTimeout( function ( ) { 
			
			wind_sound_effect.stop( );
			wind_sound_effect.play( );
			
		}, 100 );
		
	}

}

function on_resize( )
{
	
	renderer.setSize( window.innerWidth, window.innerHeight );

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix( );
	
	throwing_div.style.width   = window.innerWidth  + "px";
	throwing_div.style.height  = window.innerHeight + "px";
	
	audio_div.style.top        = 20 + "px";
	audio_div.style.left       = ( window.innerWidth - 120 ) + "px";
}

function handle_wind( )
{
	
	var y = bowling_ball[ 1 ].position.y;	
	
	if ( bowling_ball_thrown == true && y > -165 && apply_wind_gust )
	{
		
		
		var x = bowling_ball_origin[ 0 ];
		var z = bowling_ball_origin[ 2 ];
		
		bowling_ball[ 0 ].applyForce( new CANNON.Vec3( 2000, 0.0, 0.0 ), 
				              new CANNON.Vec3( bowling_ball_origin[ 0 ], 
						               bowling_ball_origin[ 1 ], 
						               bowling_ball_origin[ 2 ] + 5 ) );
		
	}
	
}

function monitor_bowling_ball( )
{
	
	if ( bowling_ball[ 1 ].position.y <= -240  ||
	     bowling_ball[ 1 ].position.y >= 240   ||
	     bowling_ball[ 1 ].position.z < -15    ||
	     isNaN( bowling_ball[ 1 ].position.x ) ||
	     isNaN( bowling_ball[ 1 ].position.y ) ||
	     isNaN( bowling_ball[ 1 ].position.z )  )
	{
		
		apply_wind_gust = false;
		
		reset_bowling_ball( );
		
	}
	
}

function reset_bowling_ball( )
{
	
	bowling_ball[ 1 ].position.set( bowling_ball_origin[ 0 ], 
					bowling_ball_origin[ 1 ], 
					bowling_ball_origin[ 2 ] );
	bowling_ball[ 1 ].rotation.set( 0, 
					0, 
					0 );
	bowling_ball[ 0 ].position.set( bowling_ball[ 1 ].position.x, 
					bowling_ball[ 1 ].position.y, 
					bowling_ball[ 1 ].position.z );
	bowling_ball[ 0 ].quaternion =  bowling_ball[ 1 ].quaternion;
	bowling_ball[ 0 ].angularVelocity.set( 0, 0, 0 );
	bowling_ball[ 0 ].velocity.set( 0, 0, 0 );
	bowling_ball[ 0 ].force.set( 0, 0, 1200 );
	
	bowling_ball_thrown = false;
	
	switching_view = true;
	
	switch_to_throw_view( );
	
}

function monitor_bowling_pins( )
{
	
	if ( resetting_bowling_pins == true || bowling_pins.length == 0 || play == false ) return;	
	
	var resets = 0;
	
	var angle = 15;
	
	var distance = 5;
	
	var i = bowling_pins.length;
	
	while ( i-- )
	{
	
		var bowling_pin = bowling_pins[ i ];
		
		if ( Math.abs( bowling_pin[ 1 ].rotation.x * 180 / Math.PI ) >= angle || 
		     Math.abs( bowling_pin[ 1 ].rotation.y * 180 / Math.PI ) >= angle || 
		     Math.abs( bowling_pin[ 1 ].position.x - bowling_pin[ 0 ].initPosition.x ) > distance ||
		     Math.abs( bowling_pin[ 1 ].position.y - bowling_pin[ 0 ].initPosition.y ) > distance ||
		     Math.abs( bowling_pin[ 1 ].position.z - bowling_pin[ 0 ].initPosition.z ) > distance )
		{
			
			resets += 1;
			
			bowling_pins_reset = false;
			
			if ( bowling_pin[ 1 ].visible )
			{
			
				hit_bowling_pins.push( i );
				
			}
			
		}
		
	}
	
	if ( hit_bowling_pins.length > 0 && ( new Date( ) ).valueOf( ) - hit_sound_effect_played > 2000 )
	{
		
		hit_sound_effect.stop( );
		
		hit_sound_effect.play( );
		
		hit_sound_effect_played = ( new Date( ) ).valueOf( );
		
	}

	if ( hit_bowling_pins.length != 0 )
	{
	
		window.setTimeout( function ( ) {
			
			if ( bowling_pins_reset == true ) return;
		
			var i = hit_bowling_pins.length;
			
			while ( i-- )
			{

				bowling_pins[ hit_bowling_pins[ i ] ][ 1 ].visible = false;
			
				bowling_pins[ hit_bowling_pins[ i ] ][ 0 ].collisionFilterGroup = 2;
		
			}
			
			hit_bowling_pins = [ ];
			
		}, 1500 );
	
	}	
	
	if ( resets == bowling_pins.length )
	{
		
		resetting_bowling_pins = true;
		
		var timer = window.setTimeout( function ( ) {
			
			reset_bowling_pins( );
			
			reset_bowling_ball( );
	
			round += 1;
			
			if ( current_round_throws == 1 )
			{
				
				strike_sound_effect.stop( );
				
				strike_sound_effect.play( );
				
				strike_div.style.visibility = "visible";
				
				var s     = { o: 0.0 };
				var f     = { o: 1.0 };
				var tween = new TWEEN.Tween( s ).to( f, 1000 );
				
				tween.onUpdate( function( ) {
					
					
					
					strike_div.style.opacity = "" + s.o + "";
				
				} );
				
				tween.onComplete( function( ) {
					
					strike_div.style.visibility = "hidden";
				
				} );
				
				tween.easing( TWEEN.Easing.Bounce.InOut );
				
				tween.start( );
				
			}
			
			current_round_throws = 0;
			
		}, 10 );
		
		timers.push( timer );
		
		clear_old_timers( );
		
	}
	
}

function reset_bowling_pins( )
{
	
	var i = bowling_pins.length;
			
	while ( i-- )
	{
		
		var bowling_pin          = bowling_pins[ i ];
		var bowling_pin_position = bowling_pin_positions[ i ];
	
		bowling_pin[ 1 ].position.set( bowling_pin_position[ 0 ], 
					       bowling_pin_position[ 1 ], 
					       bowling_pin_position[ 2 ] );
		
		bowling_pin[ 1 ].rotation.set( 0, 0, Math.PI );
		
		bowling_pin[ 0 ].position.set(   bowling_pin[ 1 ].position.x,  
						 bowling_pin[ 1 ].position.y,  
						 bowling_pin[ 1 ].position.z   );
		bowling_pin[ 0 ].quaternion.set( bowling_pin[ 1 ].quaternion.x, 
						 bowling_pin[ 1 ].quaternion.y, 
						 bowling_pin[ 1 ].quaternion.z, 
						 bowling_pin[ 1 ].quaternion.w );
		
		bowling_pin[ 0 ].angularVelocity.set( 0, 0, 0 );
		bowling_pin[ 0 ].velocity.set( 0, 0, 0 );
		bowling_pin[ 0 ].force.set( 0, 0, 0 );
		
		bowling_pin[ 1 ].visible = true;
	
		bowling_pin[ 0 ].collisionFilterGroup = 1;
	
	}
	
	hit_bowling_pins.length = 0;
	hit_bowling_pins        = [ ];
	
	resetting_bowling_pins = false;
	
	bowling_pins_reset = true;
	
}

function handle_power_div( )
{
	
	if ( mouse_positions.length == 0 || play == false ) return;
	
	if ( bowling_ball_thrown == true )
	{
		
		power_div.style.background = "rgba(0,0,0,0)";
		
		power_div.style.width = "300px";
		
		power_div.innerHTML = "CLICK TO RETURN THE BALL";
		
		var x = mouse_positions[ mouse_positions.length - 1 ][ 0 ] + 20;
		var y = mouse_positions[ mouse_positions.length - 1 ][ 1 ] + 20;
		
		power_div.style.top  = y + "px";
		power_div.style.left = x + "px";
		
		//power_div.style.visibility = "hidden";
		
	}
	else
	{
		
		power_div.style.visibility = "visible";
		
		power_div.style.background = "#0f0";
		
		power_div.style.width = "200px";
		
		power_div.innerHTML = "";
		
		var x = mouse_positions[ mouse_positions.length - 1 ][ 0 ] + 20;
		var y = mouse_positions[ mouse_positions.length - 1 ][ 1 ] + 20;
		
		power_div.style.top  = y + "px";
		power_div.style.left = x + "px";
		
		if ( mouse_is_down == true && on_mouse_down_mouse_on_ball == true )
		{

			var power = calculate_power_level( );
			
			var percentage = Math.floor( ( power / max_throwing_power ) * 100 );
			
			if ( percentage < 70 )
			{
				
				power_div.style.background = "#ff0";
				
			}
			
			if ( percentage < 30 )
			{
				
				power_div.style.background = "#f00";
				
			}
			
			if ( percentage < 0 )
			{
				
				percentage = 0;
				
			}
			
			power_div.style.width = percentage * 2 + "px";
			
		}
		else
		{
			
			if ( mouse_3d_intersection( mouse_positions[ mouse_positions.length - 1 ][ 0 ], 
				                    mouse_positions[ mouse_positions.length - 1 ][ 1 ] ).id ==
				                    bowling_ball[ 1 ].id )
			{
			
			
				power_div.style.background = "rgba(0,0,0,0)";
			
				power_div.style.width = "300px";
				
				power_div.innerHTML = "HOLD DOWN THE MOUSE, AIM, AND RELEASE";
				
				var x = mouse_positions[ mouse_positions.length - 1 ][ 0 ] + 20;
				var y = mouse_positions[ mouse_positions.length - 1 ][ 1 ] + 20;
				
				power_div.style.top  = y + "px";
				power_div.style.left = x + "px";
				
			}
			else
			{
				
				power_div.style.background = "rgba(0,0,0,0)";
			
				power_div.style.width = "300px";
				
				power_div.innerHTML = "MOVE THE MOUSE OVER THE BALL";
				
				var x = mouse_positions[ mouse_positions.length - 1 ][ 0 ] + 20;
				var y = mouse_positions[ mouse_positions.length - 1 ][ 1 ] + 20;
				
				power_div.style.top  = y + "px";
				power_div.style.left = x + "px";
				
			}
				
		}
		
	}
	
}

function handle_round_div( )
{
	
	round_div.innerHTML = "Round: " + round;
	
}

function handle_score_div( )
{
	
	if ( total_throws == 0 )
	{
		
		var score = Math.floor( round / 1 * 100 );
		
		if ( score > 100 ) score = 100;
		
		if ( score < 0 ) score = 0;
		
		score_div.innerHTML = "Score: " + score + "%";
		
	}
	else
	{
		
		var score = Math.floor( round / total_throws * 100 );
		
		if ( score > 100 ) score = 100;
		
		if ( score < 0 ) score = 0;
	
		score_div.innerHTML = "Score: " + score + "%";
		
	}
	
}

function handle_game_reset( )
{
	
	if ( round == 11 )
	{
		
		play = false;
		
		apply_wind_gust = false;
		
		reset_bowling_pins( );
		
		strike_div.style.visibility = "hidden";
		
		canvas.setAttribute( "style", "-webkit-filter: grayscale( 0.5 ) blur( 10px )" );
		
		var score = Math.floor( round / total_throws * 100 );
		
		if ( score > 100 ) score = 100;
		
		if ( score < 0 )   score = 0;
		
		var kuddos;
		
		if ( score <= 10 )
		{
			
			kuddos = "Yikes...";
			
			laugh_sound_effect.stop( );
			
			laugh_sound_effect.play( );
			
		}
		else if ( score <= 50 )
		{
			
			kuddos = "Meh.";
			
			fail_sound_effect.stop( );
			
			fail_sound_effect.play( );
			
		}
		else if ( score <= 80 )
		{
			
			kuddos = "Awesome.";
			
			applause1_sound_effect.stop( );
			
			applause1_sound_effect.play( );
			
		}
		else
		{
			
			kuddos = "Yowza!";
			
			applause2_sound_effect.stop( );
			
			applause2_sound_effect.play( );
			
		}
		
		final_score_div.innerHTML = "Final Score:<br>" + score + "%<br>" + kuddos;
		
		final_score_div.style.visibility = "visible";
		
		round_div.style.visibility = "hidden";
		
		score_div.style.visibility = "hidden";
		
		power_div.style.visibility = "hidden";
		
		window.setTimeout( function ( ) { 
			
			final_score_div.style.visibility = "hidden"; 
			
			round_div.style.visibility = "visible";
		
			score_div.style.visibility = "visible";
			
			power_div.style.visibility = "visible";
			
			canvas.setAttribute( "style", "-webkit-filter: grayscale( 0.0 ) blur( 0px )" );
			
			play = true;
			
		}, 6000 );
		
		round = 1;
		
		total_throws = 0;
		
		current_round_throws = 0;
		
	}
	
}

function handle_arena_sphere( )
{
	
	if ( arena_sphere == undefined ) return;
	
	arena_sphere.rotation.z += 0.001;
	
	if ( arena_sphere.rotation.z >= Math.PI * 2 ) arena_sphere.rotation.z = 0.0;
	
}

function handle_lights( )
{
	
	var time = ( new Date( ) ).valueOf( );
	
	if ( time > flicker_spot_light_time )
	{
		
		spot_light.intensity += random_float_in_range( -0.4, 0.4 );
		
		if ( spot_light.intensity < 0 ) spot_light.intensity = 0.1;
		
		if ( time - flicker_spot_light_time > 1000 )
		{
			
			spot_light.intensity = 1.0;
			
			flicker_spot_light_time = time + random_float_in_range( 3000, 7000 );
			
		}
		
	}
	
	if ( system_settings_level == 0 ) return;

	var glow_time_delta = time - last_glow_runway_lights_time;
	
	var intensity = ( -1 / 25 ) * glow_time_delta + 50;
	
	if ( intensity < 0 )
	{
		intensity = 0;
		
		last_glow_runway_lights_time = ( new Date( ) ).valueOf( );
		
	}
	
	if ( system_settings_level == 1 )
	{
		
		runway_light1.intensity = intensity;
		
		if ( runway_light1.position.y <= -165 )
		{
			runway_light1.position.y = 240;
			
		}
		
		runway_light1.position.y -= 2.5;
		
	}
	else if ( system_settings_level == 2 )
	{
		
		runway_light1.intensity = intensity;
		runway_light2.intensity = intensity;
		runway_light3.intensity = intensity;
		
		if ( runway_light1.position.y <= -165 )
		{
			runway_light1.position.y = 240;
			runway_light2.position.y = 250;
			runway_light3.position.y = 250;
			
		}
		
		runway_light1.position.y -= 2.5;
		runway_light2.position.y -= 2.0;
		runway_light3.position.y -= 2.0;
	}
	
}

function switch_to_throw_view( )
{
	
	camera.up.set( 0, 0, 1 );
	camera.position.z = throwing_view.position.z;
	camera.position.y = throwing_view.position.y;
	camera.lookAt( new THREE.Vector3( throwing_view.look_at.x, throwing_view.look_at.y, throwing_view.look_at.z ) );
	
	current_view = "throw";
	
	switching_view = false;
	
}

function switch_to_bowling_pin_view( )
{
	
	if ( bowling_ball[ 1 ].position.y == bowling_ball_origin[ 1 ] ) return;	
	
	camera.position.z = bowling_pin_view.position.z;
 	camera.position.y = bowling_pin_view.position.y;
 	camera.lookAt( new THREE.Vector3( bowling_pin_view.look_at.x, bowling_pin_view.look_at.y, bowling_pin_view.look_at.z ) );
 	camera.rotation.z = Math.PI;
	
	current_view = "bowling_pin";
	
	switching_view = false;
	
}

window.onload = set_system_settings_level;

// Utilities.

function random_float_in_range( min, max ) 
{
    
	return Math.random( ) * ( max - min ) + min;
	
}

function random_sign( ) 
{
    
	var x = 1;
	
	if ( Math.random( ) < 0.5 ) x = -1;
	
	return x;
	
}

function clear_old_timers( )
{
	
	var i = timers.length;	
	
	if ( i == 1 ) return;
	
	i -= 1;	
	
	while ( i-- )
	{
		
		window.clearTimeout( timers[ i ] );
		
	}
	
	timers = [ timers[ timers.length - 1 ] ];
	
}

function screen_position_2d_to_3d( x, y, z_plane )
{
	
	if ( z_plane == undefined ) z_plane = 0;
	
	var vector = new THREE.Vector3( );
	
	vector.x =  ( x / window.innerWidth  ) * 2 - 1;
	vector.y = -( y / window.innerHeight ) * 2 + 1;
	vector.z = 0.5;
	
	projector.unprojectVector( vector, camera );
	
	var direction   =  vector.sub( camera.position ).normalize( );
	var distance    = -camera.position.z / direction.z;
	var position_3d =  camera.position.clone( ).add( direction.multiplyScalar( distance - z_plane ) );
	
	return position_3d;
	
}

function calculate_power_level( )
{
	
	if ( on_mouse_down_time == null || on_mouse_down_time == undefined ) return max_throwing_power;
	
	var t1 = on_mouse_down_time / 1000;
	var t2 = ( new Date( ) ).valueOf( ) / 1000;
	var td = t2 - t1;
	
	var power = ( -( 1 / 0.000005 ) * td ) + max_throwing_power;
	
	if ( power < 0 ) power = 0;

	return power;
	
}

function mouse_3d_intersection( x, y )
{

	var mouse_coordinates = new THREE.Vector3( );
	
	mouse_coordinates.x =     2 * ( x / window.innerWidth  ) - 1;
	mouse_coordinates.y = 1 - 2 * ( y / window.innerHeight );
	mouse_coordinates.z = 0.5;
	
	var ray = projector.pickingRay( mouse_coordinates, camera );
	var objects = ray.intersectObjects( scene.children );
	
	if( objects.length )
	{
		
		return objects[ 0 ].object;
		
	}

}
