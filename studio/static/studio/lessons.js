'use strict';
(()=>{
const el=id=>document.getElementById(id);
const line=d=>`<path d="${d}"/>`;
const round=(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r}"/>`;
const oval=(x,y,rx,ry)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"/>`;
const step=(title,instruction,svg)=>({title,instruction,svg});
const catalog=[
{id:'sun',title:'Smiling sun',age:4,skill:'Circles & straight lines',challenge:'Draw a tiny sun beside your big sun. Which one has longer rays?',steps:[
step('Make a round middle','In the middle of your paper, draw a circle. Go slowly around. A wobbly circle is welcome.',round(300,200,75)),
step('Give it some sunshine','Draw short lines pointing out from the circle. Leave a little gap between each line and the circle.',line('M300 95V60 M300 305V340 M195 200H160 M405 200H440 M225 125L200 100 M375 125L400 100 M225 275L200 300 M375 275L400 300')),
step('Add two eyes','Inside the circle, draw two little circles for eyes.',round(275,185,5)+round(325,185,5)),
step('Make a happy smile','Draw a curved line under the eyes. Add your favorite colors on paper when you are ready.',line('M270 215Q300 245 330 215'))]},
{id:'fish',title:'Friendly fish',age:4,skill:'Ovals & triangles',challenge:'Draw a second fish swimming the other way. Add bubbles around both fish.',steps:[
step('Draw an oval','Draw a wide oval in the middle of the paper. This is the fish’s body.',oval(300,210,110,65)),
step('Add a triangle tail','At the left end, draw a triangle pointing away from the oval.',line('M195 210L130 150V270Z')),
step('Add an eye and mouth','Near the right end, draw a little round eye and a small curved mouth.',round(365,195,7)+line('M395 225Q408 233 416 220')),
step('Give your fish a fin','Draw a triangle on top. Add a curved line behind the eye for a gill.',line('M260 150L290 105L325 145 M345 165Q320 210 345 255'))]},
{id:'house',title:'Cozy house',age:4,skill:'Squares & triangles',challenge:'Who lives here? Add a path, flowers, or a pet outside.',steps:[
step('Start with a box','Draw a big square. Keep plenty of room above it for the roof.',line('M190 180H410V350H190Z')),
step('Put on a roof','Draw two sloping lines from the top corners. Let them meet above the square.',line('M170 180L300 80L430 180Z')),
step('Make a door','Draw a tall rectangle at the bottom. Add a tiny dot for a handle.',line('M270 350V260H330V350')+round(318,310,3)),
step('Add two windows','Draw a small square on each side of the door. Add a cross inside each one.',line('M215 220H250V255H215Z M350 220H385V255H350Z M232 220V255 M215 237H250 M367 220V255 M350 237H385'))]},
{id:'flower',title:'Happy flower',age:4,skill:'Loops & curves',challenge:'Make a garden of three flowers. Try a different petal shape on each.',steps:[
step('Draw the center','Draw a small circle above the middle of the page.',round(300,170,32)),
step('Loop around it','Draw five rounded loops around the circle. Each loop is a petal.',line('M280 145C210 80 290 60 300 138 M308 140C345 65 400 120 328 160 M330 175C420 170 385 250 318 196 M300 203C335 285 240 280 280 195 M270 175C180 220 185 125 270 155')),
step('Grow a stem','From the bottom of the flower, draw a long line down toward the bottom of the paper.',line('M300 205V360')),
step('Add two leaves','Draw a pointy loop on each side of the stem. Color your garden on paper.',line('M300 300Q210 215 225 300Q255 335 300 320 M300 275Q380 210 380 270Q340 310 300 305'))]},
{id:'cat',title:'Curious cat',age:6,skill:'Symmetry & expressions',challenge:'Draw the cat again with sleepy eyes. How do the eyes change its expression?',steps:[
step('Start with a head','Draw a wide, rounded head. Leave room above it for two ears.',oval(300,220,105,85)),
step('Add two ears','Above the left and right sides, draw two triangles. Add a smaller triangle inside each.',line('M210 175L205 80L265 140 M335 140L395 80L390 175 M220 140L218 108L243 140 M357 140L382 108L380 140')),
step('Place the face','Put two eyes halfway down the head. Add a small triangle nose between and below them.',oval(260,210,10,15)+oval(340,210,10,15)+line('M285 240H315L300 255Z')),
step('Draw a smile','From the nose, curve down and out in both directions.',line('M300 255Q275 285 260 260 M300 255Q325 285 340 260')),
step('Finish with whiskers','Draw three whiskers on each cheek. Notice how both sides balance.',line('M240 245L165 230 M240 260L160 260 M240 275L170 295 M360 245L435 230 M360 260L440 260 M360 275L430 295'))]},
{id:'rocket',title:'Space explorer',age:6,skill:'Symmetry & overlapping shapes',challenge:'Add a moon and three planets. Use different sizes to suggest distance.',steps:[
step('Build the rocket body','Draw a tall shape with a rounded, pointed top. Make both sides about the same height.',line('M245 300V180Q245 110 300 60Q355 110 355 180V300Z')),
step('Add the window','Draw a circle near the top, then a smaller circle inside for a window frame.',round(300,175,30)+round(300,175,21)),
step('Add side fins','Draw a triangle on each side near the bottom. The fins point outward.',line('M245 235L200 315L245 290 M355 235L400 315L355 290')),
step('Add a bottom band','Draw a straight line across the body just above its bottom edge.',line('M245 275H355')),
step('Light the engines','Below the body draw a zigzag flame. Make its longest point in the middle.',line('M255 300L240 355L280 335L300 390L320 335L360 355L345 300'))]},
{id:'butterfly',title:'Garden butterfly',age:6,skill:'Mirrored curves & patterns',challenge:'Design matching patterns for both wings, then invent an asymmetrical butterfly.',steps:[
step('Make a slender body','Draw a tall, narrow oval and a small head touching its top.',oval(300,230,14,85)+round(300,130,18)),
step('Draw the upper wings','From each side of the body draw a large loop up and out, then back to the middle.',line('M285 190C135 20 100 225 285 235 M315 190C465 20 500 225 315 235')),
step('Draw the lower wings','Add a smaller loop below each upper wing. Try to match their sizes.',line('M285 235C130 210 180 380 287 290 M315 235C470 210 420 380 313 290')),
step('Add antennae','Draw two short curved lines above the head.',line('M290 115Q260 70 250 100 M310 115Q340 70 350 100')),
step('Repeat a pattern','Put one oval in each upper wing and a small circle in each lower wing.',oval(215,175,25,35)+oval(385,175,25,35)+round(235,280,14)+round(365,280,14))]},
{id:'tree',title:'Branching tree',age:6,skill:'Organic lines & texture',challenge:'Draw the same tree in winter. Which lines would you change or leave out?',steps:[
step('Draw a trunk','Draw two gently uneven lines rising from the ground. Let them get closer near the top.',line('M270 360L280 235L270 175 M330 360L320 235L330 175 M245 360H355')),
step('Split into branches','Draw branches reaching left and right. They get thinner as they travel away from the trunk.',line('M280 235L235 190L220 140 M270 210L200 190 M320 235L365 190L380 135 M340 215L400 195')),
step('Make a leafy crown','Draw a loose, bumpy shape around the branches. Think of cloud-like curves.',line('M220 195C145 225 140 140 180 130C140 70 230 45 260 80C280 30 345 35 350 80C415 40 460 100 420 140C470 185 420 235 375 205')),
step('Add bark marks','Put a few short, broken vertical lines on the trunk. Avoid filling every space.',line('M295 265L290 300 M310 315L307 345 M300 230L302 250')),
step('Add ground details','Draw a few grass strokes at the base and a fallen leaf nearby.',line('M245 360L230 340 M245 360L250 335 M355 360L365 335 M355 360L380 345 M395 355Q420 330 440 350Q425 375 395 355Z'))]},
{id:'landscape',title:'Mountain landscape',age:9,skill:'Foreground, middle ground & distance',challenge:'Redraw the scene with a low horizon. How does showing more sky change the mood?',steps:[
step('Place the horizon','About halfway down the page, draw a light horizontal line. This separates land and sky.',line('M70 220H530')),
step('Add distant mountains','Above the horizon make a row of uneven peaks. Keep them smaller than nearby objects.',line('M70 220L160 110L220 175L300 80L400 185L465 120L530 220')),
step('Lead the eye with a river','Draw two curves that are close at the horizon and spread apart toward the bottom.',line('M295 220Q220 260 290 300Q360 345 160 390 M305 220Q260 260 330 300Q440 350 440 390')),
step('Place a foreground tree','Near one side, draw a large trunk and a loose leafy shape. Large nearby objects create depth.',line('M110 355L120 250L135 355 M120 270C55 265 60 195 95 195C75 135 160 145 155 190C205 180 200 265 130 270')),
step('Suggest mountain shadows','On the right side of a few peaks, add sloping lines. Leave the opposite sides light.',line('M160 110L170 170L195 200 M300 80L320 150L350 180 M465 120L470 170L500 205')),
step('Finish with depth','Add a few large grass strokes in front. Keep distant details sparse. Shade distant mountains lightly with your pencil.',line('M75 375L65 350 M75 375L85 345 M480 370L470 340 M480 370L490 345 M510 385L520 355'))]},
{id:'cube',title:'A box in perspective',age:9,skill:'Parallel edges & value',challenge:'Put a second box beside this one. Keep the sloping edges parallel to the first box.',steps:[
step('Draw the front face','Draw a square slightly left of center. Keep your lines light so they can be adjusted.',line('M180 170H330V320H180Z')),
step('Send the corners backward','From the top-left, top-right, and bottom-right corners, draw equal-length diagonal lines in the same direction.',line('M180 170L260 100 M330 170L410 100 M330 320L410 250')),
step('Join the back edges','Connect the two upper endpoints, then connect the two right endpoints. You now have three visible faces.',line('M260 100H410V250')),
step('Choose a light source','Imagine light coming from the upper left. Keep the top face almost white; give the front face a few light strokes.',line('M200 190V300 M220 190V300 M240 190V300 M260 190V300 M280 190V300 M300 190V300')),
step('Shade the side darker','Use more closely spaced strokes on the right face. On paper, build darkness in light layers rather than pressing hard.',line('M342 177V300 M352 168V290 M362 159V280 M372 150V270 M382 142V260 M392 133V250'))]},
{id:'owl',title:'Woodland owl',age:9,skill:'Proportion & feather patterns',challenge:'Draw a second owl looking sideways. Use a reference from a book to study its silhouette.',steps:[
step('Block in the silhouette','Draw an oval body and a wide oval head overlapping its top. Keep these construction lines light.',oval(300,250,88,105)+oval(300,150,105,65)),
step('Build the eye disks','Inside the head, draw two large circles side by side. Put smaller pupils inside.',round(260,150,33)+round(340,150,33)+round(260,150,10)+round(340,150,10)),
step('Add the beak and tufts','Draw a small downward triangle between the eyes, and two pointed tufts above the head.',line('M288 180H312L300 205Z M210 120L205 65L250 95 M350 95L395 65L390 120')),
step('Define the wings','Inside each side of the body draw a curved line from shoulder to lower body.',line('M240 205Q220 285 275 325 M360 205Q380 285 325 325')),
step('Suggest feathers','Use small V-shaped marks on the chest. Space them out rather than drawing every feather.',line('M280 230L290 240L300 230 M310 250L320 260L330 250 M275 270L285 280L295 270 M300 290L310 300L320 290')),
step('Give it a branch','Draw two feet and a branch underneath. On paper erase overlapping construction lines at the neck, then shade one side lightly.',line('M275 345V365 M285 345V365 M315 345V365 M325 345V365 M170 365H430 M180 378H420'))]},
{id:'street',title:'A street that goes far away',age:9,skill:'One-point perspective',challenge:'Add more buildings nearer the vanishing point. Make each one smaller and closer together.',steps:[
step('Set a vanishing point','Draw a light horizon across the page. Mark a small point in its center.',line('M60 160H540')+round(300,160,4)),
step('Draw the road edges','Draw two lines from that point down to the bottom corners. Things get smaller toward the point.',line('M300 160L80 390 M300 160L520 390')),
step('Add a building front','On the left draw a rectangle facing you. Keep vertical edges upright.',line('M85 150H175V310H85Z')),
step('Give it a side','From its top-right and bottom-right corners draw lines partway toward the vanishing point. Join their ends with a vertical line.',line('M175 150L245 155V226L175 310')),
step('Add a doorway and windows','Put a door and two windows on the front face. Their edges stay horizontal and vertical.',line('M115 310V250H145V310 M100 180H120V205H100Z M140 180H160V205H140Z')),
step('Repeat road markings','Draw short marks down the road center. Make distant marks shorter and closer together. Erase unneeded guide lines on paper.',line('M300 185V192 M300 210V225 M300 255V280 M300 330V370'))]}
];
const moreLessons = [
{id:'apple',title:'Crunchy apple',age:4,category:'Fruits',skill:'Rounded shapes & a leaf',challenge:'Draw a smaller apple beside it and give each a different color.',steps:[
step('Draw the apple shape','Draw a round shape with a little dip at the top and bottom.',line('M300 140C210 90 160 200 210 290Q250 350 300 325Q350 350 390 290C440 200 390 90 300 140Z')),
step('Add a stem','From the top dip, draw a short leaning stem with two close lines.',line('M298 138L310 90L318 92L306 140')),
step('Grow a leaf','Beside the stem draw a pointed loop. Add a line through its middle.',line('M312 110Q350 60 390 85Q360 125 312 110 M320 108L375 88')),
step('Make a shiny patch','Draw a curved mark near one side. When coloring, keep this patch lighter.',line('M240 180Q215 210 230 245'))]},
{id:'pear',title:'Curvy pear',age:6,category:'Fruits',skill:'Uneven curves & contour',challenge:'Draw an apple and pear together. Compare their widest parts.',steps:[
step('Start with a narrow top','Draw a small curved cap. Continue each side down a little.',line('M260 185Q260 120 300 120Q340 120 340 185')),
step('Widen the bottom','Continue those sides outward into a wide round base, then join them.',line('M260 185C150 290 215 355 300 350C385 355 450 290 340 185')),
step('Add a bent stem','Draw two short curved lines rising from the top.',line('M295 120Q290 85 315 75 M305 120Q300 90 320 85 M315 75L320 85')),
step('Draw a small leaf','Add a narrow leaf near the stem with a curved vein.',line('M307 100Q350 60 375 100Q340 120 307 100 M315 100H360')),
step('Follow the curve','Add a curved contour near the bottom-right side. Shade gently beside it on paper.',line('M350 240Q395 305 335 325'))]},
{id:'cherries',title:'A pair of cherries',age:6,category:'Fruits',skill:'Paired forms & overlap',challenge:'Try three cherries. Place one partly behind another.',steps:[
step('Draw the first cherry','Draw a round shape on the left, with a small dip on top.',line('M230 230C150 190 155 325 230 330C305 325 310 190 230 230Z')),
step('Add its partner','Draw a second cherry slightly higher on the right.',line('M375 210C295 170 300 305 375 310C450 305 455 170 375 210Z')),
step('Join the stems','From the top of each cherry draw a curved stem meeting at one point above.',line('M230 230Q245 140 315 90 M375 210Q370 140 315 90')),
step('Add a leaf','Draw a long leaf at the meeting point. Add a central vein.',line('M315 90Q350 35 405 75Q370 120 315 90 M325 90L390 77')),
step('Mark the highlights','Draw a small curve on each cherry. Leave these light when coloring.',line('M195 255Q185 280 200 295 M340 235Q330 260 345 275'))]},
{id:'fruit-bowl',title:'Still-life fruit bowl',age:9,category:'Fruits',skill:'Overlap, ellipses & shading',challenge:'Arrange real fruit in a bowl and draw what you see. Which fruit hides another?',steps:[
step('Sketch the bowl rim','Draw a wide, shallow oval. Keep the line light.',oval(300,250,160,35)),
step('Give the bowl depth','From each end draw a curve down to a flat base.',line('M140 250Q165 350 245 355H355Q435 350 460 250')),
step('Place a round fruit','Above the rim draw a round apple. Stop its lower edges at the rim so it looks inside the bowl.',line('M210 230C165 125 275 105 295 225 M240 140L245 110')),
step('Add an overlapping pear','Draw a pear beside the apple. On paper, erase parts of the rim hidden by the fruit.',line('M300 225C280 190 315 175 320 150Q325 115 350 135Q365 150 360 175Q420 210 390 235 M342 132L350 105')),
step('Place the cast shadow','Sketch a shallow oval beneath the bowl, leaving the part behind it hidden.',line('M205 350C80 375 180 405 345 395C500 390 540 350 420 345')),
step('Build three tones','Put light strokes on the bowl’s right side. Keep the fruit highlights white; shade the ground shadow a little darker.',line('M370 300L355 335 M390 290L370 338 M410 285L390 330 M430 275L410 320'))]},
{id:'snail',title:'Little garden snail',age:4,category:'Animals',skill:'Spirals & long curves',challenge:'Give the shell a pattern of dots or stripes.',steps:[
step('Draw a round shell','Draw a big circle near the middle of your page.',round(285,215,80)),
step('Curl a spiral','Start near the center and curl around once, growing wider.',line('M285 215C300 190 330 220 305 240C260 275 225 205 260 175C290 145 340 175 340 205')),
step('Add the body','Draw a long low body underneath, with a raised head on the right.',line('M205 280Q120 315 235 325H405Q455 325 435 255Q415 220 390 260L370 285')),
step('Add two feelers','Draw two short feelers above the head with little round tips.',line('M405 250L395 220 M425 250L440 220')+round(395,215,5)+round(442,215,5))]},
{id:'turtle',title:'Patterned turtle',age:6,category:'Animals',skill:'Shell patterns & repeated shapes',challenge:'Invent a shell pattern with hexagons, stripes, or curved tiles.',steps:[
step('Draw the shell','Draw a wide oval. Add a smaller oval inside to make a rim.',oval(295,210,115,80)+oval(295,210,100,65)),
step('Add the head','At the right side draw a rounded head with a small eye.',line('M405 190C485 155 490 260 405 235')+round(455,202,5)),
step('Add front and back feet','Draw four small curved feet peeking from above and below the shell.',line('M220 155Q185 110 175 150L195 175 M350 145Q385 105 395 150L380 170 M220 270Q180 320 170 280L190 255 M350 280Q390 325 400 285L380 260')),
step('Make shell tiles','Draw a central six-sided shape and connect its corners to the inner rim.',line('M270 175H320L345 210L320 245H270L245 210Z M270 175L245 150 M320 175L345 150 M345 210H395 M320 245L345 270 M270 245L245 270 M245 210H195')),
step('Finish with a tail','Draw a tiny pointed tail on the left. Add small curved marks on the feet.',line('M180 200L150 220L180 230 M184 281L195 286 M382 283L393 288'))]},
{id:'penguin',title:'Waddling penguin',age:6,category:'Animals',skill:'Nested shapes & proportion',challenge:'Make a penguin family by changing each bird’s height.',steps:[
step('Draw the outline','Draw a tall rounded body, narrower at the head and wider near the bottom.',line('M220 330C170 220 220 80 300 80C380 80 430 220 380 330Q300 365 220 330Z')),
step('Add a pale belly','Inside the outline draw a smaller oval belly, leaving a thick border.',oval(300,255,65,80)),
step('Place the face','Draw two small eyes and a short triangular beak between them.',round(270,145,6)+round(330,145,6)+line('M280 170H320L300 190Z')),
step('Add flippers','Draw a narrow curved flipper on each side.',line('M220 175Q140 220 175 285L205 250 M380 175Q460 220 425 285L395 250')),
step('Give it feet','Draw two flat, rounded feet beneath the body.',line('M265 345Q200 360 245 375H290V350 M335 345Q400 360 355 375H310V350'))]},
{id:'fox',title:'Woodland fox',age:9,category:'Animals',skill:'Angular forms & fur texture',challenge:'Draw your fox in a snowy scene. Keep the snow lighter than the fur.',steps:[
step('Block in the head','Draw a broad diamond-like head shape, wider at the cheeks and pointed at the chin.',line('M210 150L300 115L390 150L360 240L300 285L240 240Z')),
step('Add alert ears','Draw two tall triangular ears and smaller inner triangles.',line('M215 150L205 55L270 125 M330 125L395 55L385 150 M225 130L220 85L250 125 M350 125L380 85L375 130')),
step('Shape the pale muzzle','Curve from each outer cheek toward the nose. Place a small triangle nose low in the face.',line('M225 185Q275 190 300 250Q325 190 375 185 M290 245H310L300 258Z')),
step('Place almond eyes','Draw two small pointed oval eyes slanting slightly toward the center.',line('M245 175Q260 160 275 180Q260 190 245 175Z M325 180Q340 160 355 175Q340 190 325 180Z')),
step('Sketch the sitting body','Draw a curved body below the head and two long front legs.',line('M250 250Q195 310 230 365H370Q405 310 350 250 M275 285V365 M325 285V365')),
step('Curl a bushy tail','Curve a large tail around the right side. Add a zigzag tip boundary and a few short fur marks.',line('M370 365Q490 330 440 245Q425 325 350 335 M430 290L415 295L425 310L405 315 M240 200L250 205 M350 205L360 200'))]},
{id:'hills',title:'Rolling hills',age:4,category:'Landscapes',skill:'Long curves & placement',challenge:'Add a winding path and decide where it goes.',steps:[
step('Draw the first hill','Draw a long, gentle curve across your page.',line('M60 310Q200 160 370 310')),
step('Add a hill behind it','From near the top of the first hill, draw another hill toward the other side.',line('M270 240Q420 130 540 280')),
step('Put a sun in the sky','Draw a circle high above the hills.',round(390,100,35)),
step('Add a little tree','Draw a short trunk and a round treetop on the closer hill.',line('M180 255V205')+round(180,185,30))]},
{id:'beach',title:'Seaside afternoon',age:6,category:'Landscapes',skill:'Horizon & simple composition',challenge:'Add footprints that get smaller as they approach the water.',steps:[
step('Place the horizon','Draw a straight line across the upper half of the page.',line('M60 170H540')),
step('Curve the shore','Draw a curved line lower down for the edge of the water.',line('M60 250Q220 210 360 270Q450 300 540 260')),
step('Add a sun','Draw the upper part of a circle touching the horizon.',line('M350 170A45 45 0 0 1 440 170')),
step('Open a beach umbrella','Draw a wide curved canopy on the sand, then join its ends with a scalloped edge.',line('M125 280Q210 150 295 280Q275 260 255 280Q235 260 210 280Q190 260 170 280Q150 260 125 280Z M210 280V365')),
step('Suggest waves','Draw short curved marks in the water, keeping them mostly horizontal.',line('M80 190Q110 180 140 190 M290 195Q320 185 350 195 M380 235Q410 225 440 235'))]},
{id:'waterfall',title:'Forest waterfall',age:9,category:'Landscapes',skill:'Layering, movement & texture',challenge:'Draw the water again using fewer lines. Can you still show its movement?',steps:[
step('Outline the cliffs','Draw uneven cliff edges on both sides, leaving a gap for falling water.',line('M60 140L180 100L250 130L240 300 M360 300L350 130L430 100L540 150')),
step('Drop the waterfall','Draw two nearly vertical flowing lines from the gap to the pool below.',line('M260 130Q250 210 265 300 M340 130Q350 210 335 300')),
step('Make a pool','Add curved ripples below the waterfall. Leave small gaps between them.',line('M260 300Q200 320 270 335 M340 300Q400 320 330 335 M200 345Q300 385 410 340')),
step('Show the flow','Use a few broken vertical strokes inside the water. Leave plenty of white space.',line('M280 150L275 205 M300 175V250 M325 145L330 220 M280 240L285 290 M315 265V300')),
step('Layer the rock faces','Add angled cracks and ledges beside the falling water.',line('M100 160L180 145L215 185 M140 230L215 210 M390 175L470 155 M380 240L450 220L510 240')),
step('Add foreground rocks','Draw larger stones near the bottom. Shade the cliffs more than the water.',line('M105 365L130 320L180 325L205 365Z M410 375L430 330L490 320L520 375Z'))]},
{id:'kite',title:'Breezy kite',age:4,category:'Objects & transport',skill:'Diagonals & repeating bows',challenge:'Add a second kite with a different tail pattern.',steps:[
step('Draw a diamond','Draw a tall diamond shape with four straight sides.',line('M300 60L390 180L300 290L210 180Z')),
step('Cross the middle','Join the top to the bottom and the left corner to the right corner.',line('M300 60V290 M210 180H390')),
step('Add a dancing tail','Draw a curvy line from the bottom point.',line('M300 290Q220 320 300 350Q350 370 300 395')),
step('Tie on bows','Draw two little triangle bows along the tail.',line('M270 320L245 305V335Z M270 320L295 305V335Z M310 365L285 350V380Z M310 365L335 350V380Z'))]},
{id:'sailboat',title:'Sailing boat',age:6,category:'Objects & transport',skill:'Triangles & balanced composition',challenge:'Add a second boat farther away. Make it smaller and higher on the page.',steps:[
step('Make the hull','Draw a long top edge and a shallow boat shape below it.',line('M150 285H450L405 340H195Z')),
step('Raise the mast','Draw a straight mast from the boat up toward the top of the page.',line('M300 285V70')),
step('Draw the main sail','From near the top of the mast draw a sloping line to the left. Join it back to the mast.',line('M285 95L175 265H285Z')),
step('Add a smaller sail','Draw a smaller triangle on the other side of the mast.',line('M315 120L405 265H315Z')),
step('Add water and details','Draw a stripe on the hull and a few curved water marks beneath it.',line('M170 310H430 M110 360Q150 345 190 360 M240 375Q280 360 320 375 M370 360Q410 345 450 360'))]}
];
const categories={sun:'Nature',fish:'Animals',house:'Objects & transport',flower:'Nature',cat:'Animals',rocket:'Objects & transport',butterfly:'Animals',tree:'Nature',landscape:'Landscapes',cube:'Objects & transport',owl:'Animals',street:'Landscapes'};
catalog.forEach(l=>l.category=categories[l.id]);catalog.push(...moreLessons);
let category='All artwork';
let selected=null,current=0,age=null,progress={};
try{progress=JSON.parse(localStorage.getItem('little-artist-paper-progress')||'{}');if(!progress||typeof progress!=='object'||Array.isArray(progress))progress={};}catch{}
const difficulty=a=>a<6?'Explore · ages 4–5':a<9?'Build · ages 6–8':'Develop · ages 9–12';
const tier=a=>a<6?4:a<9?6:9;
let chosenTier=null;
function illustration(steps,active){return steps.map((s,i)=>`<g fill="none" stroke="${i===active?'#a43073':'#77778b'}" stroke-width="${i===active?4:2.8}" stroke-linecap="round" stroke-linejoin="round">${s.svg}</g>`).join('');}
const categoryIcons={'All artwork':'grid_view',Animals:'pets',Landscapes:'landscape',Fruits:'nutrition',Nature:'local_florist','Objects & transport':'rocket_launch'};
function renderCategories(eligible){const bar=el('category-filters');bar.replaceChildren();bar.hidden=!age;for(const name of ['All artwork','Animals','Landscapes','Fruits','Nature','Objects & transport']){const count=eligible.filter(l=>name==='All artwork'||l.category===name).length;const b=document.createElement('button');const icon=document.createElement('span');icon.className='mi';icon.setAttribute('aria-hidden','true');icon.textContent=categoryIcons[name];const label=document.createElement('span');label.textContent=name==='All artwork'?'All':name==='Objects & transport'?'Things':name;const badge=document.createElement('span');badge.className='category-count';badge.textContent=count;b.append(icon,label,badge);b.setAttribute('aria-label',`${name}, ${count} lessons`);b.setAttribute('aria-pressed',String(category===name));b.onclick=()=>{category=name;el('paper-lesson').hidden=true;el('lesson-catalog').hidden=false;renderCatalog();};bar.append(b);}}
function renderCatalog(){el('lesson-catalog').replaceChildren();if(!age){el('category-filters').hidden=true;el('difficulty-filters').hidden=true;return;}const recommended=tier(age);if(chosenTier===null)chosenTier=recommended;const eligible=catalog.filter(l=>l.age===chosenTier);const available=eligible.filter(l=>category==='All artwork'||l.category===category);renderCategories(eligible);const levels=el('difficulty-filters');levels.replaceChildren();levels.hidden=false;for(const level of [4,6,9].filter(n=>n<=recommended)){const b=document.createElement('button');b.textContent={4:'Explore',6:'Build',9:'Develop'}[level];b.setAttribute('aria-pressed',String(level===chosenTier));b.setAttribute('aria-label',`${{4:'Explore',6:'Build',9:'Develop'}[level]} drawing level${level===recommended?' · recommended for age '+age:''}`);b.onclick=()=>{chosenTier=level;try{localStorage.setItem('little-artist-level',String(level));}catch{}document.dispatchEvent(new CustomEvent('little-artist-level-change',{detail:{level,age}}));renderCatalog();};levels.append(b);}const categoryName=category==='All artwork'?'all categories':category.toLowerCase();el('age-help').textContent=`Age ${age} · ${difficulty(chosenTier).split(' · ')[0]}${chosenTier===recommended?' · suggested for you':''} · ${available.length} drawing choices in ${categoryName}.`;
for(const lesson of available){const card=document.createElement('article');card.className='lesson-card';const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 600 420');svg.setAttribute('aria-hidden','true');svg.innerHTML=illustration(lesson.steps,-1);const h=document.createElement('h3');h.textContent=lesson.title;const meta=document.createElement('span');meta.className='lesson-meta';meta.textContent=`${lesson.category} · ${difficulty(lesson.age).split(' · ')[0]} · ${lesson.steps.length} steps`;const description=document.createElement('p');description.textContent=lesson.skill;const b=document.createElement('button');b.innerHTML=`<span class="mi" aria-hidden="true">${progress[lesson.id]?.complete?'replay':'play_arrow'}</span><span>${progress[lesson.id]?.complete?'Again':'Draw'}</span>`;b.setAttribute('aria-label',`Draw ${lesson.title} on paper`);b.onclick=()=>openLesson(lesson);card.append(svg,meta,h,description);if(progress[lesson.id]?.complete){const done=document.createElement('span');done.className='completed-label';done.textContent='✓ Practiced on paper';card.append(done);}card.append(b);el('lesson-catalog').append(card);}}
function remember(complete=false){progress[selected.id]={step:current,complete:complete||!!progress[selected.id]?.complete};try{localStorage.setItem('little-artist-paper-progress',JSON.stringify(progress));el('learning-status').textContent=complete?'You finished this practice! Try drawing it once more without the guide.':'Your place is saved in this browser.';}catch{el('learning-status').textContent='Progress could not be saved. You can still follow every step.';}}
function openLesson(lesson){document.body.classList.add('lesson-open');selected=lesson;current=Math.max(0,Math.min(lesson.steps.length-1,Number(progress[lesson.id]?.step)||0));el('lesson-catalog').hidden=true;el('paper-lesson').hidden=false;el('lesson-name').textContent=lesson.title;el('lesson-level').textContent=difficulty(lesson.age);el('materials').textContent='Watch here. Draw on paper.';showStep();el('paper-lesson').scrollIntoView({block:'start',behavior:'instant'});}
function showStep(){const s=selected.steps[current];el('step-counter').textContent=`STEP ${current+1} OF ${selected.steps.length}`;el('step-title').textContent=s.title;el('step-instruction').textContent=s.instruction;el('step-picture').innerHTML=illustration(selected.steps.slice(0,current+1),current);el('step-picture').setAttribute('aria-label',`${selected.title}, step ${current+1}: ${s.instruction}`);el('previous-step').disabled=current===0;el('next-step').innerHTML=current===selected.steps.length-1?'<span class="mi" aria-hidden="true">check_circle</span> Done!':'Next <span class="mi" aria-hidden="true">arrow_forward</span>';el('next-step').setAttribute('aria-label',current===selected.steps.length-1?'I finished drawing on paper':'I drew this step; next step');const dots=el('step-dots');dots.replaceChildren();selected.steps.forEach((_,i)=>{const dot=document.createElement('span');dot.className='step-dot'+(i===current?' current':i<current?' done':'');dot.textContent=i<current?'✓':i+1;dot.setAttribute('aria-label',`Step ${i+1}${i===current?', current':''}`);if(i===current)dot.setAttribute('aria-current','step');dots.append(dot);});if('speechSynthesis' in window)window.speechSynthesis.cancel();el('practice-challenge').textContent=current===selected.steps.length-1?`Make it yours: ${selected.challenge}`:'';el('learning-status').textContent='';}
el('hear-step').onclick=()=>{if(!selected)return;if(!('speechSynthesis' in window)){el('learning-status').textContent='Voice is unavailable here. Ask a grown-up to read this step.';return;}window.speechSynthesis.cancel();const text=selected.steps[current];const speech=new SpeechSynthesisUtterance(`${text.title}. ${text.instruction}. Now try it on your paper.`);speech.lang='en-US';speech.rate=.85;speech.onerror=event=>{if(event.error==='canceled'||event.error==='interrupted')return;el('learning-status').textContent='Voice could not play. Ask a grown-up to read this step.';};window.speechSynthesis.speak(speech);};
el('next-step').onclick=()=>{if(current<selected.steps.length-1){current++;showStep();remember();}else remember(true);};el('previous-step').onclick=()=>{if(current>0){current--;showStep();remember();}};
el('back-lessons').onclick=()=>{document.body.classList.remove('lesson-open');if('speechSynthesis' in window)window.speechSynthesis.cancel();el('paper-lesson').hidden=true;el('lesson-catalog').hidden=false;renderCatalog();};
el('learner-age').onchange=e=>{document.body.classList.remove('lesson-open');age=Number(e.target.value)||null;chosenTier=age?tier(age):null;try{if(age){localStorage.setItem('little-artist-age',String(age));localStorage.setItem('little-artist-level',String(chosenTier));}else{localStorage.removeItem('little-artist-age');localStorage.removeItem('little-artist-level');}}catch{}document.dispatchEvent(new CustomEvent('little-artist-age-change',{detail:{age,level:chosenTier}}));document.body.classList.toggle('young-reader',age!==null&&age<6);document.body.classList.toggle('learning-started',age!==null);document.querySelectorAll('[data-age]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.age)===age)));category='All artwork';selected=null;el('paper-lesson').hidden=true;el('lesson-catalog').hidden=false;renderCatalog();if(!age)el('age-help').textContent='Tap your age, then pick a picture.';};
try{const savedAge=Number(localStorage.getItem('little-artist-age'));if(savedAge>=4&&savedAge<=12){el('learner-age').value=String(savedAge);el('learner-age').dispatchEvent(new Event('change'));}}catch{}
document.querySelectorAll('[data-age]').forEach(b=>b.onclick=()=>{el('learner-age').value=b.dataset.age;el('learner-age').dispatchEvent(new Event('change'));});
el('toggle-studio').onclick=()=>{const open=el('digital-studio').hidden;el('digital-studio').hidden=!open;el('toggle-studio').setAttribute('aria-expanded',String(open));el('toggle-studio').textContent=open?'Close studio':'Draw on screen';};
})();
