import { useEffect, useState, React } from "react";
import axios from "axios";
import { useAuth } from "../../context/Auth";
import { Outlet } from "react-router-dom";
import Spinner from "../Spinner";

     
export const PrivateRoute = ()=>{
    const [ok, setOk] = useState(false);
    const [auth, setAuth] = useAuth();

    useEffect(() => {
        const authCheck = async () => {
            const res = await axios.get(`${process.env.REACT_APP_API}/api/v1/auth/user-auth`);
            if (res.data.ok) {
                setOk(true);
            }
            else {
                setOk(false);
            }
        }
        if (auth?.token) authCheck();
    }, [auth?.token])

    return (ok ? <Outlet /> : <Spinner path="login"/>);
}