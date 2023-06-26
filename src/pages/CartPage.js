import React, { useEffect, useState } from "react";
import Layout from "../components/Layout/Layout";
import { useCart } from "../context/Cart";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/Auth";
import "../styles/CartStyles.css";
import axios from "axios";
// import { instance } from "../../../server";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

const CartPage = () => {
  const [auth, setAuth] = useAuth();
  const [cart, setCart] = useCart();
  const [loading, setLoading] = useState(false);
  // const [id, setId] = useState([]);
  const navigate = useNavigate();

  //total price
  const totalPrice = () => {
    try {
      let total = 0;
      cart?.map((item) => {
        total = total + item.price;
      });
      return total.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
      });
    } catch (error) {
      console.log(error);
    }
  };

  //delete item from cart
  const removeCartItem = (pid) => {
    try {
      let myCart = [...cart];
      let index = myCart.findIndex((item) => item._id === pid);
      myCart.splice(index, 1);
      setCart(myCart);
      Cookies.set("cart", JSON.stringify(myCart));
    } catch (error) {
      console.log(error);
    }
  };

  const checkoutHandler = async () => {
    try {
      setLoading(true);
      let total = 0;
      cart?.map((i) => {
        total = total + i.price;
      });

      const {
        data: { key },
      } = await axios.get(`${process.env.REACT_APP_API}/api/v1/product/getKey`);
      const {
        data: { order },
      } = await axios.post(
        `${process.env.REACT_APP_API}/api/v1/product/checkout`,
        {
          total,
        }
      );
      if (order) {
        const options = {
          key,
          amount: Number(order.amount), // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
          currency: "INR",
          name: auth?.user?.name,
          description: "Test Transaction",
          image: "http://example.com/your_logo",
          order_id: order.id,
          callback_url: `${process.env.REACT_APP_API}/api/v1/product/verification`,
          prefill: {
            name: auth?.user?.name,
            email: auth?.user?.email,
            contact: auth?.user?.phone,
          },
          notes: {
            address: "Razorpay Corporate Office",
          },
          theme: {
            color: "#3399cc",
          },
        };
        const razor = await new window.Razorpay(options);
        razor.on("payment.failed", function (response) {
          toast.error("payment failed");
        });
        razor.open();
        setLoading(false);
        setCart([]);
        toast.success("Payment Completed Successfully ");
      } else {
        toast.error("Something went wrong");
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <Layout title={"Cart - Laventa"}>
      <div className="cart-page">
        <div className="row">
          <div className="col-md-12">
            <h1 className="text-center bg-light p-2 mb-1">
              {!auth?.user
                ? "Hello Guest"
                : `Hello ${auth?.token && auth?.user?.name}`}

              <p className="text-center">
                {cart?.length
                  ? `You Have ${cart.length} items in your cart ${
                      auth?.token ? "" : "please login to checkout !"
                    }`
                  : " Your Cart Is Empty"}
              </p>
            </h1>
          </div>
        </div>
        <div className="container">
          <div className="row">
            <div className="col-md-7 p-0 m-0">
              {cart?.map((p) => (
                <div className="row card flex-row" key={p._id}>
                  <div className="col-md-4">
                    <img
                      src={`${process.env.REACT_APP_API}/api/v1/product/get-photo/${p._id}`}
                      className="card-img-top"
                      alt={p.name}
                      height={"130px"}
                      width={"100%"}
                    />
                  </div>
                  <div className="col-md-4">
                    <p>{p.name}</p>
                    <p>{p.description.substring(0, 30)}</p>
                    <p>Price:₹{p.price}</p>
                  </div>
                  <div className="col-md-4 cart-remove-btn">
                    <button
                      className="btn btn-danger"
                      onClick={() => removeCartItem(p._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="col-md-5 cart-summary">
              <h2>Cart Summary</h2>
              <p>Total | Checkout | Payment</p>
              <hr />
              <h4>Total: {totalPrice()}</h4>
              {auth?.user?.address ? (
                <>
                  <div className="mb-3">
                    <h4>Current Address:</h4>
                    <h5>{auth?.user?.address}</h5>
                    <button
                      className="btn btn-outline-warning"
                      onClick={() => navigate("/dashboard/user/profile")}
                    >
                      Update Address
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-3">
                    {auth?.token ? (
                      <button
                        className="btn btn-outline-waring"
                        onClick={() => navigate("/dashboard/user/profile")}
                      >
                        Update Address
                      </button>
                    ) : (
                      <button
                        className="btn btn-outline-waring"
                        onClick={() =>
                          navigate("/login", {
                            state: "/cart",
                          })
                        }
                      >
                        Please login to checkout!
                      </button>
                    )}
                  </div>
                </>
              )}
              <div className="mt-2">
                {!cart?.length ? (
                  ""
                ) : (
                  <>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        checkoutHandler();
                      }}
                      disabled={loading || !auth?.user?.address}
                    >
                      {loading ? "Processing ...." : "Make Payment"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;
