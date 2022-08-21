import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {app} from '../../firebase.js';
import { getDatabase, ref, get, set, child } from "firebase/database";
import StoreItem from "./StoreItem";
import { Grid } from "@mui/material";
import "./Store.css";

function Store({isLoaded, user, db, updateData}) {
    const [products, setProducts] = useState({});

    let navigate = useNavigate();

    useEffect(() => {
        if (isLoaded && !user) {
            navigate("..", {replace: true});
        }

        // load data from firebase
        if (isLoaded && Object.keys(products).length === 0) {
            get(ref(db, 'store')).then((snapshot) => {
                if (snapshot.exists()) {
                    let store = snapshot.val();
                    let prods = {};
                    for (let id in store.active) {
                        if (store.active[id] == id)
                            prods[id] = store.data[id];
                    }
                    setProducts(prods);
                } else {
                    return null;
                }
            });
        }
    }, [isLoaded, user])

    let productList = [];
    Object.keys(products).map((key, index) => {
        let p = products[key];
        p.id = key;
        productList.push(p);
    })
    productList.sort((a, b) => {
       return ((a.amount === 0? 1 : 0) - (b.amount === 0? 1 : 0)) * 100 + a.name.localeCompare(b.name);
    })

    return (<div>
        <Grid container spacing={3}>
        {productList.map((p) => {
            return <StoreItem 
                key={p.id}
                updateData={updateData} 
                id={p.id} 
                name={p.name} 
                description={p.description} 
                cost={p.cost} 
                amount={p.amount} 
                retrieval_method={p.retrieval_method} 
                unit={p.unit} 
                vendor={p.vendor}
            />
        })}
        </Grid>
    </div>)
}

export default Store;