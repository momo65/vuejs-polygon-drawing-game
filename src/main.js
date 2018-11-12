import Vue from 'vue'
import App from './App.vue'
import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.min.css'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import underscore from 'vue-underscore';

Vue.use(underscore)
Vue.use(BootstrapVue)
Vue.use(VueMaterial)
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
/*checkUpdateIntersection:function(point1,point2,indexP1,indexP2){ //point1 & point2 the 2 extremities of the line
  console.log("checkIntersectionU:")
  //console.log("points:",this.$data.points)
//to check its intersection with the polygon
  let collisionX=0,collisionY=0
  for(let k=0;k<this.$data.points.length-1;k++){
    if(k!=indexP1){ //to avoid to test on the last drawn line
      let pt1=this.$data.points[k],pt2=this.$data.points[k+1]
      let x1=point1.x,y1=point1.y,x2=point2.x,y2=point2.y,x3=pt1.x,y3=pt1.y,x4=pt2.x,y4=pt2.y
      let s1X=x2-x1,s1Y=y2-y1,s2X=x4-x3,s2Y=y4-y3
      let s=(-s1Y*(x1-x3)+s1X*(y1-y3))/(-s2X*s1Y+s1X*s2Y)
      let t=(s2X*(y1-y3)-s2Y*(x1-x3))/(-s2X*s1Y+s1X*s2Y)
      if(s<=1 && s>=0 && t<=1 && t>=0){//collision detected
        collisionX=x1+(t*s1X)
        collisionY=y1+(t*s1Y)
        let collisionP={x:collisionX,y:collisionY}
        console.log("collisionP=",collisionP)
        if(!this.checkExtrimities(collisionP,pt1,pt2)){//the intersection happens inside the line not in extremities
          this.$data.elements[k].remove()
          console.log("updatePolygon 1")
          console.log("k=",k)
          this.updatePolygon(indexP2,k)
          return true
        }
      }else{ //the 2 lines are paralell
        if(this.isEquivalent(point1,pt2) && this.isEquivalent(point2,pt1)){//case where the new line is the inverse of
            //the previous line, it goes upon the previous line & is identical to it, we erase the new point
          this.$data.elements[k].remove()
          this.$data.points.splice(k+1,1)
          return false
        }else if(this.isEquivalent(point1,pt2)){
            //the new extrimity is going to be linked with the 2 extremities of the previous line
          this.$data.elements[k-2].remove()
          this.$data.elements[k].remove()
          console.log("updatePolygon 2")
          this.updatePolygon(indexP2,k-1) //put the new point after the k-1 point
          return true
        }
      }
    }
  }
  return false
},*/
