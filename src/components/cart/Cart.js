import { useEffect, useState, useContext } from "react";
import {UserContext} from "../../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import {app} from '../../firebase.js';
import { getDatabase, ref, get, set, child } from "firebase/database";
import CartItem from "./CartItem.js";

function Cart({isLoaded, user, userData}) {
    let navigate = useNavigate();
    
    const [storeData, setStoreData] = useState({})
    
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
        console.log(cartList);
    }

    return (<div>
        <h2>cart</h2>
        <div class="cartList">
        {
            cartList.map((p) => {
                let storeItem = storeData[p.id];
                return <CartItem itemData={storeItem} amount={p.amount}/>
            })
        }
        <button>Check Out</button>
        </div>
    </div>)
}

export default Cart;