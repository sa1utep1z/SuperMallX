export default{
  // mutation唯一的目的就是修改state中的状态，mutations中的每个方法尽可能完成的事件比较单一
  addCounter(state,payload){
    payload.count++
  },
  addToCart(state, payload){
    state.cartList.push(payload)
    payload.checked = true
  }
}