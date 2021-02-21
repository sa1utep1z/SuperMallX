<template>
  <div id="detail">
    <detail-nav-bar class="detail-nav" @titleClick='titleClick' ref='nav'/>
    <scroll class="content" ref="scroll" :probe-type='3' @scroll='contentScroll'>
      <ul>
        <li v-for="item in $store.state.cartList">{{item}}</li>
      </ul>
      <detail-swiper v-if="topImages!=''" :top-images="topImages"/>
      <detail-base-info :goods="goods"/>
      <detail-shop-info :shop="shop"/>
      <detail-goods-info :detail-info="detailInfo" @imageLoad="imageLoad"/>
      <detail-param-info ref='params' :param-info="paramInfo"/>
      <detail-comment-info ref='comment' :comment-info="commentInfo"/>
      <goods-list ref='recommend' :goods="recommends"/>
    </scroll>
    <detail-bottom-bar @addToCart="addToCart"/>
    <back-top @click.native="backClick" v-show="isShowBackTopc"/>
    <toast message="message" :show="show"/>
  </div>
</template>

<script>
import DetailNavBar from "./childComps/DetailNavBar";
import DetailSwiper from "./childComps/DetailSwiper";
import DetailBaseInfo from "./childComps/DetailBaseInfo";
import DetailShopInfo from "./childComps/DetailShopInfo";
import DetailGoodsInfo from "./childComps/DetailGoodsInfo";
import DetailParamInfo from "./childComps/DetailParamInfo";
import DetailCommentInfo from "./childComps/DetailCommentInfo";
import DetailBottomBar from "./childComps/DetailBottomBar"

import Scroll from "components/common/scroll/Scroll";
import GoodsList from 'components/content/goods/GoodsList';
import BackTop from 'components/content/backTop/BackTop'

import { mapActions } from 'vuex'

import Toast from 'components/common/toast/Toast'

import {
  getDetail,
  Goods,
  Shop,
  GoodsParam,
  getRecommend
} from "network/detail";


export default {
  name: "Detail",
  components: {
    DetailNavBar,
    DetailSwiper,
    DetailBaseInfo,
    Shop,
    DetailShopInfo,
    Scroll,
    DetailGoodsInfo,
    DetailParamInfo,
    DetailCommentInfo,
    GoodsList,
    DetailBottomBar,
    BackTop,
    Toast
  },
  data() {
    return {
      iid: null,
      topImages: [],
      goods: {},
      shop: {},
      detailInfo: {},
      paramInfo: {},
      commentInfo: {},
      recommends: [],
      themeTopsY:[],
      getThemeTopY:null,
      currentIndex:0,
      isShowBackTopc:false,
      message:'',
      show:false
    };
  },
  created() {
    // 1.保存传入的iid
    this.iid = this.$route.params.id;

    // 2.根据iid请求详情数据
    getDetail(this.iid).then(res => {
      // 1.获取顶部图片轮播数据
      // console.log(this.topImages);
      const data = res.result;
      this.topImages = data.itemInfo.topImages;

      // 2.获取商品信息
      this.goods = new Goods(
        data.itemInfo,
        data.columns,
        data.shopInfo.services
      );

      // 3.创建店铺信息对象
      this.shop = new Shop(data.shopInfo);

      // 4.保存商品的详情数据
      this.detailInfo = data.detailInfo;

      // 5.获取参数的信息
      this.paramInfo = new GoodsParam(
        data.itemParams.info,
        data.itemParams.rule
      );

      // 6.取出评论信息
      if (data.rate.cRate !== 0) {
        this.commentInfo = data.rate.list[0];
      }

      // this.$nextTick(()=>{
      //   //根据最新的数据，对应的DOM是已经被渲染出来的，但是图片依然是没有加载完。（目前获取到的OffsetTop是不保存图片在内的）
      //   this.themeTopsY.push(0);
      //   this.themeTopsY.push(this.$refs.params.$el.offsetTop)
      //   this.themeTopsY.push(this.$refs.comment.$el.offsetTop)
      //   this.themeTopsY.push(this.$refs.recommend.$el.offsetTop)
      //   console.log(this.themeTopsY);
      // })
    });

    // 3.请求推荐数据
    getRecommend().then(res => {
      this.recommends = res.data.list
    });
  },
  mounted(){

  },
  updated(){
    // this.themeTopsY = []
    // this.themeTopsY.push(0);
    // this.themeTopsY.push(this.$refs.params.$el.offsetTop)
    // this.themeTopsY.push(this.$refs.comment.$el.offsetTop)
    // this.themeTopsY.push(this.$refs.recommend.$el.offsetTop)
    // console.log(this.themeTopsY);
  },
  methods: {
    ...mapActions(['addCart']),
    imageLoad() {
      this.$refs.scroll.refresh();
    },
    titleClick(index){
      // console.log(index);
      this.$refs.scroll.scrollTo(0, -this.themeTopsY[index], 100),
        this.themeTopsY = []
        this.themeTopsY.push(0);
        this.themeTopsY.push(this.$refs.params.$el.offsetTop)
        this.themeTopsY.push(this.$refs.comment.$el.offsetTop)
        this.themeTopsY.push(this.$refs.recommend.$el.offsetTop)
    },
    contentScroll(position){
      // 1.获取y值
      const positionY = -position.y

      // 2.判断backtop是否显示
      this.isShowBackTopc = (-position.y) > 1000

      // 3.positionY和主题中值进行对比
       let length = this.themeTopsY.length
      //  console.log(length)
      for(let i =0 ;i < this.themeTopsY.length ; i++){
       
        // if(positionY > this.themeTopsY[i] && positionY < this.themeTopsY[i+1]){
          if(this.currentIndex !== i && (i < length - 1 && positionY >= this.themeTopsY[i] && positionY < this.themeTopsY[i+1])||(i === length - 1 && positionY >= this.themeTopsY[i] )){
            this.currentIndex = i;
            console.log(this.currentIndex);
            this.$refs.nav.currentIndex = this.currentIndex
          }
      }
        
    },
    addToCart(){
      // 1.获取购物车需要展示的信息
      const product = {}
      // console.log(this.goods)
      product.image = this.topImages[0];
      product.title = this.goods.title;
      product.desc = this.goods.desc;
      product.price = this.goods.realPrice;
      product.iid = this.iid;


      // 2.将商品添加到购物车里面
      // this.$store.cartList.push(product)
      // this.$store.commit('addCart',product)
      this.addCart(product).then(res => {
        // this.show = true;
        // this.message = res;
        // setTimeout(()=>{
        //   this.show = false;
        //   this.message = ''
        // },1500)
        this.$toast.show(res,2000)

      })
      // this.$store.dispatch('addCart',product).then(res =>{
      //   console.log(res)
      // })
    }
  }
};
</script>

<style scoped>
#detail {
  position: relative;
  z-index: 9;
  background-color: #fff;
  height: 100vh;
}
.detail-nav {
  position: relative;
  z-index: 9;
  background-color: #fff;
}
.content {
  height: calc(100% - 44px - 49px);
}
</style>
