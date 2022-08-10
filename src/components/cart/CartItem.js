import { useState } from "react";

function CartItem({itemData, amount}) {
    const [formAmount, setFormAmount] = useState(amount);

    return (<div>
        <h3>{itemData? itemData.name + " x" + amount : "Removed Item"}</h3>
        {itemData && amount > itemData.amount && <p>WARNING: Order exceeds available stock</p>}
        <form>
            <label for="amount">Amount: </label>
            <input id="amount" type="number" value={amount} onChange={(e) => {setFormAmount(parseInt(e.target.value))}}></input>
            {formAmount != amount && <input type="submit" value="Change" on></input>}
        </form>
    </div>);
}

export default CartItem;