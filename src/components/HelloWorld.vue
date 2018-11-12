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

export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },methods:{
    distance:function(pt1,pt2){
      let a=pt1.x-pt2.x
      let b=pt1.y-pt2.y
      return (Math.sqrt(a*a+b*b))
    },
    findAngle:function(A,B,C){
      let AB = Math.sqrt(Math.pow(B.x-A.x,2)+ Math.pow(B.y-A.y,2));
      let BC = Math.sqrt(Math.pow(B.x-C.x,2)+ Math.pow(B.y-C.y,2));
      let AC = Math.sqrt(Math.pow(C.x-A.x,2)+ Math.pow(C.y-A.y,2));
      return Math.acos((BC*BC+AB*AB-AC*AC)/(2*BC*AB));
    },
    displayPs:function(){
      for(let i=0;i<this.$data.points.length;i++){
        console.log("point "+i+":",this.$data.points[i])
      }
    },
    updatePolygon:function(indexP2,k){
      this.$data.points.splice(k+1,0,this.$data.points[indexP2])
      this.$data.points.splice(indexP2+1,1) //to delete the point that was in indexP2
      this.drawLine2(k) //each line by itself to check each intersection of these lines with polygon
      setTimeout(()=>
        this.drawLine2(k+1)
        },48)
    },
    checkExtrimities:function(collisionP,pt1,pt2){
      if(this.isEquivalent(collisionP,pt1) || this.isEquivalent(collisionP,pt2)){
        return true
      }else{
        return false
      }
    },
    checkIntersection:function(point1,point2,indexP1,indexP2){ //point1 & point2 the 2 extremities of the line
        //to check its intersection with the polygon
      let collisionX=0,collisionY=0
      if(this.$data.index>=3){
        for(let k=0;k<this.$data.points.length-1;k++){
          if(k!=indexP1){ //to avoid to test on the last drawn line
            let pt1=this.$data.points[k],pt2=this.$data.points[k+1]
            console.log(point1,point2,pt1,pt2)
            let x1=point1.x,y1=point1.y,x2=point2.x,y2=point2.y,x3=pt1.x,y3=pt1.y,x4=pt2.x,y4=pt2.y
            let s1X=x2-x1,s1Y=y2-y1,s2X=x4-x3,s2Y=y4-y3
            let s=(-s1Y*(x1-x3)+s1X*(y1-y3))/(-s2X*s1Y+s1X*s2Y)
            let t=(s2X*(y1-y3)-s2Y*(x1-x3))/(-s2X*s1Y+s1X*s2Y)
            if(s<=1 && s>=0 && t<=1 && t>=0){//collision detected
              collisionX=x1+(t*s1X)
              collisionY=y1+(t*s1Y)
              let collisionP={x:collisionX,y:collisionY}
              if(!this.checkExtrimities(collisionP,pt1,pt2)){//the intersection happens inside the line not in extremities
                console.log("k:",k)
                this.$data.elements[k].remove()
                setTimeout(()=>{
                this.updatePolygon(indexP2,k)
                return true
                },3000)
              }
            }else{ //the 2 lines are paralell
              if(this.isEquivalent(point1,pt2) && this.isEquivalent(point2,pt1)){//case where the new line is the inverse of
                  //the previous line, it goes upon the previous line & is identical to it, we erase the new point
                this.$data.elements[k].remove()
                this.$data.points.splice(k+1,1)
                return false
              }else if(this.isEquivalent(point1,pt2)){
                if(this.findAngle(pt2,point2,pt1)==0 || Math.abs(this.findAngle(pt2,point2,pt1))==2*Math.PI){
                  if(this.distance(pt2,point2)<this.distance(pt2,pt1)){
                    this.$data.points.splice(indexP2,1)
                    this.$data.elements[indexP2-1].remove()
                    return false
                  }else{
                      //the new extremity is going to be linked with the 2 extremities of the previous line
                    this.$data.elements[k-2].remove()
                    this.$data.elements[k].remove()
                    setTimeout(()=>{
                    this.updatePolygon(indexP2,k-1) //put the new point after the k-1 point
                    return true
                    },2600)
                  }
                }else if(Math.abs(this.findAngle(pt2,point2,pt1))==Math.PI){//the new point's a continuity of the previous
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
      this.$data.elements=null
      this.$data.gameOver=false
      this.$data.gameStarted=false
      this.$data.index=0;
      this.$data.strokeW="1"
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
          console.log("index:",index)
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
      if(!this.checkIntersection(this.$data.points[index],this.$data.points[index+1],index,index+1)){
        if(this.$data.points[index+1]!=null || this.$data.points[index+1]!=undefined
          || this.$data.points[index+1]!={}){
            //if there's no intersection with polygon & the last point wasn't removed we draw simple line
          this.$data.elements.splice(index,0,this.$data.s.line(this.$data.points[index].x,this.$data.points[index].y,
            this.$data.points[index+1].x,this.$data.points[index+1].y).attr({stroke:this.$data.stroke,
            strokeWidth:"1"})) //.splice to insert the new line element in its correct position
        }
      }
    },
    checkRadius:function(firstP,lastP){
        //it checks if the last point is near enough to the first point to decide if we close the pentagon or not
      if(Math.abs(firstP.x-lastP.x)<=9 && Math.abs(firstP.y-lastP.y)<=9){
          //9 is the max radius of the circle that might contain the closing point
          //the possible equations that i thought about that might calculate the fitting strokeWidth.
        this.$data.strokeW=""+(2*(Math.abs(firstP.x-lastP.x)+Math.abs(firstP.y-lastP.y)))
          /*if(Math.abs(firstP.x-lastP.x)>= Math.abs(firstP.y-lastP.y)){
            this.$data.strokeW=""+(2*Math.abs(firstP.x-lastP.x))
          }else{
            this.$data.strokeW=""+(2*Math.abs(firstP.y-lastP.y))
          }*/
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
      colors:['Black','Green','Red','Blue','Brown','Violet','Orange','Yellow',  //possible colors to draw with
        'Aqua','Aquamarine','Azure','Crimson','Cyan','DarkBlue','DarkCyan','DarkGoldenRod',
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
