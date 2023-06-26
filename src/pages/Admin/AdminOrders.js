import React, { useEffect, useState } from 'react'
import AdminMenu from '../../components/Layout/AdminMenu'
import Layout from "../../components/Layout/Layout";
import { useAuth } from "../../context/Auth";
import moment from "moment";
import axios from "axios";
import { Select } from 'antd';

const { Option } = Select;

const AdminOrders = () => {
    const [status, setStatus] = useState([
      "Not Process",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancel",
    ]);
    const [changeStatus, setChangeStatus] = useState("");
    const [orders, setOrders] = useState([]);
    const [auth, setAuth] = useAuth();

    const handleChange = async (orderId, value) => {
        try {
            const { data } = await axios.put(
                `${process.env.REACT_APP_API}/api/v1/auth/order-status/${orderId}`, {
                  status:value
              }
            );
            getOrders();
        } catch (error) {
            console.log(error)
            
        }
    }

    const getOrders = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API}/api/v1/auth/all-orders`
        );
        setOrders(data);
      } catch (error) {
        console.log(error);
      }
    };

    useEffect(() => {
      if (auth?.token) getOrders();
    }, [auth?.token]);
    return (
      <Layout title={"All Orders Data"}>
        <div className="container-fluid m-3 p-3 dashboard">
          <div className="row">
            <div className="col-md-3">
              <AdminMenu />
            </div>
            <div className="col-md-9">
              <h1 className="text-center">All Orders</h1>
              <div className="border shadow">
                <table class="table">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Status</th>
                      <th scope="col">Buyer</th>
                      <th scope="col">Date</th>
                      <th scope="col">Payment</th>
                      <th scope="col">Quantity</th>
                    </tr>
                  </thead>
                  {orders.map((o, i) => {
                    return (
                      <tbody>
                        <tr>
                          <td>{i + 1}</td>
                          <td>
                            <Select
                              bordered={false}
                              onChange={(value) => handleChange(o._id, value)}
                              defaultValue={o?.status}
                            >
                              {status.map((s, i) => (
                                <Option key={i} value={s}>
                                  {s}
                                </Option>
                              ))}
                            </Select>
                          </td>
                          <td>{o?.buyer?.name}</td>
                          <td>{moment(o?.createAt).fromNow()}</td>
                          <td>{o?.payments ? "Success" : "Failed"}</td>
                          <td>{o?.products?.length}</td>
                        </tr>
                        <tr>
                          <div className="container">
                            {o?.products?.map((p, i) => (
                              <div
                                className="row mb-2 p-3 card flex-row"
                                key={p._id}
                              >
                                <div className="col-md-4">
                                  <img
                                    src={`${process.env.REACT_APP_API}/api/v1/product/get-photo/${p._id}`}
                                    className="card-img-top"
                                    alt={p.name}
                                    width="100px"
                                    height={"100px"}
                                  />
                                </div>
                                <div className="col-md-8">
                                  <p>{p.name}</p>
                                  {/* <p>{p.description.substring(0, 30)}</p> */}
                                  <p>Price : ₹{p.price}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </tr>
                      </tbody>
                    );
                  })}
                </table>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
}

export default AdminOrders