<template>
  <scroll class="content">
    <cart-list-item v-for="item in $store.state.cartList" :key="item.iid" :item-info="item"></cart-list-item>
  </scroll>
</template>

<script>
import Scroll from "components/common/scroll/Scroll";
import CartListItem from './CartListItem'

	export default {
		name: "CartList",
    components: {
		  Scroll,
      CartListItem
    },
    props: {
		  cartList: {
		    type: Array,
        default() {
		      return []
        }
      }
    }
	}
</script>

<style scoped>
  .content{
    height: calc(100% - 44px);
  }
</style>
