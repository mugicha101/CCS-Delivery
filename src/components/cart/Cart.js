import { useEffect, useState, useContext } from "react";
import {UserContext} from "../../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import {app} from '../../firebase.js';
import { getDatabase, ref, get, set, child } from "firebase/database";
import CartItem from "./CartItem.js";
import { httpsCallable } from "firebase/functions";
import { Button, Drawer } from "@mui/material";
import "./Cart.css";

function Cart({ open, setOpen }) {
    let navigate = useNavigate();

    const transaction = httpsCallable(useContext(UserContext).functions, 'transaction');
    
    const [storeData, setStoreData] = useState({})
    const [waiting, setWaiting] = useState(false);
    
    const { isLoaded, user, data, updateData, db } = useContext(UserContext);

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
    if (data != null && data.cart != null) {
        Object.keys(data.cart).map((key, index) => {
            let p = {id: key, amount: data.cart[key]};
            cartList.push(p);
        });
        cartList.sort();
    }

    let totalCost = 0;
    let valid = true;
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

    let onClick = async () => {
        setWaiting(true);
        await transaction({localStoreData: storeData, localCartData: data.cart});
        await updateData();
        setWaiting(false);
    }

    return (<div>
        <Drawer
            anchor="right"
            // variant="persistent"
            open={open}
            onClose={(e) => setOpen(false)}
            PaperProps={{
                sx: {
                    width: "40%"
                }
            }}
        >
            <div class="cartHeader">
                <div class="headerText">
                    <h2>Cart</h2>
                </div>
                <Button 
                    onClick={() => setOpen(false)}
                    variant="contained"
                    sx={{
                        borderRadius: 0, 
                        height: "100%", 
                        width: "30%"
                    }}
                >
                    Close
                </Button>
            </div>
            <div class="cartWrapper">
                {
                    cartList.map((p) => {
                        let storeItem = storeData.data && p.id in storeData.data? storeData.data[p.id] : null;
                        return <CartItem id={p.id} itemData={storeItem} amount={p.amount} key={p.name} updateData={updateData}/>
                    })
                }
            </div>
            <div class="cartFooter">
                <Button 
                    onClick={onClick} 
                    disabled={!valid || waiting}
                    variant="contained"
                    fullWidth
                    sx={{
                        borderRadius: 0, 
                        height: "100%"
                    }}
                >
                    Finish Order ({formatter.format(totalCost)})
                </Button>
            </div>
        </Drawer>
        
    </div>)
}

export default Cart;