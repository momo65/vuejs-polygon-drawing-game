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
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },methods:{
    restartGame:function(){//it clears the drawing board & restarts the game
      this.$data.points=[]
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
          this.$data.s.line(this.$data.points[this.$data.index-1].x,this.$data.points[this.$data.index-1].y,
            this.$data.points[this.$data.index].x,this.$data.points[this.$data.index].y).attr({stroke:this.$data.stroke,
            strokeWidth:"1"})
        }
        this.$data.index++;
        if(this.$data.index>=3){ //ending of the game possible from index>=3
          if(this.checkRadius(this.$data.points[0],this.$data.points[this.$data.points.length-1])){
            this.$data.gameOver=true
          }
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

        this.adjustPentagon()
        return true
      }else{
        return false
      }
    },
    adjustPentagon:function(){ //it redraws the pentagon another time with the calculated strokeWidth
      for(let k=1;k<this.$data.points.length;k++){
      this.$data.s.line(this.$data.points[k-1].x,this.$data.points[k-1].y,
        this.$data.points[k].x,this.$data.points[k].y).attr({stroke:this.$data.stroke,
        strokeWidth:this.$data.strokeW})
      }
    }
  },
  data(){
    return{
      s:null,  //the snap variable
      points:[],
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
