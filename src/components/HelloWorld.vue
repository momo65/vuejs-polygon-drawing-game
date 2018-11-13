<template>
  <div class="hello">
    <md-card>
      <div class="row">
        <div class="drawingBoard col-sm-8 col-md-8 col-xs-12">
          <svg id="svg" style="width:100%;height:100%;" v-on:click="drawLine"></svg>
        </div>
        <div class="md-layout md-gutter listDiv col-sm-2 col-md-2 col-xs-10">
          <div class="md-layout-item">
            <md-field>
              <label for="stroke">Color</label>
              <md-select v-model="stroke" name="strokeColor" id="stroke" md-dense>
                <md-option v-for="color in colors" :value="color">{{color}}</md-option>
              </md-select>
            </md-field>
          </div>
        </div>
      </div>
      <br><br>
      <md-button class="md-dense md-raised md-primary d-block" v-bind:disabled="!gameStarted"
        v-on:click="restartGame">Restart game</md-button>
    </md-card>
  </div>
</template>

<script>
import {_} from 'vue-underscore';
const math=require("mathjs")

export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },methods:{
    calculateCollision:function(p0,p1,p2,p3){
      let s1_x, s1_y, s2_x, s2_y
      s1_x = p1.x - p0.x
      s1_y = p1.y - p0.y
      s2_x = p3.x - p2.x
      s2_y = p3.y - p2.y
      let s, t
      s = (-s1_y * (p0.x - p2.x) + s1_x * (p0.y - p2.y)) / (-s2_x * s1_y + s1_x * s2_y)
      t = ( s2_x * (p0.y - p2.y) - s2_y * (p0.x - p2.x)) / (-s2_x * s1_y + s1_x * s2_y)
      let collisionP={x:null,y:null}
      if (s >= 0 && s <= 1 && t >= 0 && t <= 1){ // Collision detected
        collisionP.x = p0.x + (t * s1_x)
        collisionP.y = p0.y + (t * s1_y)
      }else{
        collisionP=null
      }
      return collisionP
    },
    distance:function(pt1,pt2){
      return math.distance([pt1.x,pt1.y],[pt2.x,pt2.y])
    },
    angleIsTPI:function(A,B,C){ //angle==2*PI
      if(((Math.abs(this.findAngle(A,B,C))>=(47/24)*Math.PI) && (Math.abs(this.findAngle(A,B,C))<=(49/24)*Math.PI))
        || (this.findAngle(A,B,C)>=((-Math.PI)/24) && (this.findAngle(A,B,C)<=((Math.PI)/24)))){
          //neglet a value of PI/24 to decrease some precision
        return true
      }else{
        return false
      }
    },
    angleIsPI:function(A,B,C){
      if((Math.abs(this.findAngle(A,B,C))>=Math.PI*(23/24)) && (Math.abs(this.findAngle(A,B,C))<=Math.PI*(25/24))){
        //neglet a value of PI/24 to decrease some precision
        return true
      }else{
        return false
      }
    },
    findAngle:function(p0,p1,p2) {//p1 is the center of the angle
      let a = Math.pow(p1.x-p0.x,2) + Math.pow(p1.y-p0.y,2),
          b = Math.pow(p1.x-p2.x,2) + Math.pow(p1.y-p2.y,2),
          c = Math.pow(p2.x-p0.x,2) + Math.pow(p2.y-p0.y,2)
      return Math.acos( (a+b-c) / Math.sqrt(4*a*b) )
    },
    updatePolygon:function(indexP2,k){
      this.$data.points.splice(k+1,0,this.$data.points[indexP2])
      this.$data.points.splice(indexP2+1,1) //to delete the point that was in indexP2
      this.drawLine2(k)//draws the line between the k & k+1 points
      //each line by itself to check each intersection of these lines with polygon
      setTimeout(()=>{
        this.drawLine2(k+1)
        },10)
    },
    checkExtremities:function(collisionP,pt1,pt2){
      if(this.isEquivalent(collisionP,pt1) || this.isEquivalent(collisionP,pt2)){
        return true
      }else{
        return false
      }
    },
    checkIntersection:function(point1,point2,indexP1,indexP2){ //point1 & point2 the 2 extremities of the line
        //to check its intersection with the polygon
      let updateMode=this.$data.updateMode
      if(this.$data.index>=3){
        let intersections=[],distances=[]
        let noInters=[] //array for the segments, that doesn't intersect with the new line
        for(let k=0;k<this.$data.points.length-1;k++){
          if(k!=indexP1){ //to avoid to test on the last drawn line
            let pt1=this.$data.points[k],
            pt2=this.$data.points[k+1]
            let collisionP=this.calculateCollision(point1,point2,pt1,pt2)
            if(collisionP!=null){//collision detected
              if(!this.checkExtremities(collisionP,pt1,pt2)){
                  //the intersection happens inside the line not in extremities
                intersections.push(k)
                distances.push(math.distance([point2.x,point2.y],[collisionP.x,collisionP.y]))
                //calculate distance between the new point & the intersected line
              }
            }else{
              noInters.push(k)
            }
          }
        }
        if(intersections.length!=0){
          let z=0
          let dis=distances[0],disIndex=0
          while(z<distances.length){
            z++
            if(distances[z]<=dis){
              if(intersections[z]>=this.$data.elements.length){
                this.intersections.splice(z,1)
                this.distances.splice(z,1)
              }else{
                dis=distances[z]
                disIndex=z
              }
            }
          }
          if(!updateMode){
            this.$data.elements[intersections[disIndex]].remove() //intersections[disIndex] contains the index of the
              //first point in the nearest line to the new point
            this.$data.elements.splice(intersections[disIndex],1) //splice because .remove doesn't get rid of the element
          }
          this.updatePolygon(indexP2,intersections[disIndex])
          return true
        }else{ // there are no intersections with the new line
          let p1,p2
          for(let j=0;j<noInters.length;j++){
            p1=this.$data.points[noInters[j]]
            p2=this.$data.points[noInters[j]+1]
            if(this.angleIsTPI(p1,p2,point2) || this.angleIsPI(p1,p2,point2)){ //the 2 lines are paralell
              if((this.isEquivalent(point1,p2) && this.isEquivalent(point2,p1)) ||
                (this.isEquivalent(point1,p1) && this.isEquivalent(point2,p2))){//case where the new line is the inverse of
                  //the previous line, it goes upon the previous line & is identical to it, we erase the new point
                if(!updateMode){
                  this.$data.elements[noInters[j]].remove()
                  this.$data.elements.splice(noInters[j],1)
                }
                this.$data.points.splice(noInters[j]+1,1)
                this.$data.index-- //because we got rid of one point
                return false
              }else if(this.isEquivalent(point1,p2)){
                if(this.angleIsTPI(p1,p2,point2)){
                  if(this.distance(p2,point2)<this.distance(p2,p1)){
                    this.$data.points.splice(indexP2,1)
                    if(!updateMode){
                      this.$data.elements[indexP2-1].remove()
                      this.$data.elements.splice(indexP2-1,1)
                    }
                    this.$data.index-- //we got rid of indexP2 point, we decrement index
                    return false
                  }else{
                      //the new extremity is going to be linked with the 2 extremities of the previous line
                    if(!updateMode){
                      this.$data.elements[noInters[j]-2].remove()
                      this.$data.elements.splice(noInters[j]-2,1)
                      this.$data.elements[noInters[j]].remove()
                      this.$data.elements.splice(noInters[j],1)
                    }
                    this.updatePolygon(indexP2,noInters[j]-1) //put the new point after the noInters[j]-1 point
                    return true
                  }
                }else if(this.angleIsPI(p1,p2,point2)){//the new point's a continuity of the previous
                    //line so we don't need to adjust the polygon
                  return false
                }
              }
            }
          }
        }
        return false
      }
    },
    restartGame:function(){//it clears the drawing board & restarts the game
      this.$data.points=[]
      this.$data.elements=[]
      this.$data.gameOver=false
      this.$data.gameStarted=false
      this.$data.index=0;
      this.$data.strokeW="1"
      this.$data.updateMode=false
      this.$data.s.clear()
    },
    drawLine:function(event){//it calculates everything to draw the next line & make the necessary verifications
      if(this.$data.index==0){
        this.$data.gameStarted=true
      }
      if(!this.$data.gameOver){
        let point={x:event.offsetX,y:event.offsetY}
        this.$data.points.push(point)
        if(this.$data.index>0){
          let index=this.$data.index
          this.$data.updateMode=false //(we don't edit polygon)to indicate to checkIntersection() to act differently
          if(!this.checkIntersection(this.$data.points[index-1],point,index-1,index)){
            //if there's no intersection with polygon we draw simple line
            if(this.$data.points[index]!=null || this.$data.points[index]!=undefined
              || this.$data.points[index]!={}){
              this.$data.elements[index-1]=this.$data.s.line(this.$data.points[index-1].x,this.$data.points[index-1].y,
                point.x,point.y).attr({stroke:this.$data.stroke,
                strokeWidth:"1"})
            }else{//in case we splice the last point we have to decrement index
              this.$data.index--
            }
          }
        }//check the following still correct or not
        this.$data.index++;
        if(this.$data.index>=3){ //ending of the game possible from index>=3
          if(this.checkRadius(this.$data.points[0],this.$data.points[this.$data.points.length-1])){
            this.$data.gameOver=true
          }
        }
      }
    },
    drawLine2:function(index){//it draws an adjustment line & make the necessary verifications for intersections
      this.$data.updateMode=true //we put it to true so the below function doesn't delete any non yet drawn lines
      if(!this.checkIntersection(this.$data.points[index],this.$data.points[index+1],index,index+1)){
        if(this.$data.points[index+1]!=null && this.$data.points[index+1]!=undefined
          && this.$data.points[index+1]!={}){
            //if there's no intersection with polygon & the last point wasn't removed we draw simple line
          this.$data.elements.splice(index,0,this.$data.s.line(this.$data.points[index].x,this.$data.points[index].y,
            this.$data.points[index+1].x,this.$data.points[index+1].y).attr({stroke:this.$data.stroke,
            strokeWidth:"1"})) //.splice to insert the new line element in its correct position
        }
      }
    },
    checkRadius:function(firstP,lastP){
        //it checks if the last point is near enough to the first point to decide if we close the polygon or not
      if(Math.abs(firstP.x-lastP.x)<=9 && Math.abs(firstP.y-lastP.y)<=9){
          //9 is the max radius of the circle that might contain the closing point
          //the possible equations that i thought about that might calculate the fitting strokeWidth.
        this.$data.strokeW=""+(2*(Math.abs(firstP.x-lastP.x)+Math.abs(firstP.y-lastP.y)))
        this.adjustPolygon()
        return true
      }else{
        return false
      }
    },
    adjustPolygon:function(){ //it redraws the pentagon another time with the calculated strokeWidth
      for(let k=1;k<this.$data.points.length;k++){
      this.$data.s.line(this.$data.points[k-1].x,this.$data.points[k-1].y,
        this.$data.points[k].x,this.$data.points[k].y).attr({stroke:this.$data.stroke,
        strokeWidth:this.$data.strokeW})
      }
    },
    isEquivalent:function(a, b) {
      if(this.$_.isEqual(a,b)){
        return true
      }else{
        return false
      }
    }
  },
  data(){
    return{
      s:null,  //the snap variable
      points:[],
      elements:[], //array of the lines elements
      index:0,//index pointing on the last point.
      gameOver:false,
      strokeW:"1",
      stroke:"black",
      gameStarted:false,
      updateMode:false, //to put on the update polygon's mode or not
      colors:['Black','Green','Red','Blue','Brown','Violet','Orange','Yellow',  //possible colors to draw with
        'Aqua','Aquamarine','Crimson','Cyan','DarkBlue','DarkCyan','DarkGoldenRod',
        'FireBrick','FloralWhite','ForestGreen','Fuchsia','Gainsboro','Khaki','Lavender','LavenderBlush','LawnGreen','LemonChi',
        'MediumSeaGreen','MediumSlateBlue','MediumSpringGreen','MediumTurquoise','MediumVioletRed','PaleGreen','PaleTurquoise',
        'PaleVioletRed','PapayaWhip','PeachPu','Peru']
    }
  },
  mounted(){  //require Snap & create the snap variable after the component mounted
    const Snap = require(`imports-loader?this=>window,fix=>module.exports=0!snapsvg/dist/snap.svg.js`)
    this.$data.s=Snap("#svg")
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.md-card{
  width:860px;
  height:550px;
  margin-left:60px;
  margin-top:8px;
  bottom:20px;
}
svg{
  background-color: #F9F9F9;
}
.drawingBoard{
  position:relative;
  width:570px;
  height:386px;
  margin-left:16px;
  margin-top:8px;
  top:24px;
}
.listDiv{
  width:66px !important;
  margin-left:10px;
  margin-top:22px;
}
.md-button{
  position:relative;
  float:left;
  margin-left:16px;
  margin-top:20px;
  background-color:rgb(68,138,255);
  color:white;
}
</style>
