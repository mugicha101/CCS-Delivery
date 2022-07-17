import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {app} from '../../firebase.js';
import { getDatabase, ref, get, set, child } from "firebase/database";
import {GoogleAuthProvider, signInWithPopup, getAuth, signInWithRedirect, reload} from 'firebase/auth';
import StoreItem from "./StoreItem";
import "./Store.css";

const provider = new GoogleAuthProvider();
const auth = getAuth();

const db = getDatabase();
const dbRef = ref(db);

function Store({isLoaded, user}) {
    const [products, setProducts] = useState({});

    let navigate = useNavigate();

    useEffect(() => {
        if (isLoaded && !user) {
            navigate("..", {replace: true});
        }

        // load data from firebase
        if (isLoaded && Object.keys(products).length === 0) {
            console.log(auth);
            get(ref(db, 'store')).then((snapshot) => {
                if (snapshot.exists()) {
                    console.log(snapshot.val());
                    setProducts(snapshot.val());
                } else {
                    return null;
                }
            });
        }
    }, [isLoaded, user])

    return (<div>
        <h2>store</h2>
        {Object.keys(products).map((key, index) => {
            let p = products[key];
            return <div>
                <StoreItem name={p.name} description={p.description} cost={p.cost} amount={p.amount} retrieval_method={p.retrieval_method} unit={p.unit} vendor={p.vendor}/>
            </div>
        })}
    </div>)
}

export default Store;