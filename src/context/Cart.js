import { useContext, useState, createContext, useEffect } from "react";
import Cookies from "js-cookie";

const CartContext = createContext();

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
    
    useEffect(() => {
      let existingCartItem = Cookies.get("cart");    
      if (existingCartItem) {
        setCart(JSON.parse(existingCartItem));
      };
    },[])
  

  return (
    <CartContext.Provider value={[cart, setCart]}>
      {children}
    </CartContext.Provider>
  );
};

const  useCart = () => useContext(CartContext);

export { useCart, CartProvider };
