import { useEffect, useState, useContext } from "react";
import {UserContext} from "../../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import {app} from '../../firebase.js';
import { getDatabase, ref, get, set, child } from "firebase/database";
import CartItem from "./CartItem.js";
import { httpsCallable } from "firebase/functions";

function Cart({isLoaded, user, userData, updateData}) {
    let navigate = useNavigate();

    const transaction = httpsCallable(useContext(UserContext).functions, 'transaction');
    
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

    let cartList = [];
    if (userData != null && userData.cart != null) {
        Object.keys(userData.cart).map((key, index) => {
            let p = {id: key, amount: userData.cart[key]};
            cartList.push(p);
        });
        cartList.sort();
    }

    let totalCost = 0;
    let valid = true;
    console.log(cartList);
    for (let i = 0; i < cartList.length; i++) {
        let p = cartList[i];
        totalCost += storeData && storeData.data && p.id in storeData.data? storeData.data[p.id].cost * p.amount : 0;
        if (!storeData || !storeData.data || !(p.id in storeData.data) || !(p.id in storeData.active)|| storeData.data[p.id].amount < p.amount)
            valid = false;
    }

    let formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    });

    return (<div>
        <h2>cart</h2>
        <div className="cartList">
        {
            cartList.map((p) => {
                let storeItem = storeData.data && p.id in storeData.data? storeData.data[p.id] : null;
                return <CartItem id={p.id} itemData={storeItem} amount={p.amount} key={p.name} updateData={updateData}/>
            })
        }
        <h3>Total Cost: {formatter.format(totalCost)}</h3>
        <button onClick={async (e) => {
            setWaiting(true);
            await transaction({localStoreData: storeData, localCartData: userData.cart});
            await updateData();
            setWaiting(false);
        } } disabled={!valid || waiting}>Finish Order</button>
        </div>
    </div>)
}

export default Cart;