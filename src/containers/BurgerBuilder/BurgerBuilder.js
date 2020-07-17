import React, {Component, useImperativeHandle} from 'react';
import Auxiliary from '../../hoc/Auxiliary/Auxiliary';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import axios from '../../axios-orders';
import Spinner from '../../components/UI/Spinner/Spinner';

const   INGREDIENTS_PRICES ={
  salad:0.5,
  cheese:0.4,
  meat:1.3,
  bacon:0.7
}
class BurgerBuilder extends Component {
  state ={
    ingredients:{
      salad: 0,
      bacon: 0,
      cheese:0,
      meat:0
    },
    totalPrice: 4,
    purchasable: false,
    purchasing : false,
    loading: false
  }

  updatePurchaseState (ingrediens) {
    
    const sum = Object.keys(ingrediens)
    .map(igKey => {
       return ingrediens[igKey];
       })
       .reduce((sum,el) =>{
         return sum+el;
       },0);
       this.setState({purchasable: sum >0});
  }
addIngredientHandler = (type) => {
  const oldCount = this.state.ingredients[type];
  const updatedCount = oldCount + 1;
  const updatedIngredients = {
    ...this.state.ingredients
  };
  updatedIngredients[type] = updatedCount;
  const priceAddition = INGREDIENTS_PRICES[type];
  const oldPrice = this.state.totalPrice;
  const newPrice = oldPrice + priceAddition;
  this.setState({totalPrice:newPrice, ingredients: updatedIngredients}); 
  this.updatePurchaseState(updatedIngredients);
}

removeIngredientHandler = (type) => {
  const oldCount = this.state.ingredients[type];
  if (oldCount<= 0) {
    return;
  }
  const updatedCount = oldCount - 1;
  const updatedIngredients = {
    ...this.state.ingredients
  };
  updatedIngredients[type] = updatedCount;
  const priceDeduction = INGREDIENTS_PRICES[type];
  const oldPrice = this.state.totalPrice;
  const newPrice = oldPrice - priceDeduction;
  this.setState({totalPrice:newPrice, ingredients: updatedIngredients});  
  this.updatePurchaseState(updatedIngredients);

}

purchaseHandler = () => {
  this.setState({purchasing: true})
}

purchaseCancelHandler = () => {
 this.setState({purchasing: false});
}

purchaseContinueHandler = () => {
  //alert('You continue!');
  this.setState({loading:true})
  const order = {
      ingredients: this.state.ingredients,
      price: this.state.totalPrice,
      customer: {
        name:'Max',
        address: {
          street: 'Teststreet 1',
          zipCode: '41351',
          country: 'Germany'
        },
        email: 'test@test.com'
      },
      deleveryMethod: 'fastest'
  } 
  axios.post('/orders.json', order)
  .then(response => {
    this.setState({loading:false, purchasing:false})
  })
  .catch(error => {
    this.setState({loading:false, purchasing:false})
  });
}
  render() {
      const disabledInfo = {
        ...this.state.ingredients
      };
      for (let key in disabledInfo) {
        disabledInfo[key] = disabledInfo[key] <=0
      }
      let orderSummary = <OrderSummary 
            ingredients = {this.state.ingredients}
            price={this.state.totalPrice}
            purchaseCancelled= {this.purchaseCancelHandler}
            purchaseCountinued= {this.purchaseContinueHandler}/>
      if (this.state.loading) {
        orderSummary = <Spinner/>;
      }
        return (
             <Auxiliary>
               <Modal show = {this.state.purchasing} modalClosed= {this.purchaseCancelHandler}>
                {orderSummary}  
               </Modal>
               <Burger ingredients = {this.state.ingredients}/>
               <BuildControls
               ingredientAdded= {this.addIngredientHandler}
               ingredientRemoved = {this.removeIngredientHandler}
               disabled= {disabledInfo}
               purchasable={this.state.purchasable}
               ordered = {this.purchaseHandler}
               price = {this.state.totalPrice}/>
             </Auxiliary>
        );
    }
}

export default BurgerBuilder;
