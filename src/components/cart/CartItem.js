import { Button, TextField } from "@mui/material";
import { httpsCallable } from "firebase/functions";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../contexts/UserContext";

function CartItem({id, itemData, amount, updateData}) {
    const [formAmount, setFormAmount] = useState(amount);
    const [waiting, setWaiting] = useState(false);

    const addToCart = httpsCallable(useContext(UserContext).functions, 'addToCart');

    let formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    });
  
    return (<div key="itemData.name" class="cartItem">
        <div class="cartItemInfo">
            <h4>{itemData? itemData.name: "Removed Item"}</h4>
            {itemData && <h5><em>{itemData.vendor.toUpperCase()}</em></h5>}
        </div>

        <div class="itemCounter">
            <Button 
                variant="outlined"
                sx={{width: "25%", padding: 1, minWidth: 0}}
            >
                T
            </Button>
            <TextField sx={{width: "50%"}}>sasdsa</TextField>
            <Button 
                variant="outlined"
                sx={{width: "25%", padding: 1, minWidth: 0}}
            >
                T
            </Button>
        </div>
        
        {itemData && amount > itemData.amount && <p>WARNING: Order exceeds available stock</p>}
        {/* {itemData && <h4>Cost: {formatter.format(itemData.cost * amount) + " (" + formatter.format(itemData.cost) + " per " + itemData.unit + ")"}</h4>} */}
        {/* <form onSubmit={async (e) => {
            e.preventDefault();
            setWaiting(true);
            await addToCart({id: id, amount: formAmount == ""? 0 : formAmount, relative: false});
            await updateData();
            setWaiting(false);
        }}>
            <label htmlFor="amount">Amount: </label>
            <input id="amount" type="number" value={formAmount ?? ""} onChange={(e) => {setFormAmount(e.target.value == "" ? "" : (parseInt(e.target.value) < 0? 0 : parseInt(e.target.value)))}}></input>
            {formAmount != amount && <input type="submit" disabled={waiting} value="Set"></input>}
        </form> */}
    </div>);
}

export default CartItem;