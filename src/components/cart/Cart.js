import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {app} from '../../firebase.js';
import { getDatabase, ref, get, set, child } from "firebase/database";

function Cart({isLoaded, user, userData}) {
    let navigate = useNavigate();

    useEffect(() => {
        if (isLoaded && !user) {
            navigate("..", {replace: true});
        }
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
                return <p>{`${p.id}: ${p.amount}`}</p>
            })
        }
        </div>
    </div>)
}

export default Cart;