import { useEffect, useState, useContext } from "react";
import {UserContext} from "../../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import {app} from '../../firebase.js';
import { getDatabase, ref, get, set, child } from "firebase/database";
import { httpsCallable } from "firebase/functions";
import OrderEntry from "./OrderEntry";

function Cart({isLoaded, user, userData, updateData}) {
    let navigate = useNavigate();
    
    const [storeData, setStoreData] = useState({})
    const [waiting, setWaiting] = useState(false);
    
    const db = useContext(UserContext).db;

    const loadStore = async () => {
        let storeRef = ref(db, "store");
        let snap = await get(storeRef);
        if (snap.exists()) {
            setStoreData(snap.val());
        }
    }

    useEffect(() => {
        if (isLoaded && !user) {
            navigate("..", {replace: true});
            return;
        }
        loadStore();
    }, [isLoaded, user])

    let orderList = [];
    if (userData != null && userData.orders != null) {
        Object.keys(userData.orders).map((time, index) => {
            let o = {time: parseInt(time), data: userData.orders[time]};
            orderList.push(o);
        });
        orderList.sort((a, b) => {
            return (b.time > a.time? 1 : -1) + (b.data.delivered? 0 : 2) - (a.data.delivered? 0 : 2);
        });
    }

    return (<div>
        <h2>orders</h2>
        <div className="cartList">
        {
            orderList.map((o) => {
                return <OrderEntry time={o.time} data={o.data} storeData={storeData} updateData={updateData} waiting={waiting} setWaiting={setWaiting}/>
            })
        }
        </div>
    </div>)
}

export default Cart;