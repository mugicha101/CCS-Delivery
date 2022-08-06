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
    Object.keys(userData.cart).map((key, index) => {
        if (key === "next_id")
            return;
        let p = {id: key, data: userData.cart[key]};
        cartList.push(p);
    })
    cartList.sort(((a, b) => {
       return a.id - b.id;
    }));

    return (<div>
        <h2>cart</h2>
        <div class="cartList">
        {
            cartList.map((p) => {
                <p>{p.id}</p>
            })
        }
        </div>
    </div>)
}

export default Cart;