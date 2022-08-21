import { httpsCallable } from "firebase/functions";
import { useContext, useState } from "react";
import { UserContext } from "../../contexts/UserContext";

function OrderEntry({time=0, data={}, storeData={}, updateData=function() {}, waiting=false, setWaiting=function() {}}) {
    const auth = getAuth();
    const refundOrder = httpsCallable(useContext(UserContext).functions, 'refundOrder');

    if (storeData == null || storeData.data == null)
        return (<div><h2>Loading</h2></div>);

    let date = new Date(time);

    let formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    });

    let totalCost = 0;
    for (let key in data.items) {
        totalCost += storeData.data[key].cost * data.items[key];
    }

    let handleRefund = async () => {
        setWaiting(true);
        await refundOrder(data={uid: null, orderTime: time})
        await updateData();
        setWaiting(false);
    }
    return (
        <div>
            <p>{date.toLocaleString()}</p>
            {Object.keys(data.items).map((key) => {
                let item = storeData.data[key];
                let amount = data.items[key];
                return <p>{item.name} x{amount} {formatter.format(item.cost * amount)} {amount > 1 && "(" + (formatter.format(item.cost) + " each)")}</p>
            })}
            <p>Total Cost: {formatter.format(totalCost)}</p>
            <button disabled={waiting} onClick={(e) => {e.preventDefault(); handleRefund();}}>Refund</button>
        </div>)
}

export default OrderEntry;